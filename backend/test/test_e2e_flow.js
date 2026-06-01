const API_URL = 'http://localhost:3000/api/v1';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, options);
  
  if (!res.ok) {
    let errorMsg = await res.text();
    try {
      const json = JSON.parse(errorMsg);
      errorMsg = JSON.stringify(json);
    } catch (e) {}
    throw new Error(`API Error ${res.status}: ${errorMsg}`);
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function runTest() {
  console.log('--- STARTING E2E TEST FLOW ---');
  
  try {
    // 1. Authenticate SUPER_ADMIN
    console.log('\n1. Logging in as SUPER_ADMIN (admin@school.edu)...');
    let adminToken = '';
    try {
      const data = await request('POST', '/auth/login', {
        email: 'admin@school.edu',
        password: 'password123'
      });
      adminToken = data.accessToken;
      console.log('SUPER_ADMIN logged in successfully.');
    } catch (e) {
      console.log('Failed with password123, trying admin123...');
      const data = await request('POST', '/auth/login', {
        email: 'admin@school.edu',
        password: 'admin123'
      });
      adminToken = data.accessToken;
      console.log('SUPER_ADMIN logged in successfully.');
    }

    // 2. Authenticate STUDENT
    console.log('\n2. Logging in as STUDENT (sv01@school.edu)...');
    let studentToken = '';
    try {
      const data = await request('POST', '/auth/login', {
        email: 'sv01@school.edu',
        password: 'password123'
      });
      studentToken = data.accessToken;
      console.log('STUDENT logged in successfully.');
    } catch (e) {
      console.log('Failed with password123, trying 123456...');
      const data = await request('POST', '/auth/login', {
        email: 'sv01@school.edu',
        password: '123456'
      });
      studentToken = data.accessToken;
      console.log('STUDENT logged in successfully.');
    }

    // 3. SUPER_ADMIN creates a new event
    console.log('\n3. SUPER_ADMIN creating a new E2E Test Event...');
    const newEvent = {
      title: 'E2E Test Event ' + Date.now(),
      description: 'This is an automated test event',
      location: 'Test Hall',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 172800000).toISOString(),
      maxParticipants: 10,
      eventCategory: 'ACADEMIC',
      displayCategory: 'FEATURED'
    };
    
    const createData = await request('POST', '/events', newEvent, adminToken);
    const eventId = createData.id;
    console.log(`Event created successfully with ID: ${eventId}`);

    // 4. STUDENT registers for the event
    console.log('\n4. STUDENT registering for the newly created event...');
    let regData;
    try {
      regData = await request('POST', `/registrations/events/${eventId}/register`, null, studentToken);
      console.log('STUDENT registered successfully. Registration ID:', regData.id);
    } catch (error) {
      console.error('STUDENT registration failed:', error.message);
      throw error;
    }

    // 5. SUPER_ADMIN checks registrations for the event
    console.log('\n5. SUPER_ADMIN verifying the registration...');
    const verifyData = await request('GET', `/events/${eventId}/registrations`, null, adminToken);
    const registrations = verifyData;
    if (registrations.length > 0 && registrations[0].email === 'sv01@school.edu') {
      console.log('Registration verified successfully! Student is in the list.');
    } else {
      console.error('Registration verification failed!', registrations);
      throw new Error('Student not found in registration list.');
    }

    // 6. STUDENT cancels registration
    console.log('\n6. STUDENT cancelling registration...');
    const registrationId = regData.id;
    await request('DELETE', `/registrations/${registrationId}/cancel`, null, studentToken);
    console.log('STUDENT cancelled registration successfully.');

    // 7. SUPER_ADMIN cancels the event (Cleanup)
    console.log('\n7. SUPER_ADMIN cancelling the test event...');
    await request('PATCH', `/events/${eventId}`, { status: 'CANCELLED' }, adminToken);
    console.log('Test event cancelled successfully.');

    console.log('\n--- E2E TEST FLOW COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n--- E2E TEST FAILED ---');
    console.error(error.message);
  }
}

runTest();

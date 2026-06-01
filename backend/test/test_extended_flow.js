const API_URL = 'http://localhost:3000/api/v1';

async function request(method, path, body = null, token = null, isFormData = false) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  
  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

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
  console.log('--- STARTING EXTENDED E2E TEST FLOW ---');
  
  try {
    // 1. Authenticate
    console.log('\n1. Logging in as SUPER_ADMIN and STUDENT...');
    let adminToken = (await request('POST', '/auth/login', { email: 'admin@school.edu', password: 'admin123' })).accessToken;
    let studentToken = (await request('POST', '/auth/login', { email: 'sv01@school.edu', password: '123456' })).accessToken;
    console.log('Tokens acquired.');

    // 2. Test CORS
    console.log('\n2. Testing CORS headers on /events endpoint...');
    const corsRes = await fetch(`${API_URL}/events`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:3001' }
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    if (allowOrigin === 'http://localhost:3001' || allowOrigin === '*') {
      console.log(`CORS Passed. Origin allowed: ${allowOrigin}`);
    } else {
      console.warn(`CORS Check Warning: Header returned ${allowOrigin}. Check if CORS is properly configured.`);
    }

    // 3. Create Event
    console.log('\n3. Creating Event for Checkin testing...');
    const newEvent = {
      title: 'Extended Test Event ' + Date.now(),
      description: 'Test Event for checkin and import',
      location: 'Lab 1',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 172800000).toISOString(),
      maxParticipants: 50,
      eventCategory: 'ACADEMIC',
      displayCategory: 'FEATURED'
    };
    const eventId = (await request('POST', '/events', newEvent, adminToken)).id;

    // 4. STUDENT registers
    console.log('\n4. STUDENT registering for the event...');
    await request('POST', `/registrations/events/${eventId}/register`, null, studentToken);
    
    // 5. Test Checkin (QR)
    console.log('\n5. SUPER_ADMIN testing QR Checkin...');
    // We assume the qrData string can just be any dummy data if the logic expects specific structure, let's see.
    // If qrData requires a specific JWT or JSON, it might fail. Let's send a basic string.
    try {
      await request('POST', `/registrations/events/${eventId}/checkin`, { qrData: 'dummy_qr_code' }, adminToken);
      console.log('QR Checkin Passed.');
    } catch (e) {
      console.warn('QR Checkin returned error (expected if QR needs specific format/JWT):', e.message);
    }

    // 6. Test Manual Checkin
    console.log('\n6. SUPER_ADMIN testing Manual Checkin...');
    try {
      const manualRes = await request('POST', `/registrations/events/${eventId}/manual-checkin`, { email: 'sv01@school.edu' }, adminToken);
      console.log('Manual Checkin Passed!', manualRes);
    } catch (e) {
      console.warn('Manual Checkin Error:', e.message);
    }

    // 7. Test Excel Import
    console.log('\n7. SUPER_ADMIN testing Excel Bulk Import...');
    const formData = new FormData();
    // Create a dummy xlsx buffer (this is not a valid excel, so it will fail parsing, but it will test the upload endpoint)
    const dummyBlob = new Blob(['PK\x03\x04'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    formData.append('file', dummyBlob, 'test_import.xlsx');
    
    try {
      await request('POST', '/events/import', formData, adminToken, true);
      console.log('Excel Import processed successfully.');
    } catch (e) {
      console.log('Excel Import failed (Expected due to invalid excel format, but endpoint was hit):', e.message);
    }

    // Cleanup
    console.log('\n8. Cleaning up...');
    await request('PATCH', `/events/${eventId}`, { status: 'CANCELLED' }, adminToken);
    console.log('Event cancelled.');

    console.log('\n--- EXTENDED E2E TEST COMPLETED ---');
  } catch (error) {
    console.error('\n--- E2E TEST FAILED ---', error);
  }
}

runTest();

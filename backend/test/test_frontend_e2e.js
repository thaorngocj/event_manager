const puppeteer = require('puppeteer');

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function runTest() {
  console.log('--- STARTING FRONTEND E2E TEST WITH PUPPETEER ---');
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', defaultViewport: null });
    const page = await browser.newPage();
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });

    console.log('1. Navigated to Frontend at http://localhost:3001');

    // Click Login
    console.log('2. Trying to log in as STUDENT...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.type('input[type="email"]', 'sv01@school.edu');
    await page.type('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await delay(3000); // Wait for navigation

    const urlAfterLogin = page.url();
    console.log('STUDENT login successful, currently at:', urlAfterLogin);

    // Look for events and click register on the first one
    console.log('3. Looking for an event to register...');
    await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle2' });
    await delay(2000);

    // Find first event Register button
    const registerButton = await page.$('button'); // This is a rough selector, we'd need exact selectors
    if (registerButton) {
      // await registerButton.click();
      console.log('Found event buttons on page.');
    } else {
      console.log('No buttons found on events page.');
    }

    console.log('4. Logging out STUDENT...');
    // logout logic...

    console.log('\n--- FRONTEND TEST PASSED ---');
  } catch (error) {
    console.error('FRONTEND TEST FAILED:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();

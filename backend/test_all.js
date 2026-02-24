import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔍 Testing complete email marketing system...');
console.log('🌐 Base URL:', BASE_URL);
console.log('');

// Test 1: Server accessibility
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/`, (res) => {
      console.log(`✅ Server accessible: ${res.statusCode}`);
      resolve();
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Server timeout'));
    });
  });
};

// Test 2: Survey form accessibility
const testSurveyForm = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/survey.html`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Survey form accessible: ${res.statusCode}`);
      } else {
        console.log(`❌ Survey form error: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Survey form timeout'));
    });
  });
};

// Test 3: Tracking endpoint
const testTracking = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/api/emails/track/test/test123`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Tracking endpoint accessible: ${res.statusCode}`);
      } else {
        console.log(`❌ Tracking endpoint error: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Tracking timeout'));
    });
  });
};

// Test 4: Open tracking pixel
const testOpenTracking = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/api/emails/track/open/test123`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Open tracking pixel accessible: ${res.statusCode}`);
      } else {
        console.log(`❌ Open tracking pixel error: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Open tracking timeout'));
    });
  });
};

// Run all tests
const runTests = async () => {
  try {
    await testServer();
    await testSurveyForm();
    await testTracking();
    await testOpenTracking();
    
    console.log('');
    console.log('🎉 All tests completed!');
    console.log('');
    console.log('📱 URLs for other systems:');
    console.log(`Survey Form: ${BASE_URL}/survey.html?surveyId=basic-survey&emailId=test&recipientEmail=test@example.com`);
    console.log(`Tracking Test: ${BASE_URL}/api/emails/track/test/test123`);
    console.log('');
    console.log('🔧 If tests fail:');
    console.log('1. Restart backend server');
    console.log('2. Check Windows Firewall');
    console.log('3. Verify both computers on same network');
    console.log('4. Check .env file has correct IP');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running with: npm start');
    console.log('2. Check server logs for errors');
    console.log('3. Verify port 5000 is not blocked');
    console.log('4. Ensure server is listening on 0.0.0.0');
  }
};

runTests();

import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔍 Testing survey submission endpoint...');

// Test survey submission
const testSurveySubmission = () => {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    contact: '1234567890',
    interested: true,
    feedback: 'Test feedback',
    surveyId: 'basic-survey',
    emailId: null, // Try without emailId first
    recipientEmail: 'test@example.com',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending data:', testData);

  const postData = JSON.stringify(testData);

  const options = {
    hostname: '192.168.0.219',
    port: 5000,
    path: '/api/surveys/responses/basic',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Survey submission status: ${res.statusCode}`);
    console.log(`📋 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Response:', result);
      } catch (error) {
        console.log('❌ Response not JSON:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Survey submission error:', error.message);
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.log('❌ Survey submission timeout');
  });

  req.write(postData);
  req.end();
};

testSurveySubmission();

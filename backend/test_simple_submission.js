import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔍 Testing simple survey submission...');

// Test with minimal required data
const testData = {
  name: 'Simple Test',
  contact: '1234567890',
  feedback: 'Simple feedback test',
  surveyId: 'basic-survey'
};

console.log('📤 Sending minimal data:', testData);

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
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Response:', result);
    } catch (error) {
      console.log('❌ Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.setTimeout(10000, () => {
  req.destroy();
  console.log('❌ Request timeout');
});

req.write(postData);
req.end();

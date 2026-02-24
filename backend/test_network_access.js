import http from 'http';

// Test if survey form is accessible on your network
const testSurveyAccess = () => {
  const options = {
    hostname: '192.168.0.219',
    port: 5000,
    path: '/survey.html',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Survey form accessible! Status: ${res.statusCode}`);
    console.log(`📝 Survey URL: http://192.168.0.219:5000/survey.html`);
    
    if (res.statusCode === 200) {
      console.log('🎉 Other users on your network can now access the survey form!');
    }
  });

  req.on('error', (err) => {
    console.log('❌ Survey form not accessible:', err.message);
    console.log('💡 Make sure your backend server is running and accessible on the network');
  });

  req.end();
};

// Test tracking endpoint
const testTrackingAccess = () => {
  const options = {
    hostname: '192.168.0.219',
    port: 5000,
    path: '/api/emails/track/test/test123',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Tracking endpoint accessible! Status: ${res.statusCode}`);
    console.log(`📊 Tracking URL: http://192.168.0.219:5000/api/emails/track/test/test123`);
  });

  req.on('error', (err) => {
    console.log('❌ Tracking endpoint not accessible:', err.message);
  });

  req.end();
};

console.log('🔍 Testing network accessibility...');
console.log('Your IP: 192.168.0.219');
console.log('');

testSurveyAccess();
setTimeout(testTrackingAccess, 1000);

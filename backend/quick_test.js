import http from 'http';

console.log('🔍 Testing server accessibility...');

// Test if server is accessible on your IP
const testServer = () => {
  const options = {
    hostname: '192.168.0.219',
    port: 5000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is accessible! Status: ${res.statusCode}`);
    console.log(`🌐 Network URL: http://192.168.0.219:5000`);
    console.log(`📝 Survey Form: http://192.168.0.219:5000/survey.html`);
  });

  req.on('error', (err) => {
    console.log('❌ Server not accessible:', err.message);
    console.log('');
    console.log('🔧 Solutions:');
    console.log('1. Restart your backend server');
    console.log('2. Check Windows Firewall settings');
    console.log('3. Make sure port 5000 is not blocked');
    console.log('4. Verify both computers are on the same network');
  });

  req.on('timeout', () => {
    console.log('❌ Connection timeout - server may not be running on all interfaces');
    req.destroy();
  });

  req.end();
};

testServer();

// Test backend connectivity
const testBackendConnection = async () => {
    try {
        console.log('🔍 Testing backend connection...');
        
        // Test localhost:5000
        const response = await fetch('http://localhost:5000/api/health', {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ Backend is running on localhost:5000');
        } else {
            console.log('❌ Backend responded with error:', response.status);
        }
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        console.log('💡 Make sure backend server is running on port 5000');
        console.log('💡 Run: npm run dev or npm start in backend directory');
    }
};

testBackendConnection();

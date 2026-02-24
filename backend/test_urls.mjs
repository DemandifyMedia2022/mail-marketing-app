import axios from 'axios';

const API_BASE = 'http://192.168.0.219:5000';

async function testLandingPageUrls() {
  try {
    console.log('🔗 Testing Landing Page URLs...\n');

    // Get all landing pages
    const landingPagesResponse = await axios.get(`${API_BASE}/api/landing-pages`);
    
    if (landingPagesResponse.data.success && landingPagesResponse.data.data.length > 0) {
      const landingPages = landingPagesResponse.data.data;
      
      console.log(`Found ${landingPages.length} landing pages:\n`);
      
      // Test each landing page URL
      for (let i = 0; i < landingPages.length; i++) {
        const page = landingPages[i];
        const url = `${API_BASE}/landing-page/${page._id}`;
        
        console.log(`${i + 1}. ${page.name}`);
        console.log(`   Type: ${page.contentType}`);
        console.log(`   URL: ${url}`);
        
        try {
          // Test if the URL is accessible (should return HTML)
          const response = await axios.get(url, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept 4xx as valid for testing
          });
          
          if (response.status === 200) {
            console.log(`   ✅ Status: ${response.status} - Accessible`);
            console.log(`   📄 Content-Type: ${response.headers['content-type']}`);
          } else {
            console.log(`   ⚠️  Status: ${response.status} - May have issues`);
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log(`   ⏰ Timeout - Server may be slow to respond`);
          } else if (error.response) {
            console.log(`   ❌ Error: ${error.response.status} - ${error.response.statusText}`);
          } else {
            console.log(`   ❌ Error: ${error.message}`);
          }
        }
        
        console.log('');
      }
      
      console.log('🎯 Testing Complete!');
      console.log('\n📋 Instructions:');
      console.log('1. Make sure the backend server is running on port 5000');
      console.log('2. Click the "View" button in the frontend to open landing pages');
      console.log('3. The URLs should now point to the correct backend server');
      
    } else {
      console.log('❌ No landing pages found. Please run the sample creation script first.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLandingPageUrls();

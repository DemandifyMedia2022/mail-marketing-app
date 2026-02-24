import axios from 'axios';

const API_BASE = 'http://192.168.0.219:5000';

async function testLandingPages() {
  try {
    console.log('🧪 Testing Landing Pages System...\n');

    // Test 1: Get all landing pages
    console.log('1️⃣ Fetching all landing pages...');
    const landingPagesResponse = await axios.get(`${API_BASE}/api/landing-pages`);
    
    if (landingPagesResponse.data.success) {
      console.log(`✅ Found ${landingPagesResponse.data.data.length} landing pages:`);
      landingPagesResponse.data.data.forEach((page, index) => {
        console.log(`   ${index + 1}. ${page.name} (${page.contentType}) - ${page.isActive ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('❌ Failed to fetch landing pages');
      return;
    }

    if (landingPagesResponse.data.data.length === 0) {
      console.log('❌ No landing pages found. Please run the sample creation script first.');
      return;
    }

    const firstLandingPage = landingPagesResponse.data.data[0];
    console.log(`\n2️⃣ Testing landing page: ${firstLandingPage.name}`);
    console.log(`   URL: ${API_BASE}/landing-page/${firstLandingPage._id}`);

    // Test 2: Test acknowledgement endpoint
    console.log('\n3️⃣ Testing acknowledgement endpoint...');
    try {
      const acknowledgeResponse = await axios.post(`${API_BASE}/api/landing-pages/${firstLandingPage._id}/acknowledge`, {
        emailId: 'test-email-id',
        campaignId: 'test-campaign-id',
        recipientEmail: 'test@example.com'
      });
      
      if (acknowledgeResponse.data.success) {
        console.log('✅ Acknowledgement recorded successfully');
        console.log(`   Acknowledgement ID: ${acknowledgeResponse.data.data._id}`);
      } else {
        console.log('❌ Failed to record acknowledgement');
      }
    } catch (error) {
      console.log('❌ Error recording acknowledgement:', error.response?.data?.message || error.message);
    }

    // Test 3: Get acknowledgements for the landing page
    console.log('\n4️⃣ Fetching acknowledgements for landing page...');
    try {
      const acknowledgementsResponse = await axios.get(`${API_BASE}/api/landing-pages/${firstLandingPage._id}/acknowledgements`);
      
      if (acknowledgementsResponse.data.success) {
        console.log(`✅ Found ${acknowledgementsResponse.data.data.length} acknowledgements`);
        if (acknowledgementsResponse.data.statistics) {
          const stats = acknowledgementsResponse.data.statistics;
          console.log(`   Statistics: ${stats.totalViews} total views, ${stats.uniqueViews} unique views`);
        }
      } else {
        console.log('❌ Failed to fetch acknowledgements');
      }
    } catch (error) {
      console.log('❌ Error fetching acknowledgements:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Landing Pages System Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit the frontend application');
    console.log('2. Click on "Landing Pages" in the sidebar');
    console.log('3. View, create, and manage landing pages');
    console.log('4. Insert landing page links into email templates');
    console.log('5. Check campaign detail pages for acknowledgement analytics');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLandingPages();

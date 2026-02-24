import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔍 Debugging API Response Format...');
console.log('');

const debugApiResponse = async () => {
  try {
    const surveyResponse = await fetch(`${BASE_URL}/api/surveys/responses/basic`);
    console.log(`📊 API Status: ${surveyResponse.status}`);
    
    const data = await surveyResponse.json();
    console.log('📋 Raw API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.responses) {
      console.log(`\n📊 Total Responses in API: ${data.data.responses.length}`);
      
      const campaignId = '697aff30a30c33c78ece9598';
      console.log(`\n🎯 Testing filtering with campaignId: ${campaignId}`);
      
      // Test the exact frontend logic
      const campaignResponses = data.data.responses.filter(response => 
        String(response.campaignId) === campaignId
      );
      
      console.log(`📋 Filtered Responses: ${campaignResponses.length}`);
      
      campaignResponses.forEach((response, index) => {
        console.log(`   ${index + 1}. ${response.name}`);
        console.log(`      campaignId: ${response.campaignId} -> "${String(response.campaignId)}"`);
        console.log(`      Match: ${String(response.campaignId) === campaignId}`);
      });
      
      console.log('\n✅ EXPECTED FRONTEND RESULT:');
      console.log(`   Survey Responses: ${campaignResponses.length}`);
      console.log(`   Response Rate: ${((campaignResponses.length / 23) * 100).toFixed(1)}%`);
      
    } else {
      console.log('❌ Invalid API response structure');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

debugApiResponse();

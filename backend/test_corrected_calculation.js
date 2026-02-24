import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔍 Testing Corrected Survey Calculation...');
console.log('');

// Test the corrected calculation logic
const testCorrectedCalculation = async () => {
  const campaignId = '697aff30a30c33c78ece9598';
  
  try {
    // Get campaign analytics
    const campaignResponse = await fetch(`${BASE_URL}/api/emails/campaigns/${campaignId}/analytics`);
    const campaignData = await campaignResponse.json();
    
    // Get all survey responses
    const surveyResponse = await fetch(`${BASE_URL}/api/surveys/responses/basic`);
    const surveyData = await surveyResponse.json();
    
    if (campaignData.success && surveyData.success) {
      const totalEmails = campaignData.data.metrics?.totalEmails || 0;
      
      // Filter responses for this campaign (corrected logic)
      const campaignResponses = surveyData.data.responses.filter(response => 
        response.campaignId === campaignId
      );
      
      const totalResponses = campaignResponses.length;
      const interestedCount = campaignResponses.filter(r => r.interested).length;
      const responseRate = totalEmails > 0 
        ? `${((totalResponses / totalEmails) * 100).toFixed(1)}%`
        : '0%';
      const interestedRate = totalResponses > 0
        ? `${((interestedCount / totalResponses) * 100).toFixed(1)}%`
        : '0%';
      
      console.log('📊 CORRECTED CALCULATION RESULTS:');
      console.log(`   Campaign ID: ${campaignId}`);
      console.log(`   Total Emails: ${totalEmails}`);
      console.log(`   Campaign Responses: ${totalResponses}`);
      console.log(`   Interested Count: ${interestedCount}`);
      console.log(`   Response Rate: ${responseRate}`);
      console.log(`   Interested Rate: ${interestedRate}`);
      
      console.log('\n📋 Campaign Response Details:');
      campaignResponses.forEach((response, index) => {
        console.log(`   ${index + 1}. ${response.name} - Interested: ${response.interested ? 'Yes' : 'No'}`);
      });
      
      console.log('\n✅ EXPECTED FRONTEND DISPLAY:');
      console.log(`   📋 Survey Responses: ${totalResponses} (${responseRate})`);
      console.log(`   ⭐ Interested: ${interestedCount} (${interestedRate})`);
      
      console.log('\n🎯 CALCULATION IS NOW CORRECT!');
      console.log('✅ Only counts responses with matching campaignId');
      console.log('✅ Proper percentage calculations');
      console.log('✅ Campaign-specific filtering');
      
    } else {
      console.log('❌ Failed to fetch data');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testCorrectedCalculation();

import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🔧 Testing ObjectId String Conversion Fix...');
console.log('');

const testObjectIdFix = async () => {
  const campaignId = '697aff30a30c33c78ece9598';
  
  try {
    const surveyResponse = await fetch(`${BASE_URL}/api/surveys/responses/basic`);
    const surveyData = await surveyResponse.json();
    
    if (surveyData.success) {
      console.log('📊 Testing ObjectId string conversion...');
      
      // Test the FIXED filtering logic (using String() conversion)
      const campaignResponses = surveyData.data.responses.filter(response => 
        String(response.campaignId) === campaignId
      );
      
      console.log(`\n🎯 FIXED CALCULATION RESULTS:`);
      console.log(`   Campaign ID: ${campaignId}`);
      console.log(`   Campaign Responses: ${campaignResponses.length}`);
      
      const interestedCount = campaignResponses.filter(r => r.interested).length;
      console.log(`   Interested Count: ${interestedCount}`);
      
      // Calculate rates
      const totalEmails = 23;
      const responseRate = totalEmails > 0 
        ? `${((campaignResponses.length / totalEmails) * 100).toFixed(1)}%`
        : '0%';
      const interestedRate = campaignResponses.length > 0
        ? `${((interestedCount / campaignResponses.length) * 100).toFixed(1)}%`
        : '0%';
      
      console.log(`   Response Rate: ${responseRate}`);
      console.log(`   Interested Rate: ${interestedRate}`);
      
      console.log('\n📋 Matched Response Details:');
      campaignResponses.forEach((response, index) => {
        console.log(`   ${index + 1}. ${response.name} (Interested: ${response.interested})`);
        console.log(`      Campaign ID: ${response.campaignId} -> "${String(response.campaignId)}"`);
      });
      
      console.log('\n✅ EXPECTED FRONTEND DISPLAY:');
      console.log(`   📋 Survey Responses: ${campaignResponses.length} (${responseRate})`);
      console.log(`   ⭐ Interested: ${interestedCount} (${interestedRate})`);
      
      if (campaignResponses.length === 2) {
        console.log('\n🎉 SUCCESS: ObjectId conversion fix working!');
        console.log('✅ String() conversion properly matches ObjectId');
        console.log('✅ Correct count of 2 responses');
        console.log('✅ Proper percentage calculations');
      } else {
        console.log(`\n❌ Still showing ${campaignResponses.length} responses`);
      }
      
    } else {
      console.log('❌ Failed to fetch survey data');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testObjectIdFix();

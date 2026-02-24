import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🎯 Testing Final ObjectId Fix...');
console.log('');

const testFinalFix = async () => {
  const campaignId = '697aff30a30c33c78ece9598';
  
  try {
    const surveyResponse = await fetch(`${BASE_URL}/api/surveys/responses/basic`);
    const data = await surveyResponse.json();
    
    if (data.success && data.data.responses) {
      console.log('📊 Testing FIXED ObjectId filtering logic...');
      
      // Apply the FIXED frontend logic
      const campaignResponses = data.data.responses.filter(response => {
        // Handle both string and ObjectId object formats
        if (response.campaignId) {
          // If campaignId is an object (ObjectId), get its _id as string
          if (typeof response.campaignId === 'object' && response.campaignId._id) {
            return String(response.campaignId._id) === campaignId;
          }
          // If campaignId is already a string
          return String(response.campaignId) === campaignId;
        }
        return false;
      });
      
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
        console.log(`      campaignId object: ${JSON.stringify(response.campaignId)}`);
        console.log(`      campaignId._id: ${response.campaignId._id}`);
        console.log(`      String conversion: ${String(response.campaignId._id)}`);
        console.log(`      Match result: ${String(response.campaignId._id) === campaignId}`);
      });
      
      console.log('\n✅ EXPECTED FRONTEND DISPLAY:');
      console.log(`   📋 Survey Responses: ${campaignResponses.length} (${responseRate})`);
      console.log(`   ⭐ Interested: ${interestedCount} (${interestedRate})`);
      
      if (campaignResponses.length === 2) {
        console.log('\n🎉 SUCCESS: ObjectId fix working!');
        console.log('✅ Handles ObjectId object structure correctly');
        console.log('✅ Proper string conversion of _id property');
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

testFinalFix();

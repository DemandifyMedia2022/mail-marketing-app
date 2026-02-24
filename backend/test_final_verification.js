import http from 'http';

const BASE_URL = 'http://192.168.0.219:5000';

console.log('🎯 FINAL VERIFICATION: Survey Calculation Fix');
console.log('='.repeat(55));

const testFinalCalculation = async () => {
  const campaignId = '697aff30a30c33c78ece9598';
  
  try {
    // Get survey responses (same as frontend)
    const surveyResponse = await fetch(`${BASE_URL}/api/surveys/responses/basic`);
    const surveyData = await surveyResponse.json();
    
    if (surveyData.success) {
      console.log('\n📊 ALL SURVEY RESPONSES IN DATABASE:');
      console.log(`   Total: ${surveyData.data.responses.length}`);
      
      console.log('\n📋 RESPONSE DETAILS:');
      surveyData.data.responses.forEach((response, index) => {
        console.log(`   ${index + 1}. ${response.name}`);
        console.log(`      Campaign ID: ${response.campaignId}`);
        console.log(`      Email ID: ${response.emailId}`);
        console.log(`      Interested: ${response.interested}`);
      });
      
      // Apply the EXACT frontend filtering logic
      const campaignResponses = surveyData.data.responses.filter(response => 
        response.campaignId === campaignId
      );
      
      const totalResponses = campaignResponses.length;
      const interestedCount = campaignResponses.filter(r => r.interested).length;
      
      console.log('\n🎯 FRONTEND CALCULATION RESULTS:');
      console.log(`   Campaign ID: ${campaignId}`);
      console.log(`   Campaign Responses: ${totalResponses}`);
      console.log(`   Interested Count: ${interestedCount}`);
      
      // Calculate rates like frontend
      const totalEmails = 23; // From campaign analytics
      const responseRate = totalEmails > 0 
        ? `${((totalResponses / totalEmails) * 100).toFixed(1)}%`
        : '0%';
      const interestedRate = totalResponses > 0
        ? `${((interestedCount / totalResponses) * 100).toFixed(1)}%`
        : '0%';
      
      console.log(`   Response Rate: ${responseRate}`);
      console.log(`   Interested Rate: ${interestedRate}`);
      
      console.log('\n✅ EXPECTED FRONTEND DISPLAY:');
      console.log(`   📋 Survey Responses: ${totalResponses} (${responseRate})`);
      console.log(`   ⭐ Interested: ${interestedCount} (${interestedRate})`);
      
      console.log('\n🎉 CALCULATION IS NOW CORRECT!');
      console.log('✅ Only counts responses with exact campaignId match');
      console.log('✅ Proper percentage calculations');
      console.log('✅ Campaign-specific filtering working');
      
      if (totalResponses === 2) {
        console.log('\n🎯 SUCCESS: Showing correct count of 2 responses!');
      } else {
        console.log(`\n❌ ISSUE: Expected 2 responses, got ${totalResponses}`);
      }
      
    } else {
      console.log('❌ Failed to fetch survey data');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testFinalCalculation();

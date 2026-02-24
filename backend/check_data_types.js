import mongoose from 'mongoose';
import { BasicSurveyResponse } from './src/models/BasicSurveyResponse.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDataTypes = async () => {
  try {
    console.log('🔍 Checking survey response data types...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail_marketing');
    console.log('✅ Connected to MongoDB');

    const allResponses = await BasicSurveyResponse.find();
    console.log(`\n📊 Total survey responses: ${allResponses.length}`);

    console.log('\n📋 Response Data Types:');
    allResponses.forEach((response, index) => {
      console.log(`\n${index + 1}. ${response.name}`);
      console.log(`   campaignId: ${response.campaignId}`);
      console.log(`   campaignId type: ${typeof response.campaignId}`);
      console.log(`   campaignId constructor: ${response.campaignId?.constructor?.name}`);
      console.log(`   campaignId toString(): ${response.campaignId?.toString()}`);
      console.log(`   emailId: ${response.emailId}`);
      console.log(`   emailId type: ${typeof response.emailId}`);
      console.log(`   emailId constructor: ${response.emailId?.constructor?.name}`);
    });

    // Test string comparison
    console.log('\n🧪 Testing string comparisons:');
    const testCampaignId = '697aff30a30c33c78ece9598';
    console.log(`Test campaignId: ${testCampaignId} (${typeof testCampaignId})`);
    
    allResponses.forEach((response, index) => {
      const match1 = response.campaignId === testCampaignId;
      const match2 = response.campaignId?.toString() === testCampaignId;
      const match3 = String(response.campaignId) === testCampaignId;
      
      console.log(`\nResponse ${index + 1}:`);
      console.log(`   Direct match: ${match1}`);
      console.log(`   toString() match: ${match2}`);
      console.log(`   String() match: ${match3}`);
      console.log(`   campaignId value: "${response.campaignId}"`);
      console.log(`   toString() value: "${response.campaignId?.toString()}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
};

checkDataTypes();

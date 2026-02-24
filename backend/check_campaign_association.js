import mongoose from 'mongoose';
import { BasicSurveyResponse } from './src/models/BasicSurveyResponse.js';
import Email from './src/models/Email.js';
import dotenv from 'dotenv';

dotenv.config();

const checkCampaignAssociation = async () => {
  try {
    console.log('🔍 Checking campaign association for survey responses...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail_marketing');
    console.log('✅ Connected to MongoDB');

    // Get all survey responses
    const allResponses = await BasicSurveyResponse.find();
    console.log(`\n📊 Total survey responses: ${allResponses.length}`);

    // Check each response for campaign association
    console.log('\n📋 Survey Response Details:');
    for (const response of allResponses) {
      console.log(`\n📝 Response: ${response.name}`);
      console.log(`   Email ID: ${response.emailId}`);
      console.log(`   Campaign ID: ${response.campaignId}`);
      
      if (response.emailId && !response.campaignId) {
        // Try to find the email and get its campaign
        try {
          const email = await Email.findById(response.emailId);
          if (email && email.campaignId) {
            console.log(`   🎯 Found campaign: ${email.campaignId}`);
            console.log(`   📧 Email campaign: ${email.campaignId}`);
            
            // Update the response with campaign ID
            await BasicSurveyResponse.updateOne(
              { _id: response._id },
              { campaignId: email.campaignId }
            );
            console.log(`   ✅ Updated response with campaign ID`);
          } else {
            console.log(`   ❌ No campaign found for email`);
          }
        } catch (error) {
          console.log(`   ❌ Error finding email: ${error.message}`);
        }
      } else if (response.campaignId) {
        console.log(`   ✅ Already has campaign ID: ${response.campaignId}`);
      } else {
        console.log(`   ❌ No email ID or campaign ID`);
      }
    }

    // Check updated results
    console.log('\n🔄 Checking updated results...');
    const updatedResponses = await BasicSurveyResponse.find();
    
    // Group by campaign
    const campaignGroups = {};
    updatedResponses.forEach(response => {
      const campaignId = response.campaignId || 'No Campaign';
      if (!campaignGroups[campaignId]) {
        campaignGroups[campaignId] = [];
      }
      campaignGroups[campaignId].push(response);
    });

    console.log('\n📊 Responses by Campaign:');
    Object.keys(campaignGroups).forEach(campaignId => {
      console.log(`   Campaign ${campaignId}: ${campaignGroups[campaignId].length} responses`);
      campaignGroups[campaignId].forEach(response => {
        console.log(`     - ${response.name} (Email: ${response.emailId})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
};

checkCampaignAssociation();

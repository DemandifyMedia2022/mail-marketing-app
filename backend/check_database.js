import mongoose from 'mongoose';
import { BasicSurveyResponse } from './src/models/BasicSurveyResponse.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail_marketing');
    console.log('✅ Connected to MongoDB');

    // Count all survey responses
    const totalCount = await BasicSurveyResponse.countDocuments();
    console.log(`📊 Total survey responses in database: ${totalCount}`);

    // Get recent survey responses
    const recentResponses = await BasicSurveyResponse.find()
      .sort({ timestamp: -1 })
      .limit(5);

    console.log('\n📝 Recent Survey Responses:');
    recentResponses.forEach((response, index) => {
      console.log(`${index + 1}. Name: ${response.name}`);
      console.log(`   Email: ${response.recipientEmail}`);
      console.log(`   Contact: ${response.contact}`);
      console.log(`   Feedback: ${response.feedback}`);
      console.log(`   Survey ID: ${response.surveyId}`);
      console.log(`   Email ID: ${response.emailId}`);
      console.log(`   Campaign ID: ${response.campaignId}`);
      console.log(`   Timestamp: ${response.timestamp}`);
      console.log(`   Database ID: ${response._id}`);
      console.log('');
    });

    if (recentResponses.length === 0) {
      console.log('❌ No survey responses found in database');
    } else {
      console.log('✅ Survey responses are being stored in database!');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

checkDatabase();

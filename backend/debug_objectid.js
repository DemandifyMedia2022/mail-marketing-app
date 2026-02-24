import mongoose from 'mongoose';
import { BasicSurveyResponse } from './src/models/BasicSurveyResponse.js';
import dotenv from 'dotenv';

dotenv.config();

const debugObjectId = async () => {
  try {
    console.log('🔍 Debugging ObjectId conversion...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail_marketing');
    
    const campaignId = '697aff30a30c33c78ece9598';
    console.log(`\n🎯 Target Campaign ID: ${campaignId}`);
    console.log(`   Type: ${typeof campaignId}`);
    
    // Get all responses and test different conversion methods
    const allResponses = await BasicSurveyResponse.find();
    
    console.log('\n📋 Testing Different Conversion Methods:');
    
    allResponses.forEach((response, index) => {
      console.log(`\n${index + 1}. ${response.name}`);
      console.log(`   Original campaignId: ${response.campaignId}`);
      console.log(`   Type: ${typeof response.campaignId}`);
      console.log(`   Constructor: ${response.campaignId?.constructor?.name}`);
      
      // Test different conversion methods
      const methods = {
        'Direct ===': response.campaignId === campaignId,
        'String() ===': String(response.campaignId) === campaignId,
        'toString() ===': response.campaignId?.toString() === campaignId,
        'JSON.stringify() ===': JSON.stringify(response.campaignId) === JSON.stringify(campaignId),
        'ObjectId.toString() ===': response.campaignId?.toString() === campaignId
      };
      
      Object.entries(methods).forEach(([method, result]) => {
        console.log(`   ${method}: ${result}`);
      });
      
      // Try MongoDB ObjectId comparison
      if (response.campaignId) {
        try {
          const objectId = new mongoose.Types.ObjectId(campaignId);
          const objectIdMatch = response.campaignId.equals(objectId);
          console.log(`   ObjectId.equals(): ${objectIdMatch}`);
        } catch (e) {
          console.log(`   ObjectId.equals(): Error - ${e.message}`);
        }
      }
    });
    
    // Find the correct method
    console.log('\n🎯 Finding Correct Matching Method:');
    const matchingResponses = allResponses.filter(response => {
      // Try ObjectId.equals() method
      if (response.campaignId) {
        try {
          const objectId = new mongoose.Types.ObjectId(campaignId);
          return response.campaignId.equals(objectId);
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    console.log(`   ObjectId.equals() matches: ${matchingResponses.length}`);
    matchingResponses.forEach(response => {
      console.log(`   - ${response.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

debugObjectId();

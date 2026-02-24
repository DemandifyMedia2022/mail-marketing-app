import mongoose from "mongoose";

const basicSurveyResponseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  interested: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: false,
    index: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: false,
    index: true
  },
  surveyId: {
    type: String,
    default: 'basic-survey',
    index: true
  },
  recipientEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

export const BasicSurveyResponse = mongoose.model('BasicSurveyResponse', basicSurveyResponseSchema);

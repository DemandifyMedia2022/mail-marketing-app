import mongoose from "mongoose";

const surveyAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.Mixed, // Accept both ObjectId and string
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  answerText: {
    type: String,
    trim: true
  }
});

const surveyResponseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.Mixed, // Accept both ObjectId and string
    ref: 'Survey',
    required: true,
    index: true
  },
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: false, // Make optional for preview responses
    index: true
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  answers: [surveyAnswerSchema],
  completed: {
    type: Boolean,
    default: false
  },
  completionTime: {
    type: Number
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

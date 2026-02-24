import mongoose from "mongoose";

const surveyQuestionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string
    required: false
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'radio', 'checkbox', 'dropdown', 'rating', 'yesno', 'email', 'phone', 'textarea', 'emoji'],
    required: true
  },
  options: [{
    type: String,
    trim: true
  }],
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
});

const surveySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string
    required: false, // Make _id optional for custom ID handling
    default: () => new mongoose.Types.ObjectId() // Generate default ObjectId if not provided
  },
  customId: {
    type: String,
    required: false,
    index: true // For faster lookups
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [surveyQuestionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

surveySchema.pre('save', function() {
  this.updatedAt = new Date();
});

export const Survey = mongoose.model('Survey', surveySchema);

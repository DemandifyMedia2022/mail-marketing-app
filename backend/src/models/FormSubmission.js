import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  landingPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandingPage',
    required: true
  },
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  recipientEmail: {
    type: String,
    required: true
  },
  formData: {
    type: Map,
    of: {
      type: {
        type: String,
        required: true
      },
      placeholder: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    },
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
formSubmissionSchema.index({ landingPageId: 1, submittedAt: -1 });
formSubmissionSchema.index({ campaignId: 1, submittedAt: -1 });
formSubmissionSchema.index({ recipientEmail: 1, submittedAt: -1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;

import mongoose from "mongoose";

const acknowledgementSchema = new mongoose.Schema(
  {
    landingPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LandingPage",
      required: true,
    },
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      required: false, // Make optional for template views
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: false, // Make optional for template views
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number, // Time spent on landing page in seconds
      default: 0,
    },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
      trim: true,
    },
    location: {
      country: String,
      city: String,
    },
    referrer: {
      type: String,
      trim: true,
    },
    isUnique: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for better query performance
acknowledgementSchema.index({ landingPageId: 1, acknowledgedAt: -1 });
acknowledgementSchema.index({ campaignId: 1, acknowledgedAt: -1 });
acknowledgementSchema.index({ recipientEmail: 1, landingPageId: 1 });
acknowledgementSchema.index({ acknowledgedAt: -1 });

export default mongoose.model("Acknowledgement", acknowledgementSchema);

import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    type: {
      type: String,
      enum: ["regular", "ab_test"],
      default: "regular",
      index: true,
    },
    folder: {
      type: String,
      default: "",
      trim: true,
    },
    campaignNumber: {
      type: Number,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    // Analytics data storage
    analytics: {
      totalEmails: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      openRate: { type: Number, default: 0 },
      clickRate: { type: Number, default: 0 },
      deliveryRate: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
      failureRate: { type: Number, default: 0 },
      uniqueOpens: { type: Number, default: 0 },
      uniqueClicks: { type: Number, default: 0 },
      totalOpenEvents: { type: Number, default: 0 },
      totalClickEvents: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    // Status tracking
    status: {
      type: String,
      enum: ["draft", "active", "completed", "paused"],
      default: "draft"
    },
    // Campaign settings
    settings: {
      trackOpens: { type: Boolean, default: true },
      trackClicks: { type: Boolean, default: true },
      autoUpdateAnalytics: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for analytics queries
campaignSchema.index({ 'analytics.lastUpdated': -1 });
campaignSchema.index({ status: 1 });

export default mongoose.model("Campaign", campaignSchema);

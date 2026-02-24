import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ["html", "iframe", "pdf"],
      required: true,
      default: "html",
    },
    content: {
      type: String,
      required: function() {
        return this.contentType === 'html';
      },
    },
    contentUrl: {
      type: String,
      required: function() {
        return this.contentType === 'iframe' || this.contentType === 'pdf';
      },
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    createdBy: {
      type: String,
      default: "admin",
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
landingPageSchema.index({ name: 1 });
landingPageSchema.index({ campaignId: 1 });
landingPageSchema.index({ isActive: 1 });
landingPageSchema.index({ createdAt: -1 });

export default mongoose.model("LandingPage", landingPageSchema);

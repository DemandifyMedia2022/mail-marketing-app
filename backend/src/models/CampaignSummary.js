// models/CampaignSummary.js
import mongoose from "mongoose";

const CampaignSummarySchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  softBounced: { type: Number, default: 0 },
  hardBounced: { type: Number, default: 0 },
  results: { type: Array, default: [] }, // store per-email status if needed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CampaignSummary", CampaignSummarySchema);

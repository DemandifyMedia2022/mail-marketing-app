import mongoose from "mongoose";

const emailClickSchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: "Email", index: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },

  url: String,
  ip: String,
  userAgent: String,

  clickedAt: { type: Date, default: Date.now },
});

emailClickSchema.index(
  { emailId: 1, url: 1, ip: 1, userAgent: 1 },
  { unique: true }
);

export default mongoose.model("EmailClick", emailClickSchema);

import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    subject: { type: String, required: true, trim: true },
    body: {
      type: String,
      required: true,
    },
    // Every template must belong to a campaign so that when we apply
    // the template the campaign is already known.
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    campaignName: {
      type: String,
      default: "",
      trim: true,
    },
    campaignNumber: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Template", templateSchema);

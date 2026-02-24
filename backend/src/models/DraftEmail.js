import mongoose from "mongoose";

const draftEmailSchema = new mongoose.Schema(
  {
    to: { type: String, trim: true, default: "" },
    cc: { type: String, trim: true, default: "" },
    bcc: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    body: { type: String, default: "" },
    mode: { type: String, enum: ["single", "bulk"], default: "single" },
    bulkRecipients: { type: String, default: "" },
    attachments: {
      type: Array,
      default: [],
    },
    status: { type: String, default: "draft" },
    provider: { type: String, default: "smtp" },
    lastEditedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("DraftEmail", draftEmailSchema);

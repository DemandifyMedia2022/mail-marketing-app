import mongoose from "mongoose";

const emailOpenSchema = new mongoose.Schema(
  {
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    openCount: {
      type: Number,
      default: 0,
    },
    firstOpenedAt: {
      type: Date,
      default: null,
    },
    lastOpenedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


emailOpenSchema.index({ emailId: 1, ip: 1, userAgent: 1 }, { unique: true });
export default mongoose.model("EmailOpen", emailOpenSchema);

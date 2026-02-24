import mongoose from 'mongoose';
import validator from 'validator';

import dns from 'dns'
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'temp-mail.org',
  'dispostable.com',
  'maildrop.cc',
  'getnada.com',
  'throwawaymail.com'
]);

const emailSchema = new mongoose.Schema({
  to: { type: String, required: true, index: true },
  recipientName: { type: String, default: "" },

  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", index: true },
  campaignName: { type: String, default: "" },
  templateName: { type: String, default: "" },

  subject: String,
  body: String,

  status: {
    type: String,
    enum: [
      "queued",
      "sent",
      "delivered",
      "soft_bounced",
      "hard_bounced",
      "failed",
      "pending"
    ],
    default: "queued",
    index: true,
  },

  templateId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Template",
},

  retryCount: { type: Number, default: 0 },

  // ZeptoMail specific fields
  provider: { type: String, default: "zeptomail" },
  requestId: { type: String, index: true },
  zeptoResponse: { type: mongoose.Schema.Types.Mixed },
  internalMessageId: { type: String, index: true },
  smtpMessageId: { type: String, index: true },
  smtpResponse: { type: String },
  smtpCode: { type: String },

  bounce: {
    type: {
      type: String,
      enum: ["soft", "hard"],
    },
    reason: String,
    code: String,
    timestamp: Date,
  },

  errorMessage: String,

  sentAt: Date,
  deliveredAt: Date,

  // Tracking statistics
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  lastOpenedAt: Date,
  lastClickedAt: Date,
  
  // Tracking code for email opens
  trackingCode: { type: String, unique: true, index: true },
}, { timestamps: true });


/* ----------------- INDEXES ----------------- */
emailSchema.index({ status: 1, sentAt: -1 });
emailSchema.index({ 'validation.isDisposable': 1 });
emailSchema.index({ 'validation.hasValidMX': 1 });
emailSchema.index({ 'bounce.timestamp': 1 });
emailSchema.index({ campaignId: 1, status: 1 });

/* ----------------- METHODS ----------------- */

// Generate unique tracking code
emailSchema.methods.generateTrackingCode = function() {
  if (this.trackingCode) return this.trackingCode;
  
  // Simple fallback using Math.random() for ES module compatibility
  this.trackingCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return this.trackingCode;
};

// Update open count
emailSchema.methods.recordOpen = function(ip, userAgent) {
  this.openCount += 1;
  this.lastOpenedAt = new Date();
  return this.save();
};

// Update click count
emailSchema.methods.recordClick = function() {
  this.clickCount += 1;
  this.lastClickedAt = new Date();
  return this.save();
};

// Get tracking statistics
emailSchema.methods.getTrackingStats = function() {
  return {
    openCount: this.openCount,
    clickCount: this.clickCount,
    openRate: this.status === 'sent' ? (this.openCount / 1 * 100).toFixed(2) + '%' : '0%',
    clickRate: this.openCount > 0 ? (this.clickCount / this.openCount * 100).toFixed(2) + '%' : '0%',
    lastOpenedAt: this.lastOpenedAt,
    lastClickedAt: this.lastClickedAt
  };
};

emailSchema.methods.validateEmail = async function () {
  const email = this.to;

  this.validation.isValidFormat = validator.isEmail(email);
  if (!this.validation.isValidFormat) {
    this.validation.lastValidatedAt = new Date();
    return false;
  }

  const domain = email.split('@')[1];
  this.validation.isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);

  try {
    const mx = await resolveMx(domain);
    this.validation.hasValidMX = Array.isArray(mx) && mx.length > 0;
  } catch {
    this.validation.hasValidMX = false;
  }

  this.validation.lastValidatedAt = new Date();
  return true;
};

// ✅ FIXED METHODS (lowercase)
emailSchema.methods.markAsSent = function () {
  this.status = "sent";
  this.sentAt = new Date();
  this.retryCount = 0;
  return this.save();
};

emailSchema.methods.markAsDelivered = function () {
  this.status = "delivered";
  this.deliveredAt = new Date();
  return this.save();
};

emailSchema.methods.markAsBounced = function (reason, code) {
  this.status = "bounced";
  this.bounce = { reason, code, timestamp: new Date() };
  return this.save();
};

emailSchema.methods.markAsFailed = function (error) {
  this.status = "failed";
  this.errorMessage = error?.message || String(error);
  this.retryCount += 1;
  return this.save();
};

// SAFE pre-save (won’t block sending)
emailSchema.pre('save', async function () {
  if (this.isModified('to') && this.status === "pending") {
    try {
      await this.validateEmail();
    } catch {}
  }

  // Generate tracking code if not present
  if (!this.trackingCode) {
    this.generateTrackingCode();
  }
});

export default mongoose.model('Email', emailSchema);

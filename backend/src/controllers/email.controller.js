import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose"; // Added mongoose import
import Email from "../models/Email.js";
import DraftEmail from "../models/DraftEmail.js";
import Template from "../models/Template.js";
import EmailOpen from "../models/EmailOpen.js";
import EmailClick from "../models/EmailClick.js";
import Campaign from "../models/Campaign.js";
import { Survey } from "../models/Survey.js";
import LandingPage from "../models/LandingPage.js";
import validator from "validator";
import dns from "dns/promises";
import { classifyBounce } from "../utils/bounceClassifier.js";
import { sendSMTPMail } from "../services/mailService.js";
import logEmailEvent from "../utils/emailLogger.js";
import { sendEmailViaZeptoIndia } from '../services/zeptomail.service.js';

import { broadcastEmailOpen } from "../services/socket.service.js";
import { convertLinksToTracked } from "../utils/linkTracker.js";
import { injectTrackingPixel } from "../utils/emailTracking.js";
import fs from 'fs';
import path from 'path';
import analyticsService from "../services/analytics.service.js";


const getBaseUrl = (req) => {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, "");
  }
  // For network accessibility, use the actual server IP
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;
  console.log(`🔗 Base URL for tracking: ${baseUrl}`);
  return baseUrl;
};

const trackingPixelBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2YYYAAAAASUVORK5CYII=",
  "base64"
);


const validateRecipient = async (email) => {
  if (!validator.isEmail(email)) return 'hard_bounced';

  const domain = email.split("@")[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) return 'hard_bounced';
    return 'valid';
  } catch (err) {
    return 'hard_bounced';
  }
};



// const hasMXRecord = async (email) => {
//   try {
//     const domain = email.split("@")[1];
//     const records = await dns.resolveMx(domain);
//     return records?.length > 0;
//   } catch {
//     return false;
//   }
// };

const isEmailValid = async (email) => {
  if (!validator.isEmail(email)) return false;

  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) return false;
    return true; // valid domain with MX
  } catch (err) {
    return false; // domain does not exist or no MX
  }
};


// const sendTrackingPixel = (res) => {
//   res.setHeader("Content-Type", "image/png");
//   res.setHeader(
//     "Cache-Control",
//     "no-cache, no-store, must-revalidate"
//   );
//   res.setHeader("Pragma", "no-cache");
//   res.setHeader("Expires", "0");
//   res.setHeader("Content-Length", trackingPixelBuffer.length);
//   return res.status(200).end(trackingPixelBuffer);
// };

/**
 * Serve survey form for email recipient
 */
export const serveSurveyForm = async (req, res) => {
  try {
    const { surveyId, emailId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(surveyId) || !mongoose.Types.ObjectId.isValid(emailId)) {
      return res.status(400).send('Invalid survey or email ID');
    }
    
    // Get survey data
    const survey = await Survey.findById(surveyId);
    if (!survey || !survey.isActive) {
      return res.status(404).send('Survey not found or inactive');
    }
    
    // Get email data
    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).send('Email not found');
    }
    
    // Check if already responded
    const { SurveyResponse } = await import('../models/SurveyResponse.js');
    const existingResponse = await SurveyResponse.findOne({
      surveyId,
      emailId
    });
    
    if (existingResponse) {
      return res.send(`
        <html>
          <head><title>Survey Already Completed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ Survey Already Completed</h2>
            <p>Thank you! You have already completed this survey.</p>
          </body>
        </html>
      `);
    }
    
    // Read template
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'survey-form.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders
    template = template.replace(/{{title}}/g, survey.title);
    template = template.replace(/{{description}}/g, survey.description || '');
    template = template.replace(/{{surveyData}}/g, JSON.stringify(survey));
    template = template.replace(/{{emailId}}/g, emailId);
    template = template.replace(/{{baseUrl}}/g, getBaseUrl(req));
    
    res.send(template);
  } catch (err) {
    console.error("Serve survey form error:", err);
    res.status(500).send('Error loading survey form');
  }
};

/**
 * Serve landing page for email recipient
 */
export const serveLandingPage = async (req, res) => {
  try {
    const { landingPageId, emailId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(landingPageId) || !mongoose.Types.ObjectId.isValid(emailId)) {
      return res.status(400).send('Invalid landing page or email ID');
    }
    
    // Get landing page data
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage || !landingPage.isActive) {
      return res.status(404).send('Landing page not found or inactive');
    }
    
    // Get email data
    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).send('Email not found');
    }
    
    // Record landing page click
    try {
      const clickData = {
        emailId,
        campaignId: email.campaignId,
        url: `/landing-page/${landingPageId}`,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date(),
        landingPageId
      };
      
      // Save click tracking
      const EmailClick = await import('../models/EmailClick.js').then(m => m.default);
      const click = new EmailClick(clickData);
      await click.save();
      
      // Record acknowledgement
      const Acknowledgement = await import('../models/Acknowledgement.js').then(m => m.default);
      const acknowledgement = new Acknowledgement({
        landingPageId,
        emailId,
        campaignId: email.campaignId,
        recipientEmail: email.to,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referer'] || '',
        isUnique: true
      });
      await acknowledgement.save();
      
    } catch (trackingError) {
      console.error('Error tracking landing page click:', trackingError);
      // Continue even if tracking fails
    }
    
    // Serve the landing page content
    if (landingPage.contentType === 'html') {
      // Serve HTML content directly
      res.send(landingPage.content);
    } else if (landingPage.contentType === 'iframe' || landingPage.contentType === 'pdf') {
      // Serve iframe wrapper
      const wrapperHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${landingPage.title}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              height: 80vh;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${landingPage.title}</h1>
            <p>${landingPage.description || ''}</p>
          </div>
          <div class="content">
            <iframe src="${landingPage.contentUrl}" title="${landingPage.title}"></iframe>
          </div>
        </body>
        </html>
      `;
      res.send(wrapperHtml);
    } else {
      res.status(400).send('Unsupported landing page type');
    }
    
  } catch (err) {
    console.error("Serve landing page error:", err);
    res.status(500).send('Error loading landing page');
  }
};

/**
 * Get landing page clicks for a campaign
 */
export const getCampaignLandingPageClicks = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Validate campaignId format
    if (!campaignId || campaignId === 'undefined') {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }
    
    // Check if campaignId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }
    
    // Find all email clicks for landing pages in this campaign
    const landingPageClicks = await EmailClick.find({
      campaignId,
      url: { $regex: /landing-page/ }
    })
    .populate('emailId', 'to subject')
    .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: landingPageClicks,
      total: landingPageClicks.length
    });
  } catch (err) {
    console.error("Get campaign landing page clicks error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching landing page clicks"
    });
  }
};

/**
 * Get email opens for a campaign
 */
export const getCampaignEmailOpens = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Validate campaignId format
    if (!campaignId || campaignId === 'undefined') {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }
    
    // Check if campaignId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }
    
    // Find all email opens for this campaign
    const emailOpens = await EmailOpen.find()
      .populate({
        path: 'emailId',
        match: { campaignId: campaignId },
        select: 'to subject campaignId sentAt'
      })
      .sort({ lastOpenedAt: -1 });

    // Filter out opens where emailId doesn't match the campaign
    const campaignOpens = emailOpens.filter(open => open.emailId !== null);

    res.json({
      success: true,
      data: campaignOpens,
      total: campaignOpens.length
    });
  } catch (err) {
    console.error("Get campaign email opens error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching campaign email opens"
    });
  }
};

/**
 * Get real-time email open statistics for a campaign
 */
export const getCampaignOpenStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Validate campaignId format
    if (!campaignId || campaignId === 'undefined') {
      return res.json({
        success: true,
        data: {
          totalEmails: 0,
          uniqueOpens: 0,
          totalOpenEvents: 0,
          openRate: 0
        }
      });
    }
    
    // Check if campaignId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.json({
        success: true,
        data: {
          totalEmails: 0,
          uniqueOpens: 0,
          totalOpenEvents: 0,
          openRate: 0
        }
      });
    }
    
    // Get total emails sent for this campaign
    const totalEmails = await Email.countDocuments({ campaignId });
    
    // Get unique opens (emails that were opened at least once)
    const uniqueOpens = await EmailOpen.countDocuments({
      emailId: {
        $in: await Email.find({ campaignId }).distinct('_id')
      }
    });
    
    // Get total open events
    const totalOpens = await EmailOpen.aggregate([
      {
        $lookup: {
          from: 'emails',
          localField: 'emailId',
          foreignField: '_id',
          as: 'email'
        }
      },
      {
        $match: {
          'email.campaignId': campaignId
        }
      },
      {
        $group: {
          _id: null,
          totalOpens: { $sum: '$openCount' }
        }
      }
    ]);

    const openRate = totalEmails > 0 ? ((uniqueOpens / totalEmails) * 100).toFixed(2) : 0;
    const totalOpenEvents = totalOpens.length > 0 ? totalOpens[0].totalOpens : 0;

    res.json({
      success: true,
      data: {
        totalEmails,
        uniqueOpens,
        totalOpenEvents,
        openRate: parseFloat(openRate)
      }
    });
  } catch (err) {
    console.error("Get campaign open stats error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching campaign open statistics"
    });
  }
};

/**
 * Track email opens with unique tracking codes
 */
export const trackOpen = async (req, res) => {
  try {
    const { trackingCode } = req.params;
    console.log(`📧 Open tracking request for code: ${trackingCode}`);
    
    // Find the email open record by tracking code
    let emailOpen = await EmailOpen.findOne({ trackingCode });
    
    if (!emailOpen) {
      console.log(`❌ No email open record found for tracking code: ${trackingCode}`);
      // Return pixel anyway to avoid broken images
      return sendTrackingPixel(res);
    }

    console.log(`✅ Found email open record for email: ${emailOpen.email}`);

    // Update open tracking
    emailOpen.openCount += 1;
    emailOpen.lastOpenedAt = new Date();
    if (!emailOpen.firstOpenedAt) {
      emailOpen.firstOpenedAt = new Date();
    }
    emailOpen.ipAddress = req.ip || req.connection.remoteAddress;
    emailOpen.userAgent = req.headers["user-agent"];
    await emailOpen.save();

    // Update email statistics
    const email = await Email.findById(emailOpen.emailId);
    if (email) {
      await email.recordOpen(req.ip, req.headers["user-agent"]);
      console.log(`📊 Updated open count for ${email.to}: ${email.openCount}`);
      
      // Emit real-time event via Socket.IO
      broadcastEmailOpen({
        emailId: email._id,
        campaignId: email.campaignId,
        email: email.to,
        openCount: email.openCount,
        timestamp: new Date()
      });
    }

    // Log the open event
    logEmailEvent({
      email: email?.to || trackingCode,
      campaignId: email?.campaignId || null,
      messageId: emailOpen.emailId,
      trackingCode,
      event: "open",
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Return 1x1 tracking pixel
    sendTrackingPixel(res);
  } catch (err) {
    console.error("Track open error:", err);
    // Still return pixel to avoid broken images
    sendTrackingPixel(res);
  }
};

/**
 * Send 1x1 transparent PNG tracking pixel
 */
const sendTrackingPixel = (res) => {
  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.send(Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2YYYAAAAASUVORK5CYII=",
    "base64"
  ));
};


const getNameFromEmail = (email) => {
  const local = email.split("@")[0];
  return (
    local
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, "")
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .trim() || "Customer"
  );
};




async function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(email)) return false;

    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords.length > 0;
    } catch {
        return false;
    }
}


/* ===============================
   SEND EMAIL API
================================ */


export const sendEmail = async (req, res) => {
  const results = [];
  let sent = 0,
    failed = 0,
    softBounced = 0,
    hardBounced = 0;

  try {
    const {
      to,
      subject,
      body = "",
      cc = "",
      bcc = "",
      attachments = [],
      campaignId = null,
      campaignName = "",
      templateName = "",
    } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: "To and Subject are required",
      });
    }

    const baseUrl = getBaseUrl(req);

    const recipients = Array.isArray(to)
      ? to.map((r) => ({
          email: r.email?.trim(),
          name: r.name?.trim() || getNameFromEmail(r.email),
        }))
      : to.split(",").map((email) => ({
          email: email.trim(),
          name: getNameFromEmail(email),
        }));

    // 🔁 SEND LOOP
    for (const r of recipients) {
      let emailDoc;

      try {
        // 🔍 EMAIL VALIDATION
        console.log(`🔍 VALIDATING EMAIL: ${r.email}`);
        
        if (!validator.isEmail(r.email)) {
          console.log(`❌ INVALID FORMAT: ${r.email}`);
          
          emailDoc = await Email.create({
            to: r.email,
            recipientName: r.name,
            subject,
            body,
            campaignId,
            campaignName,
            templateName,
            status: "hard_bounced",
            bounce: {
              type: "hard",
              reason: "Invalid email format",
              timestamp: new Date(),
            }
          });

          hardBounced++;
          results.push({
            email: r.email,
            status: "hard_bounced",
            messageId: emailDoc._id,
            message: "Invalid email format"
          });
          continue;
        }

        // 🔍 MX RECORD VALIDATION
        const domain = r.email.split("@")[1];
        let hasValidMX = false;
        
        try {
          const mxRecords = await dns.resolveMx(domain);
          hasValidMX = mxRecords && mxRecords.length > 0;
        } catch (err) {
          console.log(`❌ MX LOOKUP FAILED: ${r.email} - ${err.message}`);
        }

        if (!hasValidMX) {
          console.log(`❌ NO MX RECORD: ${r.email}`);
          
          emailDoc = await Email.create({
            to: r.email,
            recipientName: r.name,
            subject,
            body,
            campaignId,
            campaignName,
            templateName,
            status: "hard_bounced",
            bounce: {
              type: "hard",
              reason: "No MX records found for domain",
              timestamp: new Date(),
            }
          });

          hardBounced++;
          results.push({
            email: r.email,
            status: "hard_bounced",
            messageId: emailDoc._id,
            message: "No MX records found"
          });
          continue;
        }

        console.log(`✅ EMAIL VALID: ${r.email}`);

        // 1️⃣ Create queued email record with tracking code
        emailDoc = await Email.create({
          to: r.email,
          recipientName: r.name,
          subject,
          body,
          campaignId,
          campaignName,
          templateName,
          status: "queued",
          provider: "zeptomail",
        });

        // Generate tracking code
        emailDoc.generateTrackingCode();
        await emailDoc.save();

        // 2️⃣ Build HTML with tracking
        let processedBody = body
          .replace(/{{name}}/gi, r.name)
          .replace(/{{emailId}}/gi, emailDoc._id)
          .replace(/{{recipientEmail}}/gi, r.email);
        
        let html = convertLinksToTracked(processedBody, emailDoc._id);
        
        // Create EmailOpen record for tracking
        await EmailOpen.create({
          emailId: emailDoc._id,
          email: r.email,
          trackingCode: emailDoc.trackingCode,
          openCount: 0,
        });

        // Inject tracking pixel with tracking code
        html = injectTrackingPixel(html, baseUrl, emailDoc.trackingCode);

        // 3️⃣ Send via ZeptoMail
        console.log(`📡 SENDING VIA ZEPTOMAIL: ${r.email}`);
        
        const zeptoResult = await sendEmailViaZeptoIndia({
          from: { 
            address: process.env.ZEPTO_FROM_EMAIL || "accounts@info.zylker.com", 
            name: process.env.ZEPTO_FROM_NAME || "Paula" 
          },
          to: [{ 
            email_address: { 
              address: r.email, 
              name: r.name 
            } 
          }],
          subject,
          htmlbody: html,
          track_clicks: true,
          track_opens: true
        });

        console.log(`🎯 ZEPTOMAIL RESULT: ${zeptoResult.status}`);
        console.log(`   Request ID: ${zeptoResult.request_id}`);

        // 4️⃣ Update status based on ZeptoMail response
        if (zeptoResult.status === "queued" || zeptoResult.status === "sent") {
          emailDoc.status = "sent";
          emailDoc.requestId = zeptoResult.request_id;
          emailDoc.zeptoResponse = zeptoResult.raw;
          emailDoc.sentAt = new Date();
          sent++;
        } else if (zeptoResult.status === "error") {
          emailDoc.status = "hard_bounced";
          emailDoc.bounce = {
            type: "hard",
            reason: zeptoResult.error || 'ZeptoMail send failed',
            timestamp: new Date(),
          };
          emailDoc.zeptoResponse = zeptoResult.raw;
          hardBounced++;
        } else {
          emailDoc.status = "failed";
          emailDoc.zeptoResponse = zeptoResult.raw;
          failed++;
        }

        await emailDoc.save();

        results.push({
          email: r.email,
          status: emailDoc.status,
          messageId: emailDoc._id,
          requestId: zeptoResult.request_id,
          message: zeptoResult.message
        });

        // Log the event
        logEmailEvent({
          email: r.email,
          campaignId,
          messageId: emailDoc._id.toString(),
          event: emailDoc.status,
          response: emailDoc.zeptoResponse,
          timestamp: new Date(),
        });

      } catch (err) {
        console.error(`❌ SEND ERROR: ${r.email} - ${err.message}`);
        
        const bounceType = classifyBounce(err);

        if (emailDoc) {
          if (bounceType === "hard" || bounceType === "soft") {
            emailDoc.status = bounceType === "hard" ? "hard_bounced" : "soft_bounced";
            emailDoc.bounce = {
              type: bounceType,
              reason: err.message,
              timestamp: new Date(),
            };
            bounceType === "hard" ? hardBounced++ : softBounced++;
          } else {
            emailDoc.status = "failed";
            failed++;
          }
          await emailDoc.save();
        }

        results.push({
          email: r.email,
          status: bounceType || "failed",
          error: err.message,
        });
      }
    }

    // ✅ FINAL RESPONSE: Return results with critical knowledge boundaries
    
    // 📊 Calculate delivery analysis metrics
    const totalEmails = sent + hardBounced + softBounced + failed;
    let smtpAcceptanceRate = '0%';
    let bounceRate = '0%';
    let hardBounceRate = '0%';
    
    if (totalEmails > 0) {
      const smtpAcceptance = (sent / (sent + hardBounced + failed)) * 100;
      const bounceTotal = (hardBounced + softBounced) / totalEmails * 100;
      const hardBounceTotal = (hardBounced / totalEmails) * 100;
      
      smtpAcceptanceRate = smtpAcceptance.toFixed(1) + '%';
      bounceRate = bounceTotal.toFixed(1) + '%';
      hardBounceRate = hardBounceTotal.toFixed(1) + '%';
    }
    
    return res.json({
      success: true,
      message: `Bulk mail completed. Sent: ${sent}, Soft Bounce: ${softBounced}, Hard Bounce: ${hardBounced}, Failed: ${failed}`,
      summary: { sent, softBounced, hardBounced, failed },
      results,
      
      // 🔄 Message IDs for acknowledgment checking
      messageIds: results.map(r => r.messageId).filter(id => id),
      
      // 📊 Acknowledgment info
      acknowledgment: {
        checkEndpoint: `/api/email/acknowledgment/${campaignId}`,
        pollingInterval: '2-3 seconds',
        maxWaitTime: '10 seconds',
        instructions: 'Poll this endpoint every 2-3 seconds for up to 10 seconds to get real-time status updates'
      },
      
      // 🔍 CRITICAL KNOWLEDGE BOUNDARIES
      knowledgeBoundaries: {
        whatWeCanKnow: {
          'Did ZeptoMail accept mail?': '✅ Yes (Real-time ZeptoMail response)',
          'Is address invalid?': '✅ Only via bounce response (Real-time)',
          'Did recipient server reject?': '✅ Yes (Real-time)',
          'Is domain valid?': '✅ Yes (Pre-send validation)',
          'Was email queued?': '✅ Yes (Real-time)'
        },
        whatWeCannotKnow: {
          'Did inbox receive mail?': '❌ No (No access to recipient inbox)',
          'Is it in spam?': '❌ No (No access to recipient spam folder)',
          'Did user read it?': '❌ No (No access to recipient read status)',
          'Was email deleted?': '❌ No (No access to recipient mailbox)',
          'Did user mark as spam?': '❌ No (No access to recipient actions)'
        },
        criticalInsight: '✅ ZeptoMail acceptance = ✅ Real-time certainty | ❌ Inbox delivery = ❌ No certainty',
        keyTakeaway: 'We can only know what happens up to the ZeptoMail server. Everything after that is indirect or unknown.'
      },
      
      // 📊 Delivery Analysis
      deliveryAnalysis: {
        smtpAcceptanceRate,
        bounceRate,
        hardBounceRate,
        reliability: 'Based on ZeptoMail API data only. Post-delivery status unknown.',
        limitations: [
          'No inbox delivery confirmation',
          'No user engagement tracking',
          'No spam folder visibility',
          'No read receipt access'
        ]
      }
    });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending email",
      error: error.message,
    });
  }
};


export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Template id is required",
      });
    }

    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete template",
      error: error.message,
    });
  }
};

// Enhanced per-campaign dashboard with comprehensive analytics
export const campaignDashboard = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 50, status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Get campaign basic info
    const campaign = await Email.findOne({ campaignId: new mongoose.Types.ObjectId(campaignId) }).select('campaignName campaignNumber createdAt').lean();
    
    // Build status filter
    const statusFilter = status === 'all' ? {} : { status };
    
    // Get paginated emails for the campaign
    const emails = await Email.find({ campaignId: new mongoose.Types.ObjectId(campaignId), ...statusFilter })
      .select('to subject templateName status sentAt deliveredAt bounce openCount clickCount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`📊 CAMPAIGN DASHBOARD: Found ${emails.length} emails for campaign ${campaignId}`);
    if (emails.length > 0) {
      console.log(`📧 Sample email data:`, {
        to: emails[0].to,
        subject: emails[0].subject,
        status: emails[0].status
      });
    }

    const totalEmails = await Email.countDocuments({ campaignId: new mongoose.Types.ObjectId(campaignId) });
    const filteredEmails = await Email.countDocuments({ campaignId: new mongoose.Types.ObjectId(campaignId), ...statusFilter });

    // Get detailed tracking data
    const emailIds = emails.map(e => e._id);
    
    // Open tracking analytics
    const opens = await EmailOpen.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: "$emailId",
          openCount: { $sum: 1 },
          firstOpen: { $min: "$timestamp" },
          lastOpen: { $max: "$timestamp" },
          uniqueIPs: { $addToSet: "$ipAddress" }
        }
      }
    ]);

    // Click tracking analytics
    const clicks = await EmailClick.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: "$emailId",
          clickCount: { $sum: 1 },
          firstClick: { $min: "$clickedAt" },
          lastClick: { $max: "$clickedAt" },
          uniqueUrls: { $addToSet: "$url" }
        }
      }
    ]);

    // URL performance analytics
    const urlPerformance = await EmailClick.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: "$url",
          clicks: { $sum: 1 },
          uniqueClickers: { $addToSet: "$emailId" }
        }
      },
      {
        $project: {
          url: "$_id",
          totalClicks: "$clicks",
          uniqueClickers: { $size: "$uniqueClickers" }
        }
      },
      { $sort: { totalClicks: -1 } }
    ]);

    // Create maps for quick lookup
    const openMap = new Map(opens.map(o => [String(o._id), o]));
    const clickMap = new Map(clicks.map(c => [String(c._id), c]));

    // Process emails with analytics
    const processedEmails = emails.map(email => {
      const openData = openMap.get(String(email._id)) || {};
      const clickData = clickMap.get(String(email._id)) || {};
      
      return {
        messageId: email._id,
        recipient: email.to,
        subject: email.subject,
        templateName: email.templateName || "-",
        status: email.status,
        sentAt: email.sentAt,
        deliveredAt: email.deliveredAt,
        createdAt: email.createdAt,
        
        // Open analytics
        openCount: openData.openCount || 0,
        firstOpen: openData.firstOpen,
        lastOpen: openData.lastOpen,
        uniqueIPs: openData.uniqueIPs ? openData.uniqueIPs.length : 0,
        
        // Click analytics
        clickCount: clickData.clickCount || 0,
        firstClick: clickData.firstClick,
        lastClick: clickData.lastClick,
        uniqueUrls: clickData.uniqueUrls ? clickData.uniqueUrls.length : 0,
        
        // Bounce information
        bounce: email.bounce,
        
        // Engagement metrics
        engagement: {
          totalInteractions: (openData.openCount || 0) + (clickData.clickCount || 0),
          clickToOpenRate: openData.openCount > 0 ? 
            ((clickData.clickCount || 0) / openData.openCount * 100).toFixed(2) : 0
        }
      };
    });

    // Calculate comprehensive statistics
    const stats = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          queued: { $sum: { $cond: [{ $eq: ["$status", "queued"] }, 1, 0] } },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          hardBounced: { $sum: { $cond: [{ $eq: ["$status", "hard_bounced"] }, 1, 0] } },
          softBounced: { $sum: { $cond: [{ $eq: ["$status", "soft_bounced"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          totalOpens: { $sum: "$openCount" },
          totalClicks: { $sum: "$clickCount" },
          uniqueOpens: { $sum: { $cond: [{ $gt: ["$openCount", 0] }, 1, 0] } },
          uniqueClicks: { $sum: { $cond: [{ $gt: ["$clickCount", 0] }, 1, 0] } }
        }
      }
    ]);

    const campaignStats = stats[0] || {
      total: 0, queued: 0, sent: 0, delivered: 0,
      hardBounced: 0, softBounced: 0, failed: 0,
      totalOpens: 0, totalClicks: 0, uniqueOpens: 0, uniqueClicks: 0
    };

    // Calculate rates
    const rates = {
      deliveryRate: campaignStats.sent > 0 ? ((campaignStats.delivered / campaignStats.sent) * 100).toFixed(2) : 0,
      openRate: campaignStats.sent > 0 ? ((campaignStats.uniqueOpens / campaignStats.sent) * 100).toFixed(2) : 0,
      clickRate: campaignStats.sent > 0 ? ((campaignStats.uniqueClicks / campaignStats.sent) * 100).toFixed(2) : 0,
      clickToOpenRate: campaignStats.uniqueOpens > 0 ? ((campaignStats.uniqueClicks / campaignStats.uniqueOpens) * 100).toFixed(2) : 0,
      bounceRate: campaignStats.total > 0 ? (((campaignStats.hardBounced + campaignStats.softBounced) / campaignStats.total) * 100).toFixed(2) : 0,
      hardBounceRate: campaignStats.total > 0 ? ((campaignStats.hardBounced / campaignStats.total) * 100).toFixed(2) : 0,
      softBounceRate: campaignStats.total > 0 ? ((campaignStats.softBounced / campaignStats.total) * 100).toFixed(2) : 0
    };

    // Time-based analytics
    const timeAnalytics = await EmailOpen.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          opens: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return res.json({
      success: true,
      data: {
        // Campaign information
        campaign: {
          id: campaignId,
          name: campaign?.campaignName || 'Unknown Campaign',
          number: campaign?.campaignNumber || 'N/A',
          createdAt: campaign?.createdAt
        },
        
        // Summary statistics
        summary: {
          ...campaignStats,
          ...rates
        },
        
        // Email-level details
        emails: processedEmails,
        
        // URL performance
        urlPerformance,
        
        // Time-based analytics
        timeAnalytics: timeAnalytics.map(item => ({
          hour: item._id,
          opens: item.opens
        })),
        
        // Pagination
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredEmails,
          totalCampaign: totalEmails,
          pages: Math.ceil(filteredEmails / limit)
        },
        
        // Status breakdown
        statusBreakdown: {
          queued: campaignStats.queued,
          sent: campaignStats.sent,
          delivered: campaignStats.delivered,
          hardBounced: campaignStats.hardBounced,
          softBounced: campaignStats.softBounced,
          failed: campaignStats.failed
        }
      }
    });

  } catch (err) {
    console.error("Campaign dashboard error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch campaign analytics",
      error: err.message 
    });
  }
};




/**
 * Track email clicks
 */
export const trackClick = async (req, res) => {
  try {
    const emailId = req.params.emailId;
    const encodedUrl = req.query.url;
    
    // Decode the URL properly
    let targetUrl;
    try {
      targetUrl = decodeURIComponent(encodedUrl);
    } catch (decodeError) {
      console.error("URL decode error:", decodeError);
      return res.status(400).send("Invalid URL parameter");
    }

    if (!targetUrl) {
      return res.status(400).send("Missing URL parameter");
    }

    console.log(`🖱️ CLICK TRACKING: Email ${emailId} -> ${targetUrl}`);

    // Save click in EmailClick collection (handle duplicates gracefully)
    try {
      await EmailClick.create({
        emailId,
        url: targetUrl,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (clickError) {
      if (clickError.code === 11000) {
        // Duplicate click - ignore and continue
        console.log(`🔄 Duplicate click detected for email ${emailId} -> ${targetUrl}`);
      } else {
        console.error(`❌ Click tracking error:`, clickError);
      }
    }

    // Update email statistics
    const email = await Email.findById(emailId);
    if (email) {
      await email.recordClick();
      console.log(`✅ Click recorded for ${email.to}`);
    }

    // Log the click event
    logEmailEvent({
      email: email?.to || emailId,
      campaignId: email?.campaignId || null,
      messageId: emailId,
      event: "click",
      response: targetUrl,
      timestamp: new Date(),
    });

    // Redirect user to actual link
    console.log(`🔄 Redirecting to: ${targetUrl}`);
    res.redirect(targetUrl);
  } catch (err) {
    console.error("Track click error:", err);
    // Fallback: try to redirect even if tracking fails
    if (req.query.url) {
      try {
        const fallbackUrl = decodeURIComponent(req.query.url);
        console.log(`🔄 Fallback redirect to: ${fallbackUrl}`);
        res.redirect(fallbackUrl);
        return;
      } catch (fallbackError) {
        console.error("Fallback redirect failed:", fallbackError);
      }
    }
    res.status(500).send("Error tracking email click");
  }
};


export const saveDraft = async (req, res) => {
  try {
    const {
      to = "",
      cc = "",
      bcc = "",
      subject = "",
      body = "",
      mode = "single",
      bulkRecipients = "",
      attachments = [],
    } = req.body;

    let normalizedAttachments = attachments;

    // Handle case where attachments comes as a JSON string
    if (typeof normalizedAttachments === 'string') {
      try {
        normalizedAttachments = JSON.parse(normalizedAttachments);
      } catch {
        normalizedAttachments = [];
      }
    }

    // Handle case where it's an array and elements are JSON strings
    if (Array.isArray(normalizedAttachments)) {
      normalizedAttachments = normalizedAttachments.map((item) => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        }
        return item;
      }).filter(Boolean);
    }

    const draft = await DraftEmail.create({
      to,
      cc,
      bcc,
      subject,
      body,
      mode,
      bulkRecipients,
      attachments: normalizedAttachments,
      status: "draft",
      lastEditedAt: new Date(),
    });

    // Also keep a record in main Email table marked as drafted
    await Email.create({
      to,
      cc,
      bcc,
      subject,
      body,
      bulkRecipients,
      attachments: normalizedAttachments.map((att) => ({
        name: att.filename || att.name,
        size: att.size,
        type: att.contentType || att.type,
      })),
      status: "drafted",
      provider: "smtp",
    });

    return res.status(201).json({
      success: true,
      message: "Draft saved successfully",
      data: draft,
    });
  } catch (error) {
    console.error("Save draft error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save draft",
      error: error.message,
    });
  }
};

export const listTemplates = async (_req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: templates });
  } catch (error) {
    console.error("List templates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, body, campaignId } = req.body;

    if (!name || !subject || !body || !campaignId) {
      return res.status(400).json({
        success: false,
        message: "name, subject, body and campaignId are required",
      });
    }

    // Snapshot campaign info (name/number) onto the template for easier reporting/filtering
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaignId provided",
      });
    }

    const campaignFields = {
      campaignId: campaign._id,
      campaignName: campaign.name,
      campaignNumber: campaign.campaignNumber ?? null,
    };

    const template = await Template.create({
      name,
      subject,
      body,
      ...campaignFields,
    });

    return res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Create template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template",
      error: error.message,
    });
  }
};

// List helpers for Sent / Draft / Trash views
const listByStatus = async (status, res) => {
  try {
    const emails = await Email.find({ status }).sort({ createdAt: -1 });
    return res.json({ success: true, data: emails });
  } catch (error) {
    console.error(`List ${status} emails error:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch ${status} emails`,
      error: error.message,
    });
  }
};

export const listSentEmails = async (_req, res) => {
  return listByStatus("sent", res);
};

export const listDraftEmails = async (_req, res) => {
  return listByStatus("drafted", res);
};

export const listTrashedEmails = async (_req, res) => {
  return listByStatus("trashed", res);
};

export const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.findById(id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    return res.json({ success: true, data: email });
  } catch (error) {
    console.error("Get email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email",
      error: error.message,
    });
  }
};

export const moveEmailToTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const email = await Email.findByIdAndUpdate(
      id,
      { status: "trashed" },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    return res.json({
      success: true,
      message: "Email moved to trash",
      data: email,
    });
  } catch (error) {
    console.error("Move to trash error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to move email to trash",
      error: error.message,
    });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, type = "regular", folder = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Campaign name is required",
      });
    }

    const campaign = await Campaign.create({
      name: name.trim(),
      type: type === "ab_test" ? "ab_test" : "regular",
      folder: folder.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required",
      });
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    await Campaign.findByIdAndDelete(campaignId);

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
      error: error.message,
    });
  }
};



export const listCampaignsWithStats = async (_req, res) => {
  try {
    // Aggregate sent emails by campaignId and join Campaign collection
    // This powers the Campaigns page with recipients per campaign.
    const rows = await Email.aggregate([
      {
        $match: {
          status: "sent",
          campaignId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$campaignId",
          totalSent: { $sum: 1 },
          lastSentAt: { $max: "$sentAt" },
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "_id",
          as: "campaign",
        },
      },
      { $unwind: "$campaign" },
      {
        $project: {
          _id: 0,
          campaignId: "$_id",
          campaignName: "$campaign.name",
          campaignNumber: "$campaign.campaignNumber",
          // Frontend expects these names
          recipients: "$totalSent",
          openCount: { $literal: 0 },
          openRate: { $literal: 0 },
          clickCount: { $literal: 0 },
          clickRate: { $literal: 0 },
          sentAt: "$lastSentAt",
        },
      },
      {
        $sort: { sentAt: -1 },
      },
    ]);

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("List campaigns stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns stats",
      error: error.message,
    });
  }
};

export const listCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error("List campaigns error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

export const countSentEmails = async (_req, res) => {
  try {
    const total = await Email.countDocuments({ status: "sent" });
    return res.json({ success: true, data: { total } });
  } catch (error) {
    console.error("Count sent emails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to count sent emails",
      error: error.message,
    });
  }
};

// Simple campaign-wise mail count report
// Output example:
// [ { campaignName: "New Year Offer", campaignNumber: 101, totalSent: 120 } ]
// Get bounced emails by type
export const getBouncedEmails = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 50, campaignId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (type !== 'all') {
      query.status = type === 'hard' ? 'hard_bounced' : 'soft_bounced';
    } else {
      query.status = { $in: ['hard_bounced', 'soft_bounced'] };
    }

    if (campaignId) {
      query.campaignId = campaignId;
    }

    const bouncedEmails = await Email.find(query)
      .populate('campaignId', 'name campaignNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Email.countDocuments(query);

    // Get bounce statistics
    const bounceStats = await Email.aggregate([
      { $match: { status: { $in: ['hard_bounced', 'soft_bounced'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      hardBounced: bounceStats.find(s => s._id === 'hard_bounced')?.count || 0,
      softBounced: bounceStats.find(s => s._id === 'soft_bounced')?.count || 0,
      total: bounceStats.reduce((acc, s) => acc + s.count, 0)
    };

    return res.json({
      success: true,
      data: bouncedEmails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error("Get bounced emails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bounced emails",
      error: error.message,
    });
  }
};

// Enhanced campaign statistics with tracking
export const getCampaignStatistics = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get real-time email status counts
    const emailStats = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total emails sent for this campaign
    const totalEmails = await Email.countDocuments({ 
      campaignId: new mongoose.Types.ObjectId(campaignId) 
    });

    // Calculate counts
    const sent = emailStats.find(s => s._id === 'sent')?.count || 0;
    const failed = emailStats.find(s => s._id === 'failed')?.count || 0;
    const hardBounced = emailStats.find(s => s._id === 'hard_bounced')?.count || 0;
    const softBounced = emailStats.find(s => s._id === 'soft_bounced')?.count || 0;
    const delivered = emailStats.find(s => s._id === 'delivered')?.count || 0;
    const queued = emailStats.find(s => s._id === 'queued')?.count || 0;

    // Get real-time tracking statistics
    const trackingStats = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: null,
          totalOpens: { $sum: '$openCount' },
          totalClicks: { $sum: '$clickCount' },
          uniqueOpens: { $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] } },
          uniqueClicks: { $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] } },
          emailsWithOpens: { $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] } }
        }
      }
    ]);

    const tracking = trackingStats[0] || { 
      totalOpens: 0, 
      totalClicks: 0, 
      uniqueOpens: 0, 
      uniqueClicks: 0,
      emailsWithOpens: 0
    };

    // Calculate bounce rate (total bounced / total emails * 100)
    const totalBounced = hardBounced + softBounced;
    const bounceRate = totalEmails > 0 ? (totalBounced / totalEmails * 100).toFixed(1) : '0';

    // Calculate open rate (unique opens / sent emails * 100)
    const openRate = sent > 0 ? (tracking.emailsWithOpens / sent * 100).toFixed(1) : '0';

    // Calculate click rate (unique clicks / unique opens * 100)
    const clickRate = tracking.uniqueOpens > 0 ? (tracking.uniqueClicks / tracking.uniqueOpens * 100).toFixed(1) : '0';

    // Get detailed email list for table
    const emailDetails = await Email.find({ 
      campaignId: new mongoose.Types.ObjectId(campaignId) 
    })
    .populate('templateId', 'name')
    .select('to recipientName subject templateName status sentAt openCount clickCount bounce createdAt')
    .sort({ createdAt: -1 })
    .limit(100); // Limit for performance, can be paginated

    // Format email details for frontend
    const formattedEmails = emailDetails.map(email => ({
      _id: email._id,
      recipient: email.to,
      subject: email.subject,
      template: email.templateName || email.templateId?.name || 'N/A',
      status: email.status,
      sentAt: email.sentAt || email.createdAt,
      bounces: (email.status === 'hard_bounced' || email.status === 'soft_bounced') ? 1 : 0,
      opens: email.openCount || 0,
      clicks: email.clickCount || 0,
      bounceInfo: email.bounce || null
    }));

    return res.json({
      success: true,
      data: {
        // Summary stats for dashboard cards
        summary: {
          sent,
          failed,
          softBounced,
          hardBounced,
          delivered,
          queued,
          total: totalEmails,
          bounceRate: `${bounceRate}%`
        },
        
        // Tracking metrics
        tracking: {
          totalOpens: tracking.totalOpens,
          totalClicks: tracking.totalClicks,
          uniqueOpens: tracking.uniqueOpens,
          uniqueClicks: tracking.uniqueClicks,
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`
        },

        // Detailed email list for table
        emailDetails: formattedEmails,

        // Performance metrics
        performance: {
          deliveryRate: totalEmails > 0 ? ((sent + delivered) / totalEmails * 100).toFixed(1) + '%' : '0%',
          failureRate: totalEmails > 0 ? (failed / totalEmails * 100).toFixed(1) + '%' : '0%',
          bounceRate: `${bounceRate}%`,
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`
        }
      }
    });
  } catch (error) {
    console.error("Get campaign statistics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign statistics",
      error: error.message,
    });
  }
};

// Comprehensive campaign analytics report for graphs
export const getCampaignAnalyticsReport = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log(`📊 GENERATING ANALYTICS REPORT for campaign ${campaignId}`);

    // Get campaign basic info
    const campaign = await Email.findOne({ campaignId }).select('campaignName campaignNumber createdAt').lean();
    
    // Get all emails for the campaign
    const emails = await Email.find({ campaignId })
      .select('to status sentAt deliveredAt bounce openCount clickCount createdAt')
      .lean();

    const emailIds = emails.map(e => e._id);
    
    // Status distribution
    const statusDistribution = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Time-based analytics - Opens by hour
    const opensByHour = await EmailOpen.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          opens: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Time-based analytics - Clicks by hour
    const clicksByHour = await EmailClick.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: { $hour: "$clickedAt" },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Daily engagement trends
    const dailyTrends = await EmailOpen.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          opens: { $sum: 1 },
          uniqueOpens: { $addToSet: "$emailId" }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          opens: "$opens",
          uniqueOpens: { $size: "$uniqueOpens" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // URL performance analytics
    const urlPerformance = await EmailClick.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: "$url",
          clicks: { $sum: 1 },
          uniqueClickers: { $addToSet: "$emailId" }
        }
      },
      {
        $project: {
          url: "$_id",
          totalClicks: "$clicks",
          uniqueClickers: { $size: "$uniqueClickers" }
        }
      },
      { $sort: { totalClicks: -1 } },
      { $limit: 10 }
    ]);

    // Engagement funnel data
    const engagementFunnel = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          totalOpens: { $sum: "$openCount" },
          uniqueOpens: { $sum: { $cond: [{ $gt: ["$openCount", 0] }, 1, 0] } },
          totalClicks: { $sum: "$clickCount" },
          uniqueClicks: { $sum: { $cond: [{ $gt: ["$clickCount", 0] }, 1, 0] } }
        }
      }
    ]);

    // Bounce analysis
    const bounceAnalysis = await Email.aggregate([
      { $match: { 
        campaignId: new mongoose.Types.ObjectId(campaignId),
        status: { $in: ["hard_bounced", "soft_bounced"] }
      }},
      {
        $group: {
          _id: "$bounce.type",
          count: { $sum: 1 },
          reasons: { $addToSet: "$bounce.reason" }
        }
      }
    ]);

    // Geographic distribution (based on IP)
    const geographicData = await EmailOpen.aggregate([
      { $match: { emailId: { $in: emailIds } } },
      {
        $group: {
          _id: "$ipAddress",
          opens: { $sum: 1 },
          uniqueEmails: { $addToSet: "$emailId" }
        }
      },
      {
        $project: {
          ip: "$_id",
          opens: "$opens",
          uniqueUsers: { $size: "$uniqueEmails" }
        }
      },
      { $sort: { opens: -1 } },
      { $limit: 20 }
    ]);

    const funnelData = engagementFunnel[0] || {
      total: 0, sent: 0, delivered: 0, totalOpens: 0,
      uniqueOpens: 0, totalClicks: 0, uniqueClicks: 0
    };

    // Prepare chart data
    const chartData = {
      // Pie chart for status distribution
      statusChart: statusDistribution.map(item => ({
        name: item._id,
        value: item.count,
        percentage: ((item.count / funnelData.total) * 100).toFixed(1)
      })),

      // Line chart for hourly activity
      hourlyActivity: {
        opens: opensByHour.map(item => ({ hour: item._id, count: item.opens })),
        clicks: clicksByHour.map(item => ({ hour: item._id, count: item.clicks }))
      },

      // Bar chart for URL performance
      urlChart: urlPerformance.map(item => ({
        url: item.url.length > 30 ? item.url.substring(0, 30) + '...' : item.url,
        fullUrl: item.url,
        clicks: item.totalClicks,
        uniqueClickers: item.uniqueClickers
      })),

      // Funnel chart
      funnelChart: [
        { stage: 'Total Emails', count: funnelData.total },
        { stage: 'Sent', count: funnelData.sent },
        { stage: 'Delivered', count: funnelData.delivered },
        { stage: 'Opened', count: funnelData.uniqueOpens },
        { stage: 'Clicked', count: funnelData.uniqueClicks }
      ],

      // Daily trends
      dailyTrends: dailyTrends.map(item => ({
        date: item.date,
        opens: item.opens,
        uniqueOpens: item.uniqueOpens
      })),

      // Bounce analysis
      bounceChart: bounceAnalysis.map(item => ({
        type: item._id,
        count: item.count,
        reasons: item.reasons
      })),

      // Geographic data
      geographicChart: geographicData.map(item => ({
        ip: item.ip,
        opens: item.opens,
        uniqueUsers: item.uniqueUsers
      }))
    };

    // Calculate key metrics
    const metrics = {
      totalEmails: funnelData.total,
      deliveryRate: funnelData.sent > 0 ? ((funnelData.delivered / funnelData.sent) * 100).toFixed(2) : 0,
      openRate: funnelData.sent > 0 ? ((funnelData.uniqueOpens / funnelData.sent) * 100).toFixed(2) : 0,
      clickRate: funnelData.sent > 0 ? ((funnelData.uniqueClicks / funnelData.sent) * 100).toFixed(2) : 0,
      clickToOpenRate: funnelData.uniqueOpens > 0 ? ((funnelData.uniqueClicks / funnelData.uniqueOpens) * 100).toFixed(2) : 0,
      bounceRate: funnelData.total > 0 ? (((funnelData.total - funnelData.sent) / funnelData.total) * 100).toFixed(2) : 0
    };

    console.log(`📊 ANALYTICS REPORT GENERATED for campaign ${campaignId}`);

    return res.json({
      success: true,
      data: {
        campaign: {
          id: campaignId,
          name: campaign?.campaignName || 'Unknown Campaign',
          number: campaign?.campaignNumber || 'N/A',
          createdAt: campaign?.createdAt
        },
        metrics,
        charts: chartData,
        summary: {
          totalEmails: funnelData.total,
          statusBreakdown: statusDistribution,
          topUrls: urlPerformance.slice(0, 5),
          peakActivityHour: opensByHour.length > 0 ? 
            opensByHour.reduce((max, item) => item.opens > max.opens ? item : max)._id : null
        }
      }
    });

  } catch (error) {
    console.error("Campaign analytics report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate analytics report",
      error: error.message
    });
  }
};
export const checkEmailAcknowledgment = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { messageIds } = req.body; // Array of message IDs to check

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "Message IDs array is required"
      });
    }

    // Get current status of all emails
    const emails = await Email.find({
      _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).select('to status bounce sentAt createdAt');

    // Calculate acknowledgment summary
    const summary = {
      total: emails.length,
      queued: emails.filter(e => e.status === 'queued').length,
      sent: emails.filter(e => e.status === 'sent').length,
      delivered: emails.filter(e => e.status === 'delivered').length,
      hardBounced: emails.filter(e => e.status === 'hard_bounced').length,
      softBounced: emails.filter(e => e.status === 'soft_bounced').length,
      failed: emails.filter(e => e.status === 'failed').length,
    };

    // Get bounced emails with details
    const bouncedEmails = emails
      .filter(e => e.status === 'hard_bounced' || e.status === 'soft_bounced')
      .map(email => ({
        messageId: email._id,
        email: email.to,
        status: email.status,
        bounceType: email.bounce?.type || 'unknown',
        reason: email.bounce?.reason || 'Unknown reason',
        timestamp: email.bounce?.timestamp || email.createdAt
      }));

    // Determine if acknowledgment is complete (no more queued emails)
    const isComplete = summary.queued === 0;

    return res.json({
      success: true,
      data: {
        summary,
        bouncedEmails,
        isComplete,
        processingTime: summary.queued > 0 ? 'still_processing' : 'complete'
      }
    });

  } catch (error) {
    console.error("Check acknowledgment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check email acknowledgment",
      error: error.message
    });
  }
};
export const getCampaignSummary = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get real-time counts using aggregation for performance
    const summary = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: null,
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          hardBounced: { $sum: { $cond: [{ $eq: ['$status', 'hard_bounced'] }, 1, 0] } },
          softBounced: { $sum: { $cond: [{ $eq: ['$status', 'soft_bounced'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          queued: { $sum: { $cond: [{ $eq: ['$status', 'queued'] }, 1, 0] } },
          total: { $sum: 1 },
          totalOpens: { $sum: '$openCount' },
          totalClicks: { $sum: '$clickCount' },
          uniqueOpens: { $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] } },
          uniqueClicks: { $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] } }
        }
      }
    ]);

    const stats = summary[0] || {
      sent: 0,
      failed: 0,
      hardBounced: 0,
      softBounced: 0,
      delivered: 0,
      queued: 0,
      total: 0,
      totalOpens: 0,
      totalClicks: 0,
      uniqueOpens: 0,
      uniqueClicks: 0
    };

    // Calculate rates
    const totalBounced = stats.hardBounced + stats.softBounced;
    const bounceRate = stats.total > 0 ? (totalBounced / stats.total * 100).toFixed(1) : '0';
    const openRate = stats.sent > 0 ? (stats.uniqueOpens / stats.sent * 100).toFixed(1) : '0';
    const clickRate = stats.uniqueOpens > 0 ? (stats.uniqueClicks / stats.uniqueOpens * 100).toFixed(1) : '0';

    return res.json({
      success: true,
      data: {
        sent: stats.sent,
        failed: stats.failed,
        softBounced: stats.softBounced,
        hardBounced: stats.hardBounced,
        bounceRate: `${bounceRate}%`,
        totalOpens: stats.totalOpens,
        totalClicks: stats.totalClicks,
        openRate: `${openRate}%`,
        clickRate: `${clickRate}%`
      }
    });
  } catch (error) {
    console.error("Get campaign summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign summary",
      error: error.message,
    });
  }
};
export const getCampaignsWithEnhancedStats = async (req, res) => {
  try {
    const campaigns = await Campaign.aggregate([
      {
        $lookup: {
          from: 'emails',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'emails'
        }
      },
      {
        $addFields: {
          totalEmails: { $size: '$emails' },
          sent: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'sent'] } } } },
          delivered: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'delivered'] } } } },
          hardBounced: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'hard_bounced'] } } } },
          softBounced: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'soft_bounced'] } } } },
          failed: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'failed'] } } } },
          queued: { $size: { $filter: { input: '$emails', cond: { $eq: ['$$this.status', 'queued'] } } } },
          totalOpens: { $sum: '$emails.openCount' },
          totalClicks: { $sum: '$emails.clickCount' },
          uniqueOpens: { $sum: { $cond: [{ $gt: ['$emails.openCount', 0] }, 1, 0] } },
          uniqueClicks: { $sum: { $cond: [{ $gt: ['$emails.clickCount', 0] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          totalBounced: { $add: ['$hardBounced', '$softBounced'] },
          bounceRate: { 
            $cond: [
              { $gt: ['$totalEmails', 0] }, 
              { $multiply: [{ $divide: [{ $add: ['$hardBounced', '$softBounced'] }, '$totalEmails'] }, 100] }, 
              0
            ] 
          },
          openRate: { 
            $cond: [
              { $gt: ['$sent', 0] }, 
              { $multiply: [{ $divide: ['$uniqueOpens', '$sent'] }, 100] }, 
              0
            ] 
          },
          clickRate: { 
            $cond: [
              { $gt: ['$uniqueOpens', 0] }, 
              { $multiply: [{ $divide: ['$uniqueClicks', '$uniqueOpens'] }, 100] }, 
              0
            ] 
          },
          deliveryRate: { 
            $cond: [
              { $gt: ['$totalEmails', 0] }, 
              { $multiply: [{ $divide: [{ $add: ['$sent', '$delivered'] }, '$totalEmails'] }, 100] }, 
              0
            ] 
          }
        }
      },
      {
        $project: {
          name: 1,
          campaignNumber: 1,
          type: 1,
          folder: 1,
          createdAt: 1,
          updatedAt: 1,
          totalEmails: 1,
          sent: 1,
          delivered: 1,
          hardBounced: 1,
          softBounced: 1,
          failed: 1,
          queued: 1,
          totalBounced: 1,
          totalOpens: 1,
          totalClicks: 1,
          uniqueOpens: 1,
          uniqueClicks: 1,
          bounceRate: { $round: ['$bounceRate', 1] },
          openRate: { $round: ['$openRate', 1] },
          clickRate: { $round: ['$clickRate', 1] },
          deliveryRate: { $round: ['$deliveryRate', 1] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      bounceRate: `${campaign.bounceRate}%`,
      openRate: `${campaign.openRate}%`,
      clickRate: `${campaign.clickRate}%`,
      deliveryRate: `${campaign.deliveryRate}%`
    }));

    return res.json({
      success: true,
      data: formattedCampaigns
    });
  } catch (error) {
    console.error("Get campaigns with enhanced stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns with statistics",
      error: error.message,
    });
  }
};

/**
 * Get real-time campaign analytics with auto-refresh
 */
export const getRealtimeCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Get real-time analytics
    const analytics = await analyticsService.getRealtimeAnalytics(campaignId);
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date(),
      nextUpdate: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    });
  } catch (err) {
    console.error("Get realtime campaign analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching realtime analytics"
    });
  }
};

/**
 * Get cached campaign analytics (faster response)
 */
export const getCachedCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Get campaign with cached analytics
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    res.json({
      success: true,
      data: campaign.analytics || {},
      lastUpdated: campaign.analytics?.lastUpdated || null,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Get cached campaign analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching cached analytics"
    });
  }
};

/**
 * Force update campaign analytics
 */
export const forceUpdateCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Force update analytics
    const analytics = await analyticsService.getRealtimeAnalytics(campaignId);
    
    res.json({
      success: true,
      message: "Analytics updated successfully",
      data: analytics,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Force update campaign analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating analytics"
    });
  }
};

/**
 * Get all campaigns with their latest analytics
 */
export const getAllCampaignsWithAnalytics = async (req, res) => {
  try {
    const campaigns = await Campaign.find({})
      .select('name type status campaignNumber analytics createdAt')
      .sort({ 'analytics.lastUpdated': -1 });

    res.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Get all campaigns with analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching campaigns with analytics"
    });
  }
};

/**
 * Get campaign emails with analytics and pagination
 */
export const getCampaignEmailsWithAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Find the campaign first
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    // Get all emails for this campaign with full analytics
    const emails = await Email.find({ campaignId })
      .select('to subject templateName status sentAt updatedAt openCount clickCount trackingCode')
      .sort({ sentAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalEmails = await Email.countDocuments({ campaignId });

    // Get detailed click tracking data for this campaign
    const clickTrackingData = await EmailClick.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          uniqueClicks: { $addToSet: '$emailId' }
        }
      },
      {
        $project: {
          url: '$_id',
          totalClicks: '$count',
          uniqueClicks: { $size: '$uniqueClicks' },
          _id: 0
        }
      },
      { $sort: { totalClicks: -1 } },
      { $limit: 10 } // Top 10 tracking links
    ]);

    // Get campaign-wide statistics
    const campaignStats = await Email.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalOpens: { $sum: '$openCount' },
          totalClicks: { $sum: '$clickCount' }
        }
      }
    ]);

    // Transform the data to match the frontend interface
    const transformedEmails = emails.map(email => ({
      messageId: email._id.toString(),
      recipient: email.to,
      templateName: email.templateName || campaign.templateName || 'Default',
      status: email.status,
      openCount: email.openCount || 0,
      clickCount: email.clickCount || 0,
      trackingCode: email.trackingCode,
      sentAt: email.sentAt || email.createdAt,
      updatedAt: email.updatedAt
    }));

    // Calculate campaign-wide metrics
    const metrics = {
      totalEmails: totalEmails,
      sent: campaignStats.find(s => s._id === 'sent')?.count || 0,
      delivered: campaignStats.find(s => s._id === 'delivered')?.count || 0,
      opened: campaignStats.reduce((sum, s) => sum + s.totalOpens, 0),
      clicked: campaignStats.reduce((sum, s) => sum + s.totalClicks, 0),
      bounced: (campaignStats.find(s => s._id === 'soft_bounced')?.count || 0) + 
               (campaignStats.find(s => s._id === 'hard_bounced')?.count || 0),
      failed: campaignStats.find(s => s._id === 'failed')?.count || 0,
      topTrackingLinks: clickTrackingData
    };

    // Calculate rates
    const openRate = totalEmails > 0 ? ((metrics.opened / totalEmails) * 100).toFixed(2) : '0';
    const clickRate = totalEmails > 0 ? ((metrics.clicked / totalEmails) * 100).toFixed(2) : '0';
    const bounceRate = totalEmails > 0 ? ((metrics.bounced / totalEmails) * 100).toFixed(2) : '0';

    const totalPages = Math.ceil(totalEmails / limit);

    res.json({
      success: true,
      data: {
        emails: transformedEmails,
        metrics: {
          ...metrics,
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`,
          bounceRate: `${bounceRate}%`,
          deliveryRate: totalEmails > 0 ? `${((metrics.delivered / totalEmails) * 100).toFixed(2)}%` : '0%'
        },
        currentPage: page,
        totalPages: totalPages,
        totalEmails: totalEmails,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date()
    });

  } catch (err) {
    console.error("Get campaign emails with analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching campaign emails with analytics"
    });
  }
};

/**
 * Get campaign content (subject, body, template, attachments)
 */
export const getCampaignContent = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    // Get a sample email from this campaign to extract content
    const sampleEmail = await Email.findOne({ campaignId })
      .select('subject body templateName attachments')
      .sort({ createdAt: -1 });

    const content = {
      subject: sampleEmail?.subject || campaign.subject || 'No subject',
      content: sampleEmail?.body || campaign.body || 'No content available',
      htmlContent: sampleEmail?.body || campaign.body || '',
      attachments: sampleEmail?.attachments || campaign.attachments || [],
      template: sampleEmail?.templateName || campaign.templateName || 'Default'
    };

    res.json({
      success: true,
      data: content,
      timestamp: new Date()
    });

  } catch (err) {
    console.error("Get campaign content error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching campaign content"
    });
  }
};

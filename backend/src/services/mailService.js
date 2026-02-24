import nodemailer from "nodemailer";
import logger from "../utils/logger.js"; // ✅ correct


export const sendSMTPMail = async ({
  to,
  subject,
  html,
  campaignId,
  templateName,
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    // ✅ SMTP SUCCESS LOG
    logger.info({
      type: "SMTP_SENT",
      to,
      subject,
      campaignId,
      templateName,
      messageId: info.messageId,
      response: info.response,
    });

    return info;
  } catch (error) {
    // ❌ SMTP ERROR LOG
    logger.error({
      type: "SMTP_FAILED",
      to,
      subject,
      campaignId,
      templateName,
      error: error.message,
    });

    throw error;
  }
};

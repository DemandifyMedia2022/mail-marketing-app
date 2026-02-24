import nodemailer from "nodemailer";
import Email from "../models/Email.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export const retrySoftBounces = async () => {
  const mails = await Email.find({ status: "soft_bounced", retryCount: { $lt: 3 } });

  for (const mail of mails) {
    try {
      await transporter.sendMail({
        from: `"Mail Service" <${process.env.SMTP_USER}>`,
        to: mail.to,
        subject: mail.subject,
        html: mail.body,
      });

      mail.status = "sent";
      mail.sentAt = new Date();
      mail.retryCount = (mail.retryCount || 0) + 1;
      await mail.save();
      logger.info({ type: "RETRY_SUCCESS", email: mail.to });
    } catch (err) {
      mail.retryCount = (mail.retryCount || 0) + 1;
      if (mail.retryCount >= 3) mail.status = "hard_bounced";
      await mail.save();
      logger.error({ type: "RETRY_FAIL", email: mail.to, error: err.message });
    }
  }
};

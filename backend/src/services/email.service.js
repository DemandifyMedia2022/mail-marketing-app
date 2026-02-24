import mailer from "../config/mailer.js";
import Email from "../models/Email.js";

const sendEmailService = async ({ to, subject, body }) => {
  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: body
    });

    return await Email.create({
      to,
      subject,
      body,
      status: "sent",
      sentAt: new Date()
    });

  } catch (error) {
    console.error("Mail Send Error:", error.message);

    return await Email.create({
      to,
      subject,
      body,
      status: "failed",
      errorMessage: error.message
    });
  }
};

export default sendEmailService;

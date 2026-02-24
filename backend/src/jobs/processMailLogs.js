import fs from "fs";
import readline from "readline";
import Email from "../models/Email.js";

export async function processMailLogs() {
  const fileStream = fs.createReadStream("logs/combined.log");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      const log = JSON.parse(line);
      if (!log.email || !log.event) continue;

      const emailDoc = await Email.findOne({
        to: log.email,
        messageId: log.messageId,
      });

      if (!emailDoc) continue;

      switch (log.event) {
        case "queued":
          emailDoc.status = "queued";
          break;

        case "sent":
          emailDoc.status = "sent";
          emailDoc.sentAt = log.timestamp;
          break;

        case "soft_bounce":
          emailDoc.status = "soft_bounced";
          break;

        case "hard_bounce":
          emailDoc.status = "hard_bounced";
          break;

        case "open":
          emailDoc.openCount += 1;
          break;

        case "click":
          emailDoc.clickCount += 1;
          break;
      }

      await emailDoc.save();
    } catch (err) {
      console.error("Log parse error", err);
    }
  }
}

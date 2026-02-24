import Email from "../models/Email.js";
import { logEmailEvent } from "../utils/logger.js";

export const zeptoWebhook = async (req, res) => {
  try {
    const events = req.body;

    for (const e of events) {
      const email = e.email;
      const event = e.event; // delivered | bounced | opened | clicked
      const reason = e.reason || null;

      const emailDoc = await Email.findOne({ to: email }).sort({ createdAt: -1 });
      if (!emailDoc) continue;

      if (event === "bounced") {
        emailDoc.status = "hard_bounced";
        emailDoc.bounce = {
          reason,
          timestamp: new Date()
        };
      }

      if (event === "delivered") emailDoc.status = "delivered";
      if (event === "opened") emailDoc.openedAt = new Date();
      if (event === "clicked") emailDoc.clickedAt = new Date();

      await emailDoc.save();

      logEmailEvent({
        email,
        messageId: emailDoc._id.toString(),
        event,
        response: reason
      });
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error", err);
    res.status(500).send("Error");
  }



};


export async function handleZeptoWebhook(req, res) {
    const events = req.body; // array of events from Zepto
    for (const event of events) {
        const { email, status, reason, messageId } = event;

        // status examples: delivered, hard_bounce, soft_bounce, blocked
        await db.collection('emails').updateOne(
            { messageId },
            { $set: { status, reason, updatedAt: new Date() } },
            { upsert: true }
        );
    }
    res.status(200).send('Webhook received');
}
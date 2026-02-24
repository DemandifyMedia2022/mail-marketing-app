import Email from "../models/Email.js";
import CampaignSummary from "../models/CampaignSummary.js";

export const getMailSummary = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const emails = await Email.find({ campaignId });

    let sent = 0,
      failed = 0,
      softBounced = 0,
      hardBounced = 0;

    const results = emails.map((email) => {
      switch (email.status) {
        case "sent":
          sent++;
          break;
        case "soft_bounced":
          softBounced++;
          break;
        case "hard_bounced":
          hardBounced++;
          break;
        case "failed":
          failed++;
          break;
      }

      return {
        email: email.to,
        status: email.status,
        bounceType: email.bounce?.type || null,
        error: email.bounce?.reason || null,
      };
    });

    const summary = { sent, failed, softBounced, hardBounced };

    // Save summary in DB
    await CampaignSummary.findOneAndUpdate(
      { campaignId },
      { sent, failed, softBounced, hardBounced, results, createdAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ success: true, summary, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

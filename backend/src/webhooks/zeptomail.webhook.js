import Email from "../models/Email.js";
import logEmailEvent from "../utils/emailLogger.js";

export const zeptoWebhook = async (req, res) => {
  try {
    console.log("📩 ZeptoMail Webhook Event:");
    console.log(JSON.stringify(req.body, null, 2));

    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    for (const event of events) {
      if (!event.event_type) continue;

      // Find email by request_id or message_id
      let emailDoc = null;
      
      if (event.request_id) {
        emailDoc = await Email.findOne({ requestId: event.request_id });
      }
      
      if (!emailDoc && event.message_id) {
        emailDoc = await Email.findById(event.message_id);
      }

      if (!emailDoc) {
        console.log(`⚠️ No email found for request_id: ${event.request_id} or message_id: ${event.message_id}`);
        continue;
      }

      console.log(`📧 Processing webhook for email: ${emailDoc.to} - Event: ${event.event_type}`);

      // Update email status based on event type
      let newStatus = emailDoc.status;
      let updateData = {};

      switch (event.event_type) {
        case 'delivered':
          newStatus = 'delivered';
          updateData.deliveredAt = new Date();
          break;
          
        case 'bounce':
          if (event.bounce_type === 'hard') {
            newStatus = 'hard_bounced';
          } else if (event.bounce_type === 'soft') {
            newStatus = 'soft_bounced';
          }
          
          updateData.bounce = {
            type: event.bounce_type,
            reason: event.reason || event.bounce_reason || 'Unknown bounce reason',
            code: event.bounce_code || event.code,
            timestamp: new Date()
          };
          break;
          
        case 'dropped':
          newStatus = 'hard_bounced';
          updateData.bounce = {
            type: 'hard',
            reason: event.reason || 'Email dropped by provider',
            timestamp: new Date()
          };
          break;
          
        case 'spamreport':
          newStatus = 'hard_bounced';
          updateData.bounce = {
            type: 'hard',
            reason: 'Marked as spam by recipient',
            timestamp: new Date()
          };
          break;
          
        case 'click':
          // Click events are handled by trackClick endpoint
          console.log(`🖱️ Click event recorded for ${emailDoc.to}`);
          continue;
          
        case 'open':
          // Open events are handled by trackOpen endpoint
          console.log(`👁️ Open event recorded for ${emailDoc.to}`);
          continue;
          
        default:
          console.log(`ℹ️ Unhandled event type: ${event.event_type}`);
          continue;
      }

      // Update email document
      if (newStatus !== emailDoc.status) {
        emailDoc.status = newStatus;
        if (updateData.bounce) emailDoc.bounce = updateData.bounce;
        if (updateData.deliveredAt) emailDoc.deliveredAt = updateData.deliveredAt;
        
        await emailDoc.save();
        console.log(`✅ Email status updated: ${emailDoc.to} -> ${newStatus}`);
      }

      // Log the webhook event
      logEmailEvent({
        email: emailDoc.to,
        campaignId: emailDoc.campaignId,
        messageId: emailDoc._id.toString(),
        event: event.event_type,
        response: {
          webhookData: event,
          status: newStatus,
          reason: event.reason || event.bounce_reason
        },
        timestamp: new Date(),
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).send("Error processing webhook");
  }
};

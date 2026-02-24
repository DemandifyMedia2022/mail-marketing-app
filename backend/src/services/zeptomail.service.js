import fetch from 'node-fetch';

export async function sendEmailViaZeptoIndia({
  from,
  to,
  cc = [],
  reply_to = [],
  subject,
  htmlbody,
  attachments = [],
  track_clicks = true,
  track_opens = true,
  client_reference = "",
  mime_headers = {}
}) {
  try {
    const API_KEY = process.env.ZEPTO_API_KEY;
    if (!API_KEY) throw new Error("ZeptoMail API key missing in .env");

    const endpoint = "https://api.zeptomail.in/v1.1/email";

    // Build payload exactly matching ZeptoMail API format
    const payload = {
      from: {
        address: from.address,
        name: from.name
      },
      to: to.map(recipient => ({
        email_address: {
          address: recipient.email_address?.address || recipient.address,
          name: recipient.email_address?.name || recipient.name
        }
      })),
      subject,
      htmlbody,
      track_clicks,
      track_opens
    };

    // Add optional fields if provided
    if (cc.length > 0) {
      payload.cc = cc.map(recipient => ({
        email_address: {
          address: recipient.email_address?.address || recipient.address,
          name: recipient.email_address?.name || recipient.name
        }
      }));
    }

    if (reply_to.length > 0) {
      payload.reply_to = reply_to.map(recipient => ({
        address: recipient.address,
        name: recipient.name
      }));
    }

    if (attachments.length > 0) {
      payload.attachments = attachments;
    }

    if (client_reference) {
      payload.client_reference = client_reference;
    }

    if (mime_headers && Object.keys(mime_headers).length > 0) {
      payload.mime_headers = mime_headers;
    }

    console.log("ZeptoMail payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": API_KEY.trim()
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log("ZeptoMail response status:", response.status);
    console.log("ZeptoMail response text:", responseText);

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.warn("ZeptoMail returned non-JSON response:", responseText);
      data = { raw: responseText };
    }

    if (!response.ok) {
      throw new Error(`ZeptoMail India API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return {
      status: "queued",
      request_id: data.request_id || data.message_id || null,
      message: data.data?.[0]?.message || data.message || "Email request received",
      raw: data
    };

  } catch (err) {
    console.error("Error sending email via ZeptoMail India:", err.message);
    return {
      status: "error",
      error: err.message,
      request_id: null,
      raw: null
    };
  }
}

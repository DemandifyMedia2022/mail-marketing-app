import logger from './logger.js';

/**
 * Logs email events to the combined.log file and console in development
 * @param {Object} event
 * @param {string} event.email - Recipient email address
 * @param {string} event.campaignId - ID of the campaign
 * @param {string} event.messageId - Message ID from the email
 * @param {'queued'|'sent'|'soft_bounce'|'hard_bounce'|'open'|'click'} event.event - Event type
 * @param {number} [event.smtpCode] - SMTP response code
 * @param {string} [event.response] - Full SMTP response
 * @param {Date} [event.timestamp] - When the event occurred (defaults to now)
 */
const logEmailEvent = (event) => {
  // Ensure mandatory fields
  if (!event.email || !event.event) {
    console.warn("Email Logger: 'email' and 'event' fields are required.", event);
    return;
  }

  const timestamp = event.timestamp || new Date().toISOString();

  const logData = {
    timestamp,
    email: event.email,
    campaignId: event.campaignId || null,
    messageId: event.messageId || null,
    event: event.event,
    smtpCode: event.smtpCode || null,
    response: event.response || null,
  };

  // Log to combined.log using Winston
  logger.info('Email event', logData);

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[${timestamp}] Email Event: [${logData.event.toUpperCase()}] To: ${logData.email} Campaign: ${logData.campaignId || '-'} MessageID: ${logData.messageId || '-'} SMTP: ${logData.smtpCode || '-'} Response: ${logData.response || '-'}`
    );
  }
};

export default logEmailEvent;

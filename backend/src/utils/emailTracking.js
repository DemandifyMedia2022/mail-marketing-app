/**
 * Generate tracking pixel HTML for email
 */
export const generateTrackingPixel = (baseUrl, trackingCode) => {
  return `<img src="${baseUrl}/api/emails/track/open/${trackingCode}" width="1" height="1" style="display:none;" alt="" />`;
};

/**
 * Inject tracking pixel into email HTML
 */
export const injectTrackingPixel = (emailBody, baseUrl, trackingCode) => {
  const trackingPixel = generateTrackingPixel(baseUrl, trackingCode);
  
  // If email body doesn't have HTML tags, wrap it
  if (!emailBody.includes('<html') && !emailBody.includes('<body')) {
    return `<html><body>${emailBody}${trackingPixel}</body></html>`;
  }
  
  // Insert before closing body tag
  if (emailBody.includes('</body>')) {
    return emailBody.replace('</body>', `${trackingPixel}</body>`);
  }
  
  // If no closing body tag, append at the end
  return emailBody + trackingPixel;
};

/**
 * Generate unique tracking code
 */
export const generateTrackingCode = () => {
  // Simple fallback using Math.random() for ES module compatibility
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

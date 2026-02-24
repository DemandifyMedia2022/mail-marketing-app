export const convertLinksToTracked = (html, emailId) => {
  if (!html || !emailId) return html;

  return html.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, url) => {
      // ❌ Ignore already tracked links
      if (url.includes("/api/emails/track/click")) return match;

      // ❌ Ignore anchor links and javascript
      if (url.startsWith('#') || url.startsWith('javascript:')) return match;

      // ❌ Ignore survey links - they should open directly without tracking
      if (url.includes('survey.html') || url.includes('/survey?')) return match;

      // ✅ Ensure URL is properly encoded
      const encodedUrl = encodeURIComponent(url);
      // Use the configured base URL for network accessibility
      const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
      const trackedUrl = `${baseUrl}/api/emails/track/click/${emailId}?url=${encodedUrl}`;

      console.log(`🔗 Converting link: ${url} -> ${trackedUrl}`);
      
      return match.replace(url, trackedUrl);
    }
  );
};

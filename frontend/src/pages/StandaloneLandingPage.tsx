import React, { useState, useEffect } from 'react';
import LandingPageViewer from '../components/LandingPageViewer';

const StandaloneLandingPage: React.FC = () => {
  const [landingPageId, setLandingPageId] = useState<string | null>(null);
  const [emailId, setEmailId] = useState<string | undefined>();
  const [campaignId, setCampaignId] = useState<string | undefined>();
  const [recipientEmail, setRecipientEmail] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract landing page ID from URL path
    const pathParts = window.location.pathname.split('/');
    const idFromPath = pathParts[pathParts.length - 1];
    
    // Extract query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailIdParam = urlParams.get('emailId');
    const campaignIdParam = urlParams.get('campaignId');
    const recipientEmailParam = urlParams.get('email');

    if (idFromPath && idFromPath !== 'landing-page') {
      setLandingPageId(idFromPath);
      setEmailId(emailIdParam || undefined);
      setCampaignId(campaignIdParam || undefined);
      setRecipientEmail(recipientEmailParam || undefined);
      setLoading(false);
    } else {
      setError('Invalid landing page URL');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (error || !landingPageId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '18px', 
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Landing Page Not Found</h2>
          <p>The requested landing page could not be found or the URL is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <LandingPageViewer
      landingPageId={landingPageId}
      emailId={emailId}
      campaignId={campaignId}
      recipientEmail={recipientEmail}
    />
  );
};

export default StandaloneLandingPage;

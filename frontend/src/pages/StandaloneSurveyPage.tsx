import React, { useState, useEffect } from 'react';
import BasicSurveyForm from '../components/BasicSurveyForm';

const StandaloneSurveyPage: React.FC = () => {
  const [surveyId, setSurveyId] = useState<string>('basic-survey');
  const [emailId, setEmailId] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const surveyParam = urlParams.get('surveyId');
    const emailParam = urlParams.get('emailId');
    const recipientParam = urlParams.get('recipientEmail');

    if (surveyParam) setSurveyId(surveyParam);
    if (emailParam) setEmailId(emailParam);
    if (recipientParam) setRecipientEmail(recipientParam || '');
    
    setLoading(false);
  }, []);

  const handleSurveySubmit = (data: any) => {
    console.log('Survey submitted:', data);
    // Show success message and optionally redirect
    setTimeout(() => {
      window.close(); // Close the popup/tab after submission
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f3f4f6'
      }}>
        <div>Loading survey...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#1f2937', 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            We Value Your Feedback
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            marginBottom: '0'
          }}>
            Please take a moment to share your thoughts with us
          </p>
        </header>

        <main>
          <BasicSurveyForm 
            surveyId={surveyId}
            emailId={emailId}
            onSubmit={handleSurveySubmit}
          />
        </main>

        <footer style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          padding: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem',
            margin: '0'
          }}>
            Thank you for your time and feedback. Your responses help us improve our services.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default StandaloneSurveyPage;

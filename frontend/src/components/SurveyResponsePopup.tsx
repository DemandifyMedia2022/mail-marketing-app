import React from 'react';

interface SurveyResponsePopupProps {
  surveyData: any;
  onClose: () => void;
}

const SurveyResponsePopup: React.FC<SurveyResponsePopupProps> = ({ surveyData, onClose }) => {
  if (!surveyData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>

        <h3 style={{
          color: '#1f2937',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          marginTop: '8px'
        }}>
          Survey Response Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Name
            </label>
            <p style={{
              color: '#1f2937',
              fontSize: '1rem',
              margin: '0',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {surveyData.name}
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Contact Number
            </label>
            <p style={{
              color: '#1f2937',
              fontSize: '1rem',
              margin: '0',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {surveyData.contact}
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Interested in Services
            </label>
            <p style={{
              color: '#1f2937',
              fontSize: '1rem',
              margin: '0',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {surveyData.interested ? 'Yes' : 'No'}
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Feedback
            </label>
            <p style={{
              color: '#1f2937',
              fontSize: '1rem',
              margin: '0',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              minHeight: '60px'
            }}>
              {surveyData.feedback}
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Submitted On
            </label>
            <p style={{
              color: '#1f2937',
              fontSize: '1rem',
              margin: '0',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {new Date(surveyData.timestamp).toLocaleString()}
            </p>
          </div>

          {surveyData.emailId && (
            <div>
              <label style={{
                display: 'block',
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Email Details
              </label>
              <p style={{
                color: '#1f2937',
                fontSize: '1rem',
                margin: '0',
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                {surveyData.emailId?.recipient} - {surveyData.emailId?.subject}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResponsePopup;

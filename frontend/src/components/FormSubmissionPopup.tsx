import React from 'react';

interface FormSubmissionPopupProps {
  formSubmissionData: any;
  onClose: () => void;
}

const FormSubmissionPopup: React.FC<FormSubmissionPopupProps> = ({ formSubmissionData, onClose }) => {
  if (!formSubmissionData) return null;

  const formatFormData = (formData: any) => {
    if (!formData) return [];
    
    return Object.entries(formData).map(([key, value]: [string, any]) => ({
      fieldName: key,
      type: value.type || 'text',
      placeholder: value.placeholder || '',
      required: value.required || false,
      value: value.value || ''
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formattedData = Array.isArray(formSubmissionData) 
    ? formSubmissionData 
    : formatFormData(formSubmissionData.formData);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Form Submission Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Submission Info */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Recipient Email
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {formSubmissionData.recipientEmail || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Submitted At
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {formatDate(formSubmissionData.submittedAt)}
              </div>
            </div>
            {formSubmissionData.campaignId && (
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Campaign
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {formSubmissionData.campaignId?.name || 'N/A'}
                </div>
              </div>
            )}
            {formSubmissionData.landingPageId && (
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Landing Page
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {formSubmissionData.landingPageId?.name || formSubmissionData.landingPageId?.title || 'N/A'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Form Data
          </h3>
          
          {formattedData.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {formattedData.map((field: any, index: number) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {field.placeholder || `Field ${index + 1}`}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        textTransform: 'uppercase'
                      }}>
                        {field.type}
                      </span>
                      {field.required && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e'
                        }}>
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    minHeight: '20px'
                  }}>
                    {field.value || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No value provided</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              No form data available
            </div>
          )}
        </div>

        {/* Technical Info */}
        {(formSubmissionData.ipAddress || formSubmissionData.userAgent) && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Technical Information:</strong>
            </div>
            {formSubmissionData.ipAddress && (
              <div>IP Address: {formSubmissionData.ipAddress}</div>
            )}
            {formSubmissionData.userAgent && (
              <div style={{ wordBreak: 'break-all' }}>
                User Agent: {formSubmissionData.userAgent}
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div style={{
          marginTop: '24px',
          textAlign: 'right'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormSubmissionPopup;

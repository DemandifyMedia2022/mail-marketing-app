import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BlockElement {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'form' | 'divider' | 'container';
  content: any;
  styles: React.CSSProperties;
  containerStyles?: {
    display: 'block' | 'flex' | 'inline-flex';
    flexDirection: 'row' | 'column';
    alignItems: 'stretch' | 'center' | 'flex-end' | 'flex-start';
    justifyContent: 'space-around' | 'space-between' | 'center' | 'flex-end' | 'flex-start';
    gap: string;
    padding: string;
    margin: string;
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  };
}

interface LandingPageData {
  _id: string;
  name: string;
  title: string;
  description: string;
  contentType: 'html' | 'iframe' | 'pdf';
  content: string;
  contentUrl: string;
  thumbnail?: string;
}

interface LandingPageViewerProps {
  landingPageId: string;
  emailId?: string;
  campaignId?: string;
  recipientEmail?: string;
}

const LandingPageViewer: React.FC<LandingPageViewerProps> = ({
  landingPageId,
  emailId,
  campaignId,
  recipientEmail
}) => {
  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/landing-pages/${landingPageId}`);
        
        if (response.data.success) {
          setLandingPage(response.data.data);
          
          // Parse content if it's from the builder
          try {
            const parsedContent = JSON.parse(response.data.data.content);
            
            // Check if the parsed content has elements array (builder format)
            if (parsedContent.elements && Array.isArray(parsedContent.elements)) {
              setPageData(parsedContent);
            } else {
              // If it's not the expected format, treat as regular content
              setPageData(null);
            }
          } catch (e) {
            // If it's not JSON, treat it as regular HTML content
            setPageData(null);
          }
          
          // Record acknowledgement when page loads
          await recordAcknowledgement(response.data.data._id);
        } else {
          setError('Failed to load landing page');
        }
      } catch (err) {
        console.error('Error fetching landing page:', err);
        setError('Landing page not found');
      } finally {
        setLoading(false);
      }
    };

    if (landingPageId) {
      fetchLandingPage();
    }
  }, [landingPageId]);

  const recordAcknowledgement = async (pageId: string) => {
    try {
      await axios.post(`/api/landing-pages/${pageId}/acknowledge`, {
        emailId,
        campaignId,
        recipientEmail,
      });
      
      setAcknowledged(true);
    } catch (err) {
      console.error('Error recording acknowledgement:', err);
    }
  };

  // Render individual elements like in the builder
  const renderElement = (element: BlockElement) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = element.content.level || 'h1';
        return (
          <HeadingTag style={element.styles}>
            {element.content.text}
          </HeadingTag>
        );

      case 'text':
        return (
          <div style={element.styles}>
            {element.content.text}
          </div>
        );

      case 'button':
        return (
          <div style={{ 
            textAlign: element.styles.textAlign || 'left',
            margin: element.styles.margin || '0px',
            padding: element.styles.padding || '10px'
          }}>
            <button 
              style={{
                ...element.styles,
                textAlign: 'center',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (element.content.href && element.content.href !== '#') {
                  window.open(element.content.href, '_blank');
                }
              }}
            >
              {element.content.text}
            </button>
          </div>
        );

      case 'image':
        if (element.content.isBackground) {
          return (
            <div
              style={{
                ...element.styles,
                backgroundImage: `url(${element.content.src})`,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: element.styles.height || '400px',
                position: 'relative',
                backgroundSize: element.styles.backgroundSize || 'cover',
                backgroundPosition: element.styles.backgroundPosition || 'center',
                backgroundRepeat: element.styles.backgroundRepeat || 'no-repeat'
              }}
            >
              {element.content.overlayText && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  zIndex: 1,
                  maxWidth: '80%',
                  padding: '20px'
                }}>
                  {element.content.overlayText}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <img
                src={element.content.src}
                alt={element.content.alt || ''}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: element.styles.borderRadius || '8px',
                  boxShadow: element.styles.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          );
        }

      case 'form':
        return (
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            padding: '20px'
          }}>
            <form 
              style={element.styles}
              onSubmit={async (e) => {
                e.preventDefault();
                
                // Collect form data with validation
                const formData = new FormData(e.currentTarget);
                const data: any = {};
                let isValid = true;
                const errors: string[] = [];
                
                element.content.fields.forEach((field: any, index: number) => {
                  const fieldName = `field_${index}`;
                  const rawValue = formData.get(fieldName);
                  const value = typeof rawValue === 'string' ? rawValue : '';
                  
                  // Validation
                  if (field.required && !value.trim()) {
                    isValid = false;
                    errors.push(`${field.placeholder || 'Field ' + (index + 1)} is required`);
                    return;
                  }
                  
                  // Type-specific validation
                  if (field.type === 'email' && value) {
                    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                    if (!emailRegex.test(value)) {
                      isValid = false;
                      errors.push(`${field.placeholder || 'Email'} is not a valid email address`);
                      return;
                    }
                  }
                  
                  if (field.type === 'tel' && value) {
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(value)) {
                      isValid = false;
                      errors.push(`${field.placeholder || 'Phone'} is not a valid phone number`);
                      return;
                    }
                  }
                  
                  if (field.type === 'number' && value) {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                      isValid = false;
                      errors.push(`${field.placeholder || 'Number'} must be a valid number`);
                      return;
                    }
                    if (field.min !== undefined && numValue < field.min) {
                      isValid = false;
                      errors.push(`${field.placeholder || 'Number'} must be at least ${field.min}`);
                      return;
                    }
                    if (field.max !== undefined && numValue > field.max) {
                      isValid = false;
                      errors.push(`${field.placeholder || 'Number'} must be at most ${field.max}`);
                      return;
                    }
                  }
                  
                  data[fieldName] = {
                    type: field.type,
                    placeholder: field.placeholder,
                    required: field.required,
                    value: value.trim(),
                    label: field.label || field.placeholder || `Field ${index + 1}`
                  };
                });

                if (!isValid) {
                  alert('Please fix the following errors:\n' + errors.join('\n'));
                  return;
                }

                try {
                  // Submit form data to backend
                  const response = await axios.post(`http://localhost:5000/api/landing-pages/${landingPageId}/submit-form`, {
                    landingPageId: landingPageId,
                    emailId: emailId,
                    campaignId: campaignId,
                    recipientEmail: recipientEmail,
                    formData: data,
                    submittedAt: new Date().toISOString()
                  });

                  if (response.data.success) {
                    alert('Form submitted successfully!');
                    e.currentTarget.reset();
                  } else {
                    alert('Failed to submit form. Please try again.');
                  }
                } catch (error) {
                  console.error('Error submitting form:', error);
                  alert('Error submitting form. Please try again.');
                }
              }}
            >
              {element.content.fields.map((field: any, index: number) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={`field_${index}`}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={`field_${index}`}
                      required={field.required}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option: string, optIndex: number) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={`field_${index}`}
                      placeholder={field.placeholder}
                      required={field.required}
                      min={field.type === 'number' ? (field.min || 0) : undefined}
                      max={field.type === 'number' ? (field.max || undefined) : undefined}
                      step={field.type === 'number' ? (field.step || 'any') : undefined}
                      pattern={field.type === 'email' ? '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$' : undefined}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {element.content.submitText}
              </button>
            </form>
          </div>
        );

      case 'divider':
        return (
          <div style={{
            width: '100%',
            height: element.styles.height || '1px',
            backgroundColor: element.styles.backgroundColor || '#e5e7eb',
            margin: element.styles.margin || '24px 0'
          }} />
        );

      case 'container':
        return (
          <div style={{
            ...element.styles,
            ...element.containerStyles,
            border: element.styles.border || 'none',
            backgroundColor: element.styles.backgroundColor || '#f9fafb',
            minHeight: element.styles.minHeight || '100px',
            padding: element.styles.padding || '20px',
            margin: element.styles.margin || '0px',
            borderRadius: element.styles.borderRadius || '8px',
            width: element.styles.width || '100%',
            height: element.styles.height || 'auto',
            maxWidth: element.styles.maxWidth || 'none',
            // Add overflow control to prevent elements from going outside
            overflow: 'hidden',
            // Ensure container respects its size constraints
            boxSizing: 'border-box',
            // Add minimum width to prevent container from becoming too small
            minWidth: element.styles.minWidth || '200px'
          }}>
            {element.content.children.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#9ca3af',
                fontSize: '14px',
                border: '2px dashed #d1d5db',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                  <div>Container - Empty</div>
                </div>
              </div>
            ) : (
              <div style={{
                display: element.containerStyles?.display || 'flex',
                flexDirection: element.containerStyles?.flexDirection || 'row',
                alignItems: element.containerStyles?.alignItems || 'center',
                justifyContent: element.containerStyles?.justifyContent || 'flex-start',
                gap: element.containerStyles?.gap || '16px',
                width: '100%',
                height: '100%',
                minHeight: '100px',
                flexWrap: element.containerStyles?.flexWrap || 'nowrap',
                position: 'relative',
                // Prevent overflow in flex container
                overflow: 'hidden',
                // Ensure proper sizing
                boxSizing: 'border-box'
              }}>
                {element.content.children.map((childId: string) => {
                  const childElement = pageData?.elements.find((el: BlockElement) => el.id === childId);
                  if (!childElement) return null;
                  
                  // Apply child element wrapper styling for proper flex behavior
                  const childElementStyles = {
                    ...childElement.styles,
                    border: 'none',
                    position: 'relative' as const,
                    cursor: 'default',
                    minHeight: childElement.styles.minHeight || 'auto',
                    minWidth: childElement.styles.minWidth || 'auto',
                    // Better width handling for different element types
                    width: childElement.type === 'image' ? (childElement.styles.width || '100%') : (childElement.styles.width || 'auto'),
                    height: childElement.styles.height || 'auto',
                    padding: childElement.styles.padding || '10px',
                    margin: childElement.styles.margin || '0px',
                    backgroundColor: childElement.styles.backgroundColor || 'transparent',
                    borderRadius: childElement.styles.borderRadius || '0px',
                    display: childElement.styles.display || 'block',
                    // Enhanced flex properties for better container behavior
                    flex: childElement.styles.flex || '0 1 auto',
                    flexGrow: childElement.styles.flexGrow !== undefined ? childElement.styles.flexGrow : 0,
                    flexShrink: childElement.styles.flexShrink !== undefined ? childElement.styles.flexShrink : 1,
                    flexBasis: childElement.styles.flexBasis || 'auto',
                    // Ensure proper flex alignment
                    alignSelf: childElement.styles.alignSelf || 'auto',
                    // Remove conflicting margin-based alignment for flex items
                    marginLeft: childElement.styles.marginLeft || '0',
                    marginRight: childElement.styles.marginRight || '0',
                    marginTop: childElement.styles.marginTop || '0',
                    marginBottom: childElement.styles.marginBottom || '0',
                    // Add overflow control to prevent child elements from overflowing
                    overflow: 'hidden',
                    // Ensure proper box sizing
                    boxSizing: 'border-box',
                    // Limit maximum width to prevent overflow
                    maxWidth: '100%',
                    // Ensure text doesn't overflow
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  };

                  // Apply self-alignment only for non-flex containers or when explicitly needed
                  const childAlignmentStyles = (element.containerStyles?.display !== 'flex' && element.containerStyles?.display !== 'inline-flex') 
                    ? (childElement.styles.textAlign === 'center' 
                      ? { marginLeft: 'auto', marginRight: 'auto' }
                      : childElement.styles.textAlign === 'right' 
                      ? { marginLeft: 'auto', marginRight: '0' }
                      : { marginLeft: '0', marginRight: '0' })
                    : {};

                  const finalChildStyles = {
                    ...childElementStyles,
                    ...childAlignmentStyles
                  };

                  return (
                    <div key={childElement.id} style={finalChildStyles}>
                      {renderElement(childElement)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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

  if (error || !landingPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
          {error || 'Landing page not found'}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // If we have parsed page data from the builder, render it properly
    if (pageData && pageData.elements) {
      return (
        <div style={{ 
          fontFamily: pageData.globalStyles?.fontFamily || 'Inter, sans-serif',
          backgroundColor: pageData.globalStyles?.backgroundColor || '#ffffff',
          minHeight: '100vh',
          width: '95%',
          padding: '40px 25px',
          overflowX: 'hidden'
        }}>
          {pageData.elements.map((element: BlockElement) => {
            // Check if this element is inside any container
            const isInsideContainer = pageData.elements.some((container: BlockElement) => 
              container.type === 'container' && 
              container.content.children && 
              container.content.children.includes(element.id)
            );
            
            // Only render elements that are NOT inside containers
            if (isInsideContainer) {
              return null;
            }
            
            return (
              <div key={element.id} style={{ marginBottom: element.styles.marginBottom || '0px' }}>
                {renderElement(element)}
              </div>
            );
          })}
        </div>
      );
    }

    // Otherwise, fall back to the original content rendering
    switch (landingPage.contentType) {
      case 'html':
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: landingPage.content }}
            style={{ minHeight: '60vh', padding: '40px 25px' }}
          />
        );
      
      case 'iframe':
        return (
          <iframe
            src={landingPage.contentUrl}
            style={{
              width: '100%',
              height: '80vh',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            title={landingPage.title}
          />
        );
      
      case 'pdf':
        return (
          <iframe
            src={landingPage.contentUrl}
            style={{
              width: '100%',
              height: '80vh',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            title={landingPage.title}
          />
        );
      
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: pageData ? pageData.globalStyles?.backgroundColor || '#ffffff' : '#f8fafc',
      margin: 0,
      padding: 0,
      fontFamily: pageData?.globalStyles?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {renderContent()}
    </div>
  );
};

export default LandingPageViewer;

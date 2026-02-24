import React, { useState } from 'react';
import axios from 'axios';

interface BlockElement {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'form' | 'divider' | 'container';
  content: any;
  styles: React.CSSProperties;
  containerStyles?: {
    display: 'flex' | 'block' | 'inline-flex' | 'inline-block';
    flexDirection: 'row' | 'column';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    gap: string;
    padding: string;
    margin: string;
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  };
}

interface LandingPageData {
  name: string;
  title: string;
  description: string;
  elements: BlockElement[];
  globalStyles: {
    fontFamily: string;
    primaryColor: string;
    backgroundColor: string;
  };
}

// Helper function to render elements in saved page (non-interactive)
const renderSavedElement = (element: BlockElement, pageData: LandingPageData) => {
  // Apply the same elementStyles as edit mode for consistency
  const elementStyles = {
    ...element.styles,
    border: 'none', // No selection border in saved page
    position: 'relative' as const,
    cursor: 'default',
    minHeight: element.styles.minHeight || 'auto',
    minWidth: element.styles.minWidth || 'auto',
    width: element.styles.width || 'auto',
    height: element.styles.height || 'auto',
    padding: element.styles.padding || '10px',
    margin: element.styles.margin || '10px 0',
    backgroundColor: element.styles.backgroundColor || 'transparent',
    borderRadius: element.styles.borderRadius || '0px',
    display: element.styles.display || 'block'
  };

  // Apply the same alignment logic as edit mode
  const alignmentStyles = element.styles.textAlign === 'center' 
    ? { marginLeft: 'auto', marginRight: 'auto' }
    : element.styles.textAlign === 'right' 
    ? { marginLeft: 'auto', marginRight: '0' }
    : { marginLeft: '0', marginRight: '0' };

  const finalElementStyles = {
    ...elementStyles,
    ...alignmentStyles
  };

  switch (element.type) {
    case 'heading':
      const HeadingTag = element.content.level || 'h1';
      return (
        <div key={element.id} style={finalElementStyles}>
          <HeadingTag style={{
            margin: 0,
            color: element.styles.color || '#000000',
            fontSize: element.styles.fontSize || 'inherit',
            textAlign: element.styles.textAlign || 'left'
          }}>
            {element.content.text}
          </HeadingTag>
        </div>
      );

    case 'text':
      return (
        <div key={element.id} style={finalElementStyles}>
          <div style={{
            margin: 0,
            color: element.styles.color || '#000000',
            fontSize: element.styles.fontSize || '16px',
            lineHeight: element.styles.lineHeight || '1.5',
            textAlign: element.styles.textAlign || 'left'
          }}>
            {element.content.text}
          </div>
        </div>
      );

    case 'button':
      return (
        <div key={element.id} style={finalElementStyles}>
          <a 
            href={element.content.href || '#'}
            style={{
              textDecoration: 'none',
              display: 'inline-block'
            }}
            onClick={(e) => {
              if (element.content.href && element.content.href !== '#') {
                return;
              } else {
                e.preventDefault();
              }
            }}
          >
            <button style={{
              textAlign: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              width: '100%',
              padding: element.styles.padding || '10px 20px',
              border: element.styles.border || '1px solid #3b82f6',
              backgroundColor: element.styles.backgroundColor || '#3b82f6',
              color: element.styles.color || '#ffffff',
              borderRadius: element.styles.borderRadius || '6px',
              fontSize: element.styles.fontSize || '16px'
            }}>
              {element.content.text}
            </button>
          </a>
        </div>
      );

    case 'image':
      if (element.content.isBackground) {
        return (
          <div key={element.id} style={{
            ...finalElementStyles,
            backgroundImage: `url(${element.content.src})`,
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: element.styles.height || '400px',
            height: element.styles.height || '400px',
            width: '100%',
            position: 'relative',
            backgroundSize: element.styles.backgroundSize || 'cover',
            backgroundPosition: element.styles.backgroundPosition || 'center',
            backgroundRepeat: element.styles.backgroundRepeat || 'no-repeat',
            margin: element.styles.margin || '0px',
            padding: element.styles.padding || '0px'
          }}>
            {element.content.overlayText && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: element.content.overlayTextAlign === 'left' ? '20px' : 
                       element.content.overlayTextAlign === 'right' ? 'auto' : '50%',
                right: element.content.overlayTextAlign === 'right' ? '20px' : 'auto',
                transform: element.content.overlayTextAlign === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
                textAlign: element.content.overlayTextAlign || 'center',
                color: element.content.overlayTextColor || '#ffffff',
                fontSize: element.content.overlayFontSize || '24px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                zIndex: 1,
                maxWidth: element.content.overlayTextAlign === 'center' ? '80%' : 'calc(100% - 40px)',
                padding: '20px',
                wordWrap: 'break-word'
              }}>
                {element.content.overlayText}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <img
            key={element.id}
            src={element.content.src}
            alt={element.content.alt || ''}
            style={{
              ...finalElementStyles,
              maxWidth: element.styles.width || '100%',
              height: 'auto',
              borderRadius: element.styles.borderRadius || '8px',
              boxShadow: element.styles.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'block'
            }}
          />
        );
      }

    case 'form':
      return (
        <div key={element.id} style={finalElementStyles}>
          <form style={{
            width: '100%',
            margin: 0,
            padding: 0,
            overflow: 'visible',
            boxSizing: 'border-box',
            minHeight: 'auto'
          }}>
            {element.content.fields.map((field: any, index: number) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {element.content.submitText}
            </button>
          </form>
        </div>
      );

    case 'divider':
      return (
        <div key={element.id} style={{
          ...finalElementStyles,
          width: '100%',
          height: element.styles.height || '1px',
          backgroundColor: element.styles.backgroundColor || '#e5e7eb',
          margin: element.styles.margin || '24px 0'
        }} />
      );

    case 'container':
      return (
        <div key={element.id} style={{
          ...finalElementStyles,
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
          overflow: 'visible', // Changed from hidden to visible
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
              overflow: 'visible'
            }}>
              {element.content.children.map((childId: string) => {
                const childElement = pageData.elements.find(el => el.id === childId);
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
                  marginBottom: childElement.styles.marginBottom || '0'
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
                    {(() => {
                      switch (childElement.type) {
                        case 'heading':
                          const HeadingTag = childElement.content.level || 'h1';
                          return (
                            <HeadingTag style={{
                              margin: 0,
                              color: childElement.styles.color || '#000000',
                              fontSize: childElement.styles.fontSize || 'inherit'
                            }}>
                              {childElement.content.text}
                            </HeadingTag>
                          );

                        case 'text':
                          return (
                            <div style={{
                              margin: 0,
                              color: childElement.styles.color || '#000000',
                              fontSize: childElement.styles.fontSize || '16px',
                              lineHeight: childElement.styles.lineHeight || '1.5'
                            }}>
                              {childElement.content.text}
                            </div>
                          );

                        case 'button':
                          return (
                            <a 
                              href={childElement.content.href || '#'}
                              style={{
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                              onClick={(e) => {
                                if (childElement.content.href && childElement.content.href !== '#') {
                                  return;
                                } else {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <button style={{
                                margin: 0,
                                padding: childElement.styles.padding || '10px 20px',
                                border: childElement.styles.border || '1px solid #3b82f6',
                                backgroundColor: childElement.styles.backgroundColor || '#3b82f6',
                                color: childElement.styles.color || '#ffffff',
                                borderRadius: childElement.styles.borderRadius || '6px',
                                fontSize: childElement.styles.fontSize || '16px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                width: 'fit-content'
                              }}>
                                {childElement.content.text}
                              </button>
                            </a>
                          );

                        case 'image':
                          if (childElement.content.isBackground) {
                            return (
                              <div style={{
                                width: childElement.styles.width || '100%',
                                height: childElement.styles.height || '200px',
                                backgroundImage: `url(${childElement.content.src})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: childElement.styles.borderRadius || '8px',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {childElement.content.overlayText && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: childElement.content.overlayColor || '#ffffff',
                                    fontSize: childElement.content.overlayFontSize || '24px',
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                                    zIndex: 1,
                                    maxWidth: '80%',
                                    padding: '20px',
                                    wordWrap: 'break-word',
                                    textAlign: 'center'
                                  }}>
                                    {childElement.content.overlayText}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <img
                                src={childElement.content.src}
                                alt={childElement.content.alt || ''}
                                style={{
                                  maxWidth: childElement.styles.width || '100%',
                                  height: childElement.styles.height || 'auto',
                                  borderRadius: childElement.styles.borderRadius || '8px',
                                  display: 'block',
                                  // Better flex behavior for containers
                                  width: childElement.styles.width || '100%',
                                  minWidth: 'auto',
                                  objectFit: childElement.styles.objectFit || 'cover',
                                  // Ensure proper sizing in flex containers
                                  flexShrink: 1,
                                  flexGrow: 0
                                }}
                              />
                            );
                          }

                        case 'form':
                          return (
                            <form style={{
                              width: '100%',
                              margin: 0,
                              padding: 0
                            }}>
                              {childElement.content.fields.map((field: any, index: number) => (
                                <div key={index} style={{ marginBottom: '8px' }}>
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              ))}
                              <button
                                type="submit"
                                style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  padding: '8px 16px',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  cursor: 'pointer'
                                }}
                              >
                                {childElement.content.submitText}
                              </button>
                            </form>
                          );

                        case 'divider':
                          return (
                            <div style={{
                              width: '100%',
                              height: childElement.styles.height || '1px',
                              backgroundColor: childElement.styles.backgroundColor || '#e5e7eb',
                              margin: 0
                            }} />
                          );

                        default:
                          return null;
                      }
                    })()}
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

interface LandingPageBuilderProps {
  onSave: (pageData: LandingPageData) => void;
  onCancel: () => void;
  initialData?: Partial<LandingPageData>;
  editingPage?: any; // LandingPage from the list
}

const LandingPageBuilder: React.FC<LandingPageBuilderProps> = ({ onSave, onCancel, initialData, editingPage }) => {
  // Convert editingPage to initialData if provided
  const effectiveInitialData = editingPage ? {
    name: editingPage.name || '',
    title: editingPage.title || '',
    description: editingPage.description || '',
    elements: (() => {
      try {
        if (editingPage.content) {
          if (typeof editingPage.content === 'string') {
            // Try to parse JSON content
            const parsed = JSON.parse(editingPage.content);
            // Check if it has elements array or is directly the elements array
            if (parsed.elements && Array.isArray(parsed.elements)) {
              return parsed.elements;
            } else if (Array.isArray(parsed)) {
              return parsed;
            } else if (parsed.type && parsed.content) {
              // Single element format
              return [parsed];
            }
          } else if (editingPage.content.elements && Array.isArray(editingPage.content.elements)) {
            return editingPage.content.elements;
          } else if (Array.isArray(editingPage.content)) {
            return editingPage.content;
          }
        }
        return [];
      } catch (error) {
        console.error('Error parsing landing page content:', error);
        console.log('Content being parsed:', editingPage.content);
        return [];
      }
    })(),
    globalStyles: {
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      ...(editingPage.globalStyles || {}),
      ...(editingPage.content?.globalStyles || {})
    }
  } : initialData;

  const [pageData, setPageData] = useState<LandingPageData>({
    name: effectiveInitialData?.name || '',
    title: effectiveInitialData?.title || '',
    description: effectiveInitialData?.description || '',
    elements: effectiveInitialData?.elements || [],
    globalStyles: {
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      ...effectiveInitialData?.globalStyles
    }
  });

  // Debug logging for editing page data
  React.useEffect(() => {
    if (editingPage) {
      console.log('Editing page data:', editingPage);
      console.log('Parsed elements:', effectiveInitialData?.elements);
      console.log('Final pageData:', pageData);
    }
  }, [editingPage]);

  // Update pageData when editingPage changes
  React.useEffect(() => {
    if (editingPage) {
      const loadedElements = (() => {
        try {
          if (editingPage.content) {
            if (typeof editingPage.content === 'string') {
              // Try to parse JSON content
              const parsed = JSON.parse(editingPage.content);
              console.log('Parsed content:', parsed);
              // Check if it has elements array or is directly the elements array
              if (parsed.elements && Array.isArray(parsed.elements)) {
                return parsed.elements;
              } else if (Array.isArray(parsed)) {
                return parsed;
              } else if (parsed.type && parsed.content) {
                // Single element format
                return [parsed];
              }
            } else if (editingPage.content.elements && Array.isArray(editingPage.content.elements)) {
              return editingPage.content.elements;
            } else if (Array.isArray(editingPage.content)) {
              return editingPage.content;
            }
          }
          return [];
        } catch (error) {
          console.error('Error parsing landing page content:', error);
          console.log('Content being parsed:', editingPage.content);
          return [];
        }
      })();

      const loadedGlobalStyles = {
        fontFamily: 'Inter, sans-serif',
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        ...(editingPage.globalStyles || {}),
        ...(editingPage.content?.globalStyles || {})
      };

      setPageData({
        name: editingPage.name || '',
        title: editingPage.title || '',
        description: editingPage.description || '',
        elements: loadedElements,
        globalStyles: loadedGlobalStyles
      });

      console.log('Updated pageData with:', {
        name: editingPage.name,
        title: editingPage.title,
        elementsCount: loadedElements.length,
        globalStyles: loadedGlobalStyles
      });
    }
  }, [editingPage]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [activeCategory, setActiveCategory] = useState<'basic' | 'advanced'>('basic');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string>('se');

  // Element templates
  const elementTemplates = {
    heading: {
      id: `heading-${Date.now()}`,
      type: 'heading' as const,
      content: { text: 'Your Heading Here', level: 'h1' },
      styles: {
        fontSize: '48px',
        fontWeight: 'bold' as const,
        color: '#1f2937',
        textAlign: 'center' as const,
        marginBottom: '24px'
      }
    },
    text: {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      content: { text: 'Your paragraph text goes here. This is where you can add detailed information about your product or service.' },
      styles: {
        fontSize: '16px',
        color: '#4b5563',
        lineHeight: '1.6',
        marginBottom: '16px'
      }
    },
    button: {
      id: `button-${Date.now()}`,
      type: 'button' as const,
      content: { text: 'Click Me', href: '#' },
      styles: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'inline-block',
        marginBottom: '16px'
      }
    },
    image: {
      id: `image-${Date.now()}`,
      type: 'image' as const,
      content: { src: 'https://via.placeholder.com/400x200', alt: 'Placeholder image', isBackground: false, overlayText: '' },
      styles: {
        width: '400px',
        height: '200px',
        borderRadius: '8px',
        marginBottom: '16px',
        position: 'relative' as const,
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center' as const,
        backgroundRepeat: 'no-repeat' as const
      }
    },
    form: {
      id: `form-${Date.now()}`,
      type: 'form' as const,
      content: { 
        fields: [
          { name: 'email', type: 'email', placeholder: 'Enter your email', required: true },
          { name: 'name', type: 'text', placeholder: 'Enter your name', required: false }
        ],
        submitText: 'Submit'
      },
      styles: {
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        marginBottom: '16px'
      }
    },
    container: {
      id: `container-${Date.now()}`,
      type: 'container' as const,
      content: { children: [] },
      styles: {
        width: '100%',
        minHeight: '200px',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        marginBottom: '16px',
        position: 'relative' as const
      },
      containerStyles: {
        display: 'flex' as const,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'flex-start' as const,
        gap: '16px',
        padding: '16px',
        margin: '0px'
      }
    },
    divider: {
      id: `divider-${Date.now()}`,
      type: 'divider' as const,
      content: {},
      styles: {
        width: '100%',
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '24px 0'
      }
    }
  };

  const handleSidebarDragStart = (e: React.DragEvent, type: keyof typeof elementTemplates) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('element-type', type);
  };

  const addElement = (type: keyof typeof elementTemplates) => {
    const newElement = { ...elementTemplates[type] } as BlockElement;
    newElement.id = `${type}-${Date.now()}`;
    setPageData(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const updateElement = (id: string, updates: Partial<BlockElement>) => {
    setPageData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const deleteElement = (id: string) => {
    setPageData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    setSelectedElement(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setIsDragging(elementId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', elementId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverId(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (isDragging && isDragging !== targetId) {
      const draggedIndex = pageData.elements.findIndex(el => el.id === isDragging);
      const targetIndex = pageData.elements.findIndex(el => el.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newElements = [...pageData.elements];
        const [draggedElement] = newElements.splice(draggedIndex, 1);
        newElements.splice(targetIndex, 0, draggedElement);
        
        setPageData(prev => ({
          ...prev,
          elements: newElements
        }));
      }
    }
    setIsDragging(null);
    setDraggedOverId(null);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
    setDraggedOverId(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, elementId: string, direction: string = 'se') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(elementId);
    setResizeDirection(direction);
    
    const element = pageData.elements.find(el => el.id === elementId);
    if (element) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: parseInt(element.styles.width as string) || 400,
        height: parseInt(element.styles.height as string) || 200
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && resizeStart) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      // Handle different resize directions
      switch (resizeDirection) {
        case 'se':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          break;
        case 'e':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          break;
        case 's':
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(50, resizeStart.height - deltaY);
          break;
      }
      
      updateElement(isResizing, {
        styles: {
          ...pageData.elements.find(el => el.id === isResizing)?.styles,
          width: `${newWidth}px`,
          height: `${newHeight}px`
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
    setResizeStart(null);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart, resizeDirection]);

  // Arrow key resize functionality
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElement && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const element = pageData.elements.find(el => el.id === selectedElement);
        if (element && (element.type === 'image' || element.type === 'button' || element.type === 'form' || element.type === 'heading' || element.type === 'text')) {
          e.preventDefault();
          
          const currentWidth = parseInt(element.styles.width as string) || (element.type === 'text' || element.type === 'heading' ? 300 : 400);
          const currentHeight = parseInt(element.styles.height as string) || (element.type === 'text' || element.type === 'heading' ? 100 : 200);
          const step = e.shiftKey ? 10 : 1; // Larger steps with Shift key
          
          let newWidth = currentWidth;
          let newHeight = currentHeight;
          
          switch (e.key) {
            case 'ArrowRight':
              newWidth = Math.max(50, currentWidth + step);
              break;
            case 'ArrowLeft':
              newWidth = Math.max(50, currentWidth - step);
              break;
            case 'ArrowDown':
              newHeight = Math.max(50, currentHeight + step);
              break;
            case 'ArrowUp':
              newHeight = Math.max(50, currentHeight - step);
              break;
          }
          
          updateElement(selectedElement, {
            styles: {
              ...element.styles,
              width: `${newWidth}px`,
              height: `${newHeight}px`
            }
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, pageData.elements]);

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!pageData.name.trim()) {
        alert('Please enter a page name');
        return;
      }
      
      if (!pageData.title.trim()) {
        alert('Please enter a page title');
        return;
      }

      let response;
      
      if (editingPage) {
        // Update existing landing page
        response = await axios.put(`/api/landing-pages/${editingPage._id}`, {
          name: pageData.name.trim(),
          title: pageData.title.trim(),
          description: pageData.description.trim() || 'Landing page created with builder',
          contentType: 'html',
          content: JSON.stringify(pageData),
          tags: ['builder'],
          isActive: true,
          status: 'published'
        });
      } else {
        // Create new landing page
        response = await axios.post('/api/landing-pages', {
          name: pageData.name.trim(),
          title: pageData.title.trim(),
          description: pageData.description.trim() || 'Landing page created with builder',
          contentType: 'html',
          content: JSON.stringify(pageData),
          tags: ['builder'],
          isActive: true,
          status: 'published'
        });
      }
      
      console.log('Save response:', response.data);
      
      if (response.data.success || response.status === 201 || response.status === 200) {
        alert(editingPage ? 'Landing page updated successfully!' : 'Landing page saved successfully!');
        onSave(pageData);
      } else {
        console.error('Save failed:', response.data);
        alert(response.data.message || 'Failed to save landing page');
      }
    } catch (error: any) {
      console.error('Error saving page:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 400) {
          alert('Invalid data: Please check all required fields and try again.');
        } else if (error.response.status === 500) {
          alert('Server error: Please try again later.');
        } else {
          alert(`Error: ${error.response.data?.message || 'Failed to save landing page'}`);
        }
      } else if (error.request) {
        alert('Network error: Please check your connection and try again.');
      } else {
        alert(`Error: ${error.message || 'Failed to save landing page'}`);
      }
    }
  };

  const renderResizeHandles = (elementId: string) => (
    <>
      {/* Corner resize handles */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'se-resize',
          zIndex: 10
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'se')}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'sw-resize',
          zIndex: 10
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'sw')}
      />
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'ne-resize',
          zIndex: 10
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'ne')}
      />
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'nw-resize',
          zIndex: 10
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'nw')}
      />
      {/* Horizontal resize handles */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#10b981',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'e-resize',
          zIndex: 10,
          transform: 'translateY(-50%)'
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'e')}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#10b981',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'w-resize',
          zIndex: 10,
          transform: 'translateY(-50%)'
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'w')}
      />
      {/* Vertical resize handles */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          width: '12px',
          height: '12px',
          backgroundColor: '#f59e0b',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 's-resize',
          zIndex: 10,
          transform: 'translateX(-50%)'
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 's')}
      />
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          left: '50%',
          width: '12px',
          height: '12px',
          backgroundColor: '#f59e0b',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: 'n-resize',
          zIndex: 10,
          transform: 'translateX(-50%)'
        }}
        onMouseDown={(e) => handleResizeStart(e, elementId, 'n')}
      />
    </>
  );

  const renderChildElementContent = (element: BlockElement, isSelected: boolean) => {
    // Apply EXACT same elementStyles as builder preview
    const elementStyles = {
      ...element.styles,
      border: 'none', // No selection border in saved page
      position: 'relative' as const,
      cursor: 'default',
      minHeight: element.styles.minHeight || 'auto',
      minWidth: element.styles.minWidth || 'auto',
      width: element.styles.width || 'auto',
      height: element.styles.height || 'auto',
      padding: element.styles.padding || '10px',
      margin: element.styles.margin || '10px 0', // Match builder preview default
      backgroundColor: element.styles.backgroundColor || 'transparent',
      borderRadius: element.styles.borderRadius || '0px',
      display: element.styles.display || 'block'
    };

    // Apply EXACT same alignment logic as builder preview
    const alignmentStyles = element.styles.textAlign === 'center' 
      ? { marginLeft: 'auto', marginRight: 'auto' }
      : element.styles.textAlign === 'right' 
      ? { marginLeft: 'auto', marginRight: '0' }
      : { marginLeft: '0', marginRight: '0' };

    const finalElementStyles = {
      ...elementStyles,
      ...alignmentStyles
    };

    switch (element.type) {
      case 'heading':
        const HeadingTag = element.content.level || 'h1';
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <HeadingTag
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                margin: 0,
                color: element.styles.color || '#000000',
                fontSize: element.styles.fontSize || 'inherit',
                textAlign: element.styles.textAlign || 'left',
                fontWeight: element.styles.fontWeight || 'bold',
                fontStyle: element.styles.fontStyle || 'normal',
                textDecoration: element.styles.textDecoration || 'none',
                letterSpacing: element.styles.letterSpacing || 'normal',
                wordSpacing: element.styles.wordSpacing || 'normal',
                textTransform: element.styles.textTransform || 'none',
                textShadow: element.styles.textShadow || 'none',
                fontFamily: element.styles.fontFamily || 'inherit',
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word' as const
              }}
            >
              {element.content.text}
            </HeadingTag>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Heading</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'text':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <div
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                margin: 0,
                color: element.styles.color || '#000000',
                fontSize: element.styles.fontSize || '16px',
                lineHeight: element.styles.lineHeight || '1.5',
                textAlign: element.styles.textAlign || 'left',
                fontWeight: element.styles.fontWeight || 'normal',
                fontStyle: element.styles.fontStyle || 'normal',
                textDecoration: element.styles.textDecoration || 'none',
                letterSpacing: element.styles.letterSpacing || 'normal',
                wordSpacing: element.styles.wordSpacing || 'normal',
                textTransform: element.styles.textTransform || 'none',
                textShadow: element.styles.textShadow || 'none',
                fontFamily: element.styles.fontFamily || 'inherit',
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word' as const
              }}
            >
              {element.content.text}
            </div>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Text</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'button':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <button
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                margin: 0,
                padding: element.styles.padding || '10px 20px',
                border: element.styles.border || '1px solid #3b82f6',
                backgroundColor: element.styles.backgroundColor || '#3b82f6',
                color: element.styles.color || '#ffffff',
                borderRadius: element.styles.borderRadius || '6px',
                fontSize: element.styles.fontSize || '16px',
                textAlign: element.styles.textAlign || 'center',
                cursor: 'pointer',
                // Use user's width setting or default to fit-content
                width: element.styles.width || 'fit-content',
                minWidth: element.styles.minWidth || 'auto',
                maxWidth: element.styles.maxWidth || '100%',
                height: element.styles.height || 'auto',
                fontWeight: element.styles.fontWeight || 'normal',
                fontStyle: element.styles.fontStyle || 'normal',
                textDecoration: element.styles.textDecoration || 'none',
                letterSpacing: element.styles.letterSpacing || 'normal',
                wordSpacing: element.styles.wordSpacing || 'normal',
                textTransform: element.styles.textTransform || 'none',
                textShadow: element.styles.textShadow || 'none',
                fontFamily: element.styles.fontFamily || 'inherit'
              }}
            >
              {element.content.text}
            </button>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Button</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'image':
        if (element.content.isBackground) {
          return (
            <div style={{
              width: element.styles.width || '100%',
              height: element.styles.height || '200px',
              backgroundImage: `url(${element.content.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: element.styles.borderRadius || '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {element.content.overlayText && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: element.content.overlayColor || '#ffffff',
                  fontSize: element.content.overlayFontSize || '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  zIndex: 1,
                  maxWidth: '80%',
                  padding: '20px',
                  wordWrap: 'break-word',
                  textAlign: 'center'
                }}>
                  {element.content.overlayText}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <img
              src={element.content.src}
              alt={element.content.alt || ''}
              style={{
                maxWidth: element.styles.width || '100%',
                height: element.styles.height || 'auto',
                borderRadius: element.styles.borderRadius || '8px',
                display: 'block',
                // Better flex behavior for containers
                width: element.styles.width || '100%',
                minWidth: 'auto',
                objectFit: element.styles.objectFit || 'cover',
                // Ensure proper sizing in flex containers
                flexShrink: 1,
                flexGrow: 0
              }}
            />
          );
        }

      case 'form':
        return (
          <form style={{
            width: '100%',
            margin: 0,
            padding: 0
          }}>
            {element.content.fields.map((field: any, index: number) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {element.content.submitText}
            </button>
          </form>
        );

      case 'divider':
        return (
          <div style={{
            width: '100%',
            height: element.styles.height || '1px',
            backgroundColor: element.styles.backgroundColor || '#e5e7eb',
            margin: 0
          }} />
        );

      default:
        return null;
    }
  };

  const renderElement = (element: BlockElement) => {
    const isSelected = selectedElement === element.id;
    const elementStyles = {
      ...element.styles,
      border: isSelected && previewMode === 'edit' ? '2px solid #3b82f6' : 'none',
      position: 'relative' as const,
      cursor: previewMode === 'edit' ? 'move' : 'default',
      minHeight: element.styles.minHeight || 'auto',
      minWidth: element.styles.minWidth || 'auto',
      width: element.styles.width || 'auto',
      height: element.styles.height || 'auto',
      padding: element.styles.padding || '10px',
      margin: element.styles.margin || '10px 0',
      backgroundColor: element.styles.backgroundColor || 'transparent',
      borderRadius: element.styles.borderRadius || '0px',
      display: element.styles.display || 'block'
    };

    // Apply self-alignment using margin
    const alignmentStyles = element.styles.textAlign === 'center' 
      ? { marginLeft: 'auto', marginRight: 'auto' }
      : element.styles.textAlign === 'right' 
      ? { marginLeft: 'auto', marginRight: '0' }
      : { marginLeft: '0', marginRight: '0' };

    const finalElementStyles = {
      ...elementStyles,
      ...alignmentStyles
    };

    switch (element.type) {
      case 'heading':
        const HeadingTag = element.content.level || 'h1';
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <HeadingTag
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                margin: 0,
                color: element.styles.color || '#000000',
                fontSize: element.styles.fontSize || 'inherit'
              }}
            >
              {element.content.text}
            </HeadingTag>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Heading</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      case 'text':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <div
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                margin: 0,
                color: element.styles.color || '#000000',
                fontSize: element.styles.fontSize || '16px',
                lineHeight: element.styles.lineHeight || '1.5'
              }}
            >
              {element.content.text}
            </div>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Text</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      case 'button':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <button
              contentEditable={isSelected && previewMode === 'edit'}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                content: { ...element.content, text: e.currentTarget.textContent || '' }
              })}
              style={{
                ...element.styles,
                textAlign: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                padding: element.styles.padding || '10px 20px',
                margin: 0,
                border: element.styles.border || '1px solid #3b82f6',
                backgroundColor: element.styles.backgroundColor || '#3b82f6',
                color: element.styles.color || '#ffffff',
                borderRadius: element.styles.borderRadius || '6px',
                fontSize: element.styles.fontSize || '16px'
              }}
            >
              {element.content.text}
            </button>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Button</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                {/* Inline href editor */}
                <div style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '0',
                  right: '0',
                  backgroundColor: '#1f2937',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Link:</span>
                  <input
                    type="text"
                    value={element.content.href || '#'}
                    onChange={(e) => updateElement(element.id, {
                      content: { ...element.content, href: e.target.value }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '11px'
                    }}
                    placeholder="Enter URL or #"
                  />
                </div>
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            style={{
              ...elementStyles,
              cursor: previewMode === 'edit' ? 'move' : 'default',
              opacity: isDragging === element.id ? 0.5 : 1,
              border: draggedOverId === element.id ? '2px dashed #3b82f6' : elementStyles.border,
              backgroundImage: element.content.isBackground ? `url(${element.content.src})` : 'none',
              backgroundColor: element.content.isBackground ? 'transparent' : 'transparent',
              backgroundSize: element.content.isBackground ? (element.styles.backgroundSize || 'cover') : 'none',
              backgroundPosition: element.content.isBackground ? (element.styles.backgroundPosition || 'center') : 'none',
              backgroundRepeat: element.content.isBackground ? (element.styles.backgroundRepeat || 'no-repeat') : 'none',
              display: element.content.isBackground ? 'flex' : 'block',
              alignItems: element.content.isBackground ? 'center' : 'stretch',
              justifyContent: element.content.isBackground ? 'center' : 'flex-start',
              minHeight: element.content.isBackground ? (element.styles.height || '400px') : 'auto',
              height: element.content.isBackground ? (element.styles.height || '400px') : 'auto',
              width: element.content.isBackground ? '100%' : (element.styles.width || '100%'),
              margin: element.content.isBackground ? '0' : '0 auto',
              position: element.content.isBackground ? 'relative' : 'static'
            }}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            {element.content.isBackground ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: element.content.overlayTextAlign === 'left' ? '20px' : 
                       element.content.overlayTextAlign === 'right' ? 'auto' : '50%',
                right: element.content.overlayTextAlign === 'right' ? '20px' : 'auto',
                transform: element.content.overlayTextAlign === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
                textAlign: element.content.overlayTextAlign || 'center',
                color: element.content.overlayTextColor || '#ffffff',
                fontSize: element.content.overlayFontSize || '24px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                zIndex: 1,
                maxWidth: element.content.overlayTextAlign === 'center' ? '80%' : 'calc(100% - 40px)',
                padding: '20px',
                wordWrap: 'break-word'
              }}>
                <div
                  contentEditable={isSelected && previewMode === 'edit'}
                  suppressContentEditableWarning
                  onBlur={(e: React.FocusEvent<HTMLElement>) => updateElement(element.id, {
                    content: { ...element.content, overlayText: e.currentTarget.textContent || '' }
                  })}
                  style={{
                    outline: 'none',
                    minHeight: '1em'
                  }}
                >
                  {element.content.overlayText || 'Your Text Here'}
                </div>
              </div>
            ) : (
              <img
                src={element.content.src}
                alt={element.content.alt}
                style={{
                  width: element.styles.width || '100%',
                  height: element.styles.height || 'auto',
                  objectFit: element.styles.objectFit || 'cover',
                  borderRadius: element.styles.borderRadius,
                  display: 'block',
                  maxWidth: element.styles.width || '100%'
                }}
              />
            )}
            
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>{element.content.isBackground ? 'Background Image' : 'Image'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                {/* Inline image URL editor */}
                <div style={{
                  position: 'absolute',
                  bottom: element.content.isBackground ? '-35px' : '-75px',
                  left: '0',
                  right: '0',
                  backgroundColor: '#1f2937',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ color: '#9ca3af' }}>URL:</span>
                  <input
                    type="text"
                    value={element.content.src || ''}
                    onChange={(e) => updateElement(element.id, {
                      content: { ...element.content, src: e.target.value }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '11px'
                    }}
                    placeholder="Enter image URL"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          updateElement(element.id, {
                            content: { ...element.content, src: imageUrl }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      display: 'none'
                    }}
                    id={`file-upload-${element.id}`}
                  />
                  <label
                    htmlFor={`file-upload-${element.id}`}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: 'white',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'inline-block'
                    }}
                  >
                    Upload
                  </label>
                </div>
                
                {/* Resize handles for all images */}
                <>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3b82f6',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'se-resize',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '-4px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3b82f6',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'sw-resize',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3b82f6',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ne-resize',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#3b82f6',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'nw-resize',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
                  />
                </>
              </>
            )}
          </div>
        );

      case 'form':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <form style={element.styles}>
              {element.content.fields.map((field: any, index: number) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {element.content.submitText}
              </button>
            </form>
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Form</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                {/* Inline form field editors */}
                {element.content.fields.map((field: any, index: number) => (
                  <div key={index} style={{
                    position: 'absolute',
                    top: `${-30 - (index + 1) * 35}px`,
                    left: '0',
                    right: '0',
                    backgroundColor: '#1f2937',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    zIndex: 10 - index,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ color: '#9ca3af' }}>Field {index + 1}:</span>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => {
                        const newFields = [...element.content.fields];
                        newFields[index] = { ...field, placeholder: e.target.value };
                        updateElement(element.id, {
                          content: { ...element.content, fields: newFields }
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        padding: '2px 4px',
                        border: '1px solid #4b5563',
                        borderRadius: '2px',
                        backgroundColor: '#374151',
                        color: 'white',
                        fontSize: '11px'
                      }}
                      placeholder="Placeholder text"
                    />
                    <select
                      value={field.type || 'text'}
                      onChange={(e) => {
                        const newFields = [...element.content.fields];
                        newFields[index] = { ...field, type: e.target.value };
                        updateElement(element.id, {
                          content: { ...element.content, fields: newFields }
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '2px 4px',
                        border: '1px solid #4b5563',
                        borderRadius: '2px',
                        backgroundColor: '#374151',
                        color: 'white',
                        fontSize: '11px'
                      }}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="number">Number</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFields = element.content.fields.filter((_: any, i: number) => i !== index);
                        updateElement(element.id, {
                          content: { ...element.content, fields: newFields }
                        });
                      }}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: 'white',
                        borderRadius: '2px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Submit button editor */}
                <div style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '0',
                  right: '0',
                  backgroundColor: '#1f2937',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Button:</span>
                  <input
                    type="text"
                    value={element.content.submitText || 'Submit'}
                    onChange={(e) => updateElement(element.id, {
                      content: { ...element.content, submitText: e.target.value }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '11px'
                    }}
                    placeholder="Submit button text"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newField = { name: `field_${Date.now()}`, type: 'text', placeholder: 'New field', required: false };
                      updateElement(element.id, {
                        content: { ...element.content, fields: [...element.content.fields, newField] }
                      });
                    }}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: 'white',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    + Field
                  </button>
                </div>
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      case 'divider':
        return (
          <div
            key={element.id}
            style={finalElementStyles}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => previewMode === 'edit' && handleDragOver(e, element.id)}
            onDrop={(e) => previewMode === 'edit' && handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
            <div style={element.styles} />
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Divider</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      case 'container':
        return (
          <div key={element.id} style={{
            ...element.styles,
            ...element.containerStyles,
            border: isSelected && previewMode === 'edit' ? '2px dashed #3b82f6' : element.styles.border,
            backgroundColor: element.styles.backgroundColor || '#f9fafb',
            minHeight: element.styles.minHeight || '100px',
            margin: element.styles.margin || '0px',
            borderRadius: element.styles.borderRadius || '8px',
            width: element.styles.width || '100%',
            height: element.styles.height || 'auto',
            maxWidth: element.styles.maxWidth || 'none',
            // Changed overflow to visible to prevent cropping
            overflow: 'visible',
            // Ensure container respects its size constraints
            boxSizing: 'border-box',
            // Add minimum width to prevent container from becoming too small
            minWidth: element.styles.minWidth || '200px'
          }}
            draggable={previewMode === 'edit'}
            onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, element.id)}
            onDragOver={(e) => {
              if (previewMode === 'edit') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onDrop={(e) => {
              if (previewMode === 'edit') {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if it's a new element from sidebar
                const elementType = e.dataTransfer.getData('element-type');
                if (elementType) {
                  // Create new element and add to container
                  const newElement = { ...elementTemplates[elementType as keyof typeof elementTemplates] } as BlockElement;
                  newElement.id = `${elementType}-${Date.now()}`;
                  
                  // Add element to pageData and container
                  setPageData(prev => ({
                    ...prev,
                    elements: [...prev.elements, newElement]
                  }));
                  
                  const newChildren = [...(element.content.children || []), newElement.id];
                  updateElement(element.id, {
                    content: { ...element.content, children: newChildren }
                  });
                  return;
                }
                
                // Handle existing element being dragged
                const draggedElementId = e.dataTransfer?.getData('text/plain');
                if (draggedElementId && draggedElementId !== element.id) {
                  // Check if element is already in this container
                  const currentChildren = element.content.children || [];
                  if (!currentChildren.includes(draggedElementId)) {
                    // Add element to container
                    const newChildren = [...currentChildren, draggedElementId];
                    updateElement(element.id, {
                      content: { ...element.content, children: newChildren }
                    });
                  }
                }
              }
            }}
            onDragEnd={handleDragEnd}
            onClick={() => previewMode === 'edit' && setSelectedElement(element.id)}
            className="builder-element"
          >
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
                  <div>Container - Drag elements here</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Flex layout with alignment controls</div>
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
                flexWrap: element.containerStyles?.flexWrap || 'wrap', // Changed to wrap to allow multiple elements
                // Better container positioning
                position: 'relative',
                // Changed overflow to visible to prevent cropping
                overflow: 'visible',
                // Ensure proper sizing
                boxSizing: 'border-box',
                // Add padding to prevent edge clipping
                padding: '8px',
                // Ensure container can grow to fit content
                minHeight: 'auto',
                // Add minimum width for container
                minWidth: '200px'
              }}>
                {element.content.children.map((childId: string) => {
                  const childElement = pageData.elements.find(el => el.id === childId);
                  if (!childElement) return null;
                  
                  const isChildSelected = selectedElement === childElement.id;
                  const childElementStyles = {
                    ...childElement.styles,
                    border: 'none',
                    position: 'relative' as const,
                    cursor: previewMode === 'edit' ? 'move' : 'default',
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
                    flex: childElement.styles.flex || '0 1 auto', // Changed back to prevent overlapping
                    flexGrow: childElement.styles.flexGrow !== undefined ? childElement.styles.flexGrow : 0, // Changed back to prevent overlapping
                    flexShrink: childElement.styles.flexShrink !== undefined ? childElement.styles.flexShrink : 1,
                    flexBasis: childElement.styles.flexBasis || 'auto',
                    // Ensure proper flex alignment
                    alignSelf: childElement.styles.alignSelf || 'auto',
                    // Remove conflicting margin-based alignment for flex items
                    marginLeft: childElement.styles.marginLeft || '0',
                    marginRight: childElement.styles.marginRight || '0',
                    marginTop: childElement.styles.marginTop || '0',
                    marginBottom: childElement.styles.marginBottom || '0',
                    // Changed overflow to visible to prevent cropping
                    overflow: 'visible',
                    // Ensure proper box sizing
                    boxSizing: 'border-box' as const,
                    // Remove maxWidth constraint to allow full element display
                    maxWidth: childElement.styles.maxWidth || 'none',
                    // Ensure text doesn't overflow
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word' as const
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
                    <div
                      key={childElement.id}
                      style={childElementStyles}
                      draggable={previewMode === 'edit'}
                      onDragStart={(e) => previewMode === 'edit' && handleDragStart(e, childElement.id)}
                      onDragOver={(e) => {
                        if (previewMode === 'edit') {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      onDrop={(e) => {
                        if (previewMode === 'edit') {
                          e.preventDefault();
                          e.stopPropagation();
                          // Don't handle drop here - let container handle it
                        }
                      }}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previewMode === 'edit') setSelectedElement(childElement.id);
                      }}
                      className="builder-element"
                    >
                      {renderChildElementContent(childElement, isChildSelected)}
                      {isChildSelected && previewMode === 'edit' && renderResizeHandles(childElement.id)}
                    </div>
                  );
                })}
              </div>
            )}
            
            {isSelected && previewMode === 'edit' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  left: '0',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  Use arrow keys to resize (Shift + arrows for larger steps)
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <span>Container</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                {/* Container controls */}
                <div style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '0',
                  right: '0',
                  backgroundColor: '#1f2937',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}>
                  <select
                    value={element.containerStyles?.display || 'flex'}
                    onChange={(e) => updateElement(element.id, {
                      containerStyles: { 
                        ...element.containerStyles, 
                        display: e.target.value as 'flex' | 'block' | 'inline-flex' | 'inline-block' 
                      }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    <option value="block">Block</option>
                    <option value="flex">Flex</option>
                    <option value="inline-block">Inline Block</option>
                    <option value="inline-flex">Inline Flex</option>
                  </select>
                  
                  <select
                    value={element.containerStyles?.flexDirection || 'row'}
                    onChange={(e) => updateElement(element.id, {
                      containerStyles: { 
                        ...element.containerStyles, 
                        flexDirection: e.target.value as 'row' | 'column' 
                      }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                  </select>
                  
                  <select
                    value={element.containerStyles?.alignItems || 'center'}
                    onChange={(e) => updateElement(element.id, {
                      containerStyles: { 
                        ...element.containerStyles, 
                        alignItems: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'stretch' 
                      }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    <option value="flex-start">Top</option>
                    <option value="center">Center</option>
                    <option value="flex-end">Bottom</option>
                    <option value="stretch">Stretch</option>
                  </select>
                  
                  <select
                    value={element.containerStyles?.justifyContent || 'flex-start'}
                    onChange={(e) => updateElement(element.id, {
                      containerStyles: { 
                        ...element.containerStyles, 
                        justifyContent: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' 
                      }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '10px'
                    }}
                  >
                    <option value="flex-start">Left</option>
                    <option value="center">Center</option>
                    <option value="flex-end">Right</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                  </select>
                  
                  <input
                    type="text"
                    value={element.containerStyles?.gap || '16px'}
                    onChange={(e) => updateElement(element.id, {
                      containerStyles: { 
                        ...element.containerStyles, 
                        gap: e.target.value 
                      }
                    })}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '50px',
                      padding: '2px 4px',
                      border: '1px solid #4b5563',
                      borderRadius: '2px',
                      backgroundColor: '#374151',
                      color: 'white',
                      fontSize: '10px'
                    }}
                    placeholder="Gap"
                  />
                </div>
                
                {renderResizeHandles(element.id)}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const selectedElementData = pageData.elements.find(el => el.id === selectedElement);

  return (
    <>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* Top Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            {editingPage ? 'Edit Landing Page' : 'Landing Page Builder'}
          </h2>
          <input
            type="text"
            placeholder="Page Name"
            value={pageData.name}
            onChange={(e) => setPageData(prev => ({ ...prev, name: e.target.value }))}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: previewMode === 'edit' ? '#3b82f6' : 'white',
              color: previewMode === 'edit' ? 'white' : '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {previewMode === 'edit' ? '👁️ Preview' : '✏️ Edit'}
          </button>
          
          <button
            onClick={() => setShowPreviewPopup(true)}
            style={{
              padding: '8px 16px',
              border: '1px solid #8b5cf6',
              borderRadius: '6px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🖥️ Full Preview
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💾 {editingPage ? 'Update' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Elements */}
        <div style={{
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          overflow: 'auto',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
            Elements
          </h3>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveCategory('basic')}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: activeCategory === 'basic' ? '#3b82f6' : 'white',
                color: activeCategory === 'basic' ? 'white' : '#374151',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveCategory('advanced')}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: activeCategory === 'advanced' ? '#3b82f6' : 'white',
                color: activeCategory === 'advanced' ? 'white' : '#374151',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Advanced
            </button>
          </div>

          {/* Basic Elements */}
          {activeCategory === 'basic' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => addElement('heading')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'heading')}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '24px' }}>📝</span>
                <span>Heading</span>
              </button>
              
              <button
                onClick={() => addElement('text')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'text')}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '24px' }}>📄</span>
                <span>Text</span>
              </button>
              
              <button
                onClick={() => addElement('button')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'button')}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '24px' }}>🔘</span>
                <span>Button</span>
              </button>
              
              <button
                onClick={() => addElement('image')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'image')}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '24px' }}>🖼️</span>
                <span>Image</span>
              </button>
            </div>
          )}

          {/* Advanced Elements */}
          {activeCategory === 'advanced' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => addElement('form')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'form')}
                style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontSize: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '20px' }}>📋</span>
                <span>Form</span>
              </button>
              
              <button
                onClick={() => addElement('divider')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'divider')}
                style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontSize: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '20px' }}>➖</span>
                <span>Divider</span>
              </button>
              
              <button
                onClick={() => addElement('container')}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, 'container')}
                style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#000000',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontSize: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <span style={{ fontSize: '20px' }}>📦</span>
                <span>Container</span>
              </button>
            </div>
          )}
        </div>

        {/* Center - Canvas */}
        <div style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          overflow: 'auto',
          padding: '0px',
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              backgroundColor: 'white',
              minHeight: 'calc(100vh - 100px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              overflow: 'hidden',
              width: '100%'
            }}
          >
            {pageData.elements.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '500px',
                color: '#9ca3af',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                margin: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  Start Building Your Landing Page
                </h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px' }}>
                  Click on elements from the left sidebar to add them
                </p>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <span>💡 Tip: Click on elements to select and edit them</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px' }}>
                {pageData.elements.map(element => {
                  // Check if this element is inside any container
                  const isInsideContainer = pageData.elements.some(container => 
                    container.type === 'container' && 
                    container.content.children && 
                    container.content.children.includes(element.id)
                  );
                  
                  // Only render elements that are NOT inside containers
                  if (!isInsideContainer) {
                    return renderElement(element);
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
          overflow: 'auto',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
            Properties
          </h3>
          
          {selectedElementData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Element Type
                </label>
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'capitalize'
                }}>
                  {selectedElementData.type}
                </div>
              </div>

              {/* Enhanced Text Alignment Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Text Alignment
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => updateElement(selectedElement, {
                      styles: { 
                        ...selectedElementData.styles, 
                        textAlign: 'left',
                        marginLeft: '0',
                        marginRight: '0'
                      }
                    })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: selectedElementData.styles.textAlign === 'left' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: selectedElementData.styles.textAlign === 'left' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    ⬅️ Left
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement, {
                      styles: { 
                        ...selectedElementData.styles, 
                        textAlign: 'center',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }
                    })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: selectedElementData.styles.textAlign === 'center' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: selectedElementData.styles.textAlign === 'center' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    ↔️ Center
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement, {
                      styles: { 
                        ...selectedElementData.styles, 
                        textAlign: 'right',
                        marginLeft: 'auto',
                        marginRight: '0'
                      }
                    })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: selectedElementData.styles.textAlign === 'right' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: selectedElementData.styles.textAlign === 'right' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    ➡️ Right
                  </button>
                </div>
              </div>

              {/* Enhanced Typography Controls */}
              {(selectedElementData.type === 'text' || selectedElementData.type === 'heading') && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Font Family
                    </label>
                    <select
                      value={selectedElementData.styles.fontFamily || 'inherit'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, fontFamily: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      <option value="inherit">Default</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Impact, sans-serif">Impact</option>
                      <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Font Size
                    </label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={parseInt(String(selectedElementData.styles.fontSize || '16'))}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, fontSize: e.target.value + 'px' as string }
                        })}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        value={selectedElementData.styles.fontSize || '16px'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, fontSize: e.target.value }
                        })}
                        placeholder="16px"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Font Weight
                    </label>
                    <select
                      value={selectedElementData.styles.fontWeight || 'normal'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, fontWeight: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="lighter">Lighter</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                      <option value="800">800</option>
                      <option value="900">900</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Font Style
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => updateElement(selectedElement, {
                          styles: { 
                            ...selectedElementData.styles, 
                            fontStyle: selectedElementData.styles.fontStyle === 'italic' ? 'normal' : 'italic'
                          }
                        })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: selectedElementData.styles.fontStyle === 'italic' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: selectedElementData.styles.fontStyle === 'italic' ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          fontStyle: 'italic'
                        }}
                      >
                        *Italic*
                      </button>
                      <button
                        onClick={() => updateElement(selectedElement, {
                          styles: { 
                            ...selectedElementData.styles, 
                            textDecoration: selectedElementData.styles.textDecoration === 'underline' ? 'none' : 'underline'
                          }
                        })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: selectedElementData.styles.textDecoration === 'underline' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: selectedElementData.styles.textDecoration === 'underline' ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        U̲nderline
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Text Transform
                    </label>
                    <select
                      value={selectedElementData.styles.textTransform || 'none'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, textTransform: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      <option value="none">None</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Line Height
                    </label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="0.8"
                        max="3"
                        step="0.1"
                        value={parseFloat(selectedElementData.styles.lineHeight) || 1.5}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, lineHeight: e.target.value as string }
                        })}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        value={selectedElementData.styles.lineHeight || '1.5'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, lineHeight: e.target.value }
                        })}
                        placeholder="1.5"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Letter Spacing
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.letterSpacing || 'normal'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, letterSpacing: e.target.value }
                      })}
                      placeholder="normal or 2px"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                      Text Shadow
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.textShadow || 'none'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, textShadow: e.target.value }
                      })}
                      placeholder="2px 2px 4px rgba(0,0,0,0.3)"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Padding Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Padding
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={String(selectedElementData.styles.padding || '10px').split(' ')[0] || '10px'}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, padding: e.target.value }
                    })}
                    placeholder="10px"
                    style={{
                      flex: 1,
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>
              </div>

              {/* Margin Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Margin
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={selectedElementData.styles.margin || '10px 0'}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, margin: e.target.value }
                    })}
                    placeholder="10px 0"
                    style={{
                      flex: 1,
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>
              </div>

              {selectedElementData.content.text && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Text Content
                  </label>
                  <textarea
                    value={selectedElementData.content.text}
                    onChange={(e) => updateElement(selectedElement, {
                      content: { ...selectedElementData.content, text: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '80px'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Font Size
                </label>
                <input
                  type="text"
                  value={selectedElementData.styles.fontSize || ''}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, fontSize: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Color
                </label>
                <input
                  type="color"
                  value={selectedElementData.styles.color || '#000000'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, color: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    height: '36px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Enhanced Layout Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Width
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={parseInt(String(selectedElementData.styles.width || '100'))}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, width: e.target.value + '%' as string }
                    })}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.width || '100%'}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, width: e.target.value }
                    })}
                    placeholder="100%"
                    style={{
                      width: '60px',
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Max Width
                </label>
                <input
                  type="text"
                  value={selectedElementData.styles.maxWidth || 'none'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, maxWidth: e.target.value }
                  })}
                  placeholder="1200px or none"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Min Height
                </label>
                <input
                  type="text"
                  value={selectedElementData.styles.minHeight || 'auto'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, minHeight: e.target.value }
                  })}
                  placeholder="100px or auto"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Display
                </label>
                <select
                  value={selectedElementData.styles.display || 'block'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, display: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <option value="block">Block</option>
                  <option value="inline">Inline</option>
                  <option value="inline-block">Inline Block</option>
                  <option value="flex">Flex</option>
                  <option value="grid">Grid</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Position
                </label>
                <select
                  value={selectedElementData.styles.position || 'static'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, position: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <option value="static">Static</option>
                  <option value="relative">Relative</option>
                  <option value="absolute">Absolute</option>
                  <option value="fixed">Fixed</option>
                  <option value="sticky">Sticky</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Z-Index
                </label>
                <input
                  type="number"
                  value={selectedElementData.styles.zIndex || 'auto'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, zIndex: e.target.value }
                  })}
                  placeholder="1, 10, 100..."
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>

              {/* Enhanced Spacing Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Margin (Top, Right, Bottom, Left)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <input
                    type="text"
                    value={selectedElementData.styles.marginTop || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, marginTop: e.target.value }
                    })}
                    placeholder="Top"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.marginRight || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, marginRight: e.target.value }
                    })}
                    placeholder="Right"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.marginBottom || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, marginBottom: e.target.value }
                    })}
                    placeholder="Bottom"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.marginLeft || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, marginLeft: e.target.value }
                    })}
                    placeholder="Left"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Padding (Top, Right, Bottom, Left)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <input
                    type="text"
                    value={selectedElementData.styles.paddingTop || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, paddingTop: e.target.value }
                    })}
                    placeholder="Top"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.paddingRight || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, paddingRight: e.target.value }
                    })}
                    placeholder="Right"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.paddingBottom || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, paddingBottom: e.target.value }
                    })}
                    placeholder="Bottom"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.paddingLeft || ''}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, paddingLeft: e.target.value }
                    })}
                    placeholder="Left"
                    style={{
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Border Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Border
                </label>
                <input
                  type="text"
                  value={selectedElementData.styles.border || 'none'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, border: e.target.value }
                  })}
                  placeholder="2px solid #3b82f6"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Border Radius
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={parseInt(selectedElementData.styles.borderRadius) || 0}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, borderRadius: e.target.value + 'px' }
                    })}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    value={selectedElementData.styles.borderRadius || '0px'}
                    onChange={(e) => updateElement(selectedElement, {
                      styles: { ...selectedElementData.styles, borderRadius: e.target.value }
                    })}
                    placeholder="0px"
                    style={{
                      width: '60px',
                      padding: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Shadow Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                  Box Shadow
                </label>
                <input
                  type="text"
                  value={selectedElementData.styles.boxShadow || 'none'}
                  onChange={(e) => updateElement(selectedElement, {
                    styles: { ...selectedElementData.styles, boxShadow: e.target.value }
                  })}
                  placeholder="0 4px 6px rgba(0,0,0,0.1)"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>

              {/* Button-specific controls */}
              {selectedElementData.type === 'button' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Padding (Top/Bottom)
                    </label>
                    <input
                      type="text"
                      value={String(selectedElementData.styles.padding || '12px 24px').split(' ')[0] || '12px'}
                      onChange={(e) => {
                        const paddingValue = e.target.value;
                        const currentPadding = String(selectedElementData.styles.padding || '12px 24px');
                        const sides = currentPadding.split(' ');
                        const newPadding = `${paddingValue} ${sides[1] || '24px'}`;
                        updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, padding: newPadding }
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Padding (Left/Right)
                    </label>
                    <input
                      type="text"
                      value={String(selectedElementData.styles.padding || '12px 24px').split(' ')[1] || '24px'}
                      onChange={(e) => {
                        const paddingValue = e.target.value;
                        const currentPadding = String(selectedElementData.styles.padding || '12px 24px');
                        const sides = currentPadding.split(' ');
                        const newPadding = `${sides[0] || '12px'} ${paddingValue}`;
                        updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, padding: newPadding }
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Margin (Top)
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.marginTop || '0px'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, marginTop: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Margin (Bottom)
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.marginBottom || '16px'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, marginBottom: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selectedElementData.styles.backgroundColor || '#3b82f6'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        height: '36px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.borderRadius || '8px'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, borderRadius: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Image-specific controls */}
              {selectedElementData.type === 'image' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Image Type
                    </label>
                    <select
                      value={selectedElementData.content.isBackground ? 'background' : 'regular'}
                      onChange={(e) => updateElement(selectedElement, {
                        content: { 
                          ...selectedElementData.content, 
                          isBackground: e.target.value === 'background'
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="regular">Regular Image</option>
                      <option value="background">Background Image</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.content.src || ''}
                      onChange={(e) => updateElement(selectedElement, {
                        content: { ...selectedElementData.content, src: e.target.value }
                      })}
                      placeholder="Enter image URL"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.content.alt || ''}
                      onChange={(e) => updateElement(selectedElement, {
                        content: { ...selectedElementData.content, alt: e.target.value }
                      })}
                      placeholder="Describe the image"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {selectedElementData.content.isBackground && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Background Size
                        </label>
                        <select
                          value={selectedElementData.styles.backgroundSize || 'cover'}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, backgroundSize: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="cover">Cover (Fill Entire Area)</option>
                          <option value="contain">Contain (Fit Within Area)</option>
                          <option value="100% 100%">Stretch (Fill Exactly)</option>
                          <option value="auto">Original Size</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Background Position
                        </label>
                        <select
                          value={selectedElementData.styles.backgroundPosition || 'center'}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, backgroundPosition: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Background Repeat
                        </label>
                        <select
                          value={selectedElementData.styles.backgroundRepeat || 'no-repeat'}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, backgroundRepeat: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="no-repeat">No Repeat</option>
                          <option value="repeat">Repeat (Tile)</option>
                          <option value="repeat-x">Repeat Horizontally</option>
                          <option value="repeat-y">Repeat Vertically</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Height (px)
                        </label>
                        <input
                          type="number"
                          min="100"
                          value={parseInt(selectedElementData.styles.height) || 400}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, height: `${e.target.value}px` }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Overlay Text
                        </label>
                        <textarea
                          value={selectedElementData.content.overlayText || ''}
                          onChange={(e) => updateElement(selectedElement, {
                            content: { ...selectedElementData.content, overlayText: e.target.value }
                          })}
                          placeholder="Enter text to overlay on background image"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minHeight: '60px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Text Alignment
                        </label>
                        <select
                          value={selectedElementData.content.overlayTextAlign || 'center'}
                          onChange={(e) => updateElement(selectedElement, {
                            content: { ...selectedElementData.content, overlayTextAlign: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Text Size (px)
                        </label>
                        <input
                          type="number"
                          min="12"
                          max="72"
                          value={parseInt(selectedElementData.content.overlayFontSize) || 24}
                          onChange={(e) => updateElement(selectedElement, {
                            content: { ...selectedElementData.content, overlayFontSize: `${e.target.value}px` }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedElementData.content.overlayTextColor || '#ffffff'}
                          onChange={(e) => updateElement(selectedElement, {
                            content: { ...selectedElementData.content, overlayTextColor: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '36px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {!selectedElementData.content.isBackground && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Width (%)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={parseInt(selectedElementData.styles.width) || 100}
                            onChange={(e) => updateElement(selectedElement, {
                              styles: { ...selectedElementData.styles, width: `${e.target.value}%` }
                            })}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>%</span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Height (px)
                        </label>
                        <input
                          type="number"
                          min="50"
                          value={parseInt(selectedElementData.styles.height) || 200}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, height: `${e.target.value}px` }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Image Alignment
                        </label>
                        <select
                          value={selectedElementData.styles.objectFit || 'cover'}
                          onChange={(e) => updateElement(selectedElement, {
                            styles: { ...selectedElementData.styles, objectFit: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="cover">Cover (Fill)</option>
                          <option value="contain">Contain (Fit)</option>
                          <option value="fill">Stretch</option>
                          <option value="none">Original Size</option>
                          <option value="scale-down">Scale Down</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                          Horizontal Alignment
                        </label>
                        <select
                          value={selectedElementData.styles.marginLeft || 'auto'}
                          onChange={(e) => {
                            const alignment = e.target.value;
                            let marginStyle = {};
                            if (alignment === 'left') {
                              marginStyle = { marginLeft: '0', marginRight: 'auto' };
                            } else if (alignment === 'center') {
                              marginStyle = { marginLeft: 'auto', marginRight: 'auto' };
                            } else if (alignment === 'right') {
                              marginStyle = { marginLeft: 'auto', marginRight: '0' };
                            }
                            updateElement(selectedElement, {
                              styles: { ...selectedElementData.styles, ...marginStyle }
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.styles.borderRadius || '8px'}
                      onChange={(e) => updateElement(selectedElement, {
                        styles: { ...selectedElementData.styles, borderRadius: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {!selectedElementData.content.isBackground && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                        Object Fit
                      </label>
                      <select
                        value={selectedElementData.styles.objectFit || 'cover'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, objectFit: e.target.value as any }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                        <option value="none">None</option>
                        <option value="scale-down">Scale Down</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Or Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            updateElement(selectedElement, {
                              content: { ...selectedElementData.content, src: imageUrl }
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Container-specific controls */}
              {selectedElementData.type === 'container' && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '6px',
                  border: '1px solid #0ea5e9'
                }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                    Container Layout Controls
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Display Type
                      </label>
                      <select
                        value={selectedElementData.containerStyles?.display || 'flex'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            display: e.target.value as any 
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="block">Block</option>
                        <option value="flex">Flex</option>
                        <option value="inline-block">Inline Block</option>
                        <option value="inline-flex">Inline Flex</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Flex Direction
                      </label>
                      <select
                        value={selectedElementData.containerStyles?.flexDirection || 'row'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            flexDirection: e.target.value as any 
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="row">Row (Horizontal)</option>
                        <option value="column">Column (Vertical)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Align Items (Cross-axis)
                      </label>
                      <select
                        value={selectedElementData.containerStyles?.alignItems || 'center'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            alignItems: e.target.value as any 
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Justify Content (Main-axis)
                      </label>
                      <select
                        value={selectedElementData.containerStyles?.justifyContent || 'flex-start'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            justifyContent: e.target.value as any 
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                        <option value="space-around">Space Around</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Flex Wrap
                      </label>
                      <select
                        value={selectedElementData.containerStyles?.flexWrap || 'nowrap'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            flexWrap: e.target.value as any 
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="nowrap">No Wrap</option>
                        <option value="wrap">Wrap</option>
                        <option value="wrap-reverse">Wrap Reverse</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Gap Between Elements
                      </label>
                      <input
                        type="text"
                        value={selectedElementData.containerStyles?.gap || '16px'}
                        onChange={(e) => updateElement(selectedElement, {
                          containerStyles: { 
                            ...selectedElementData.containerStyles, 
                            gap: e.target.value 
                          }
                        })}
                        placeholder="16px"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Elements in Container: {selectedElementData.content.children?.length || 0}
                      </label>
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#6b7280',
                        padding: '4px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px',
                        border: '1px dashed #d1d5db'
                      }}>
                        Drag elements from sidebar to add them to this container
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Container positioning and size controls */}
              {selectedElementData.type === 'container' && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '6px',
                  border: '1px solid #f59e0b'
                }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                    Container Position & Size
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Container Width
                      </label>
                      <select
                        value={selectedElementData.styles.width || '100%'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, width: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="100%">Full Width (100%)</option>
                        <option value="95%">95%</option>
                        <option value="90%">90%</option>
                        <option value="85%">85%</option>
                        <option value="80%">80%</option>
                        <option value="75%">75%</option>
                        <option value="70%">70%</option>
                        <option value="66.66%">66.66% (2/3)</option>
                        <option value="60%">60%</option>
                        <option value="50%">50%</option>
                        <option value="40%">40%</option>
                        <option value="33.33%">33.33% (1/3)</option>
                        <option value="25%">25%</option>
                        <option value="20%">20%</option>
                        <option value="auto">Auto (fit content)</option>
                        <option value="fit-content">Fit Content</option>
                        <option value="max-content">Max Content</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Custom Width (px)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        value={selectedElementData.styles.width ? parseInt(selectedElementData.styles.width.toString()) || 0 : 0}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateElement(selectedElement, {
                            styles: { 
                              ...selectedElementData.styles, 
                              width: value ? `${value}px` : '100%'
                            }
                          });
                        }}
                        placeholder="Enter width in pixels"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Min Width (optional)
                      </label>
                      <input
                        type="text"
                        value={selectedElementData.styles.minWidth || ''}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { 
                            ...selectedElementData.styles, 
                            minWidth: e.target.value || 'auto'
                          }
                        })}
                        placeholder="e.g., 300px, 50%"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Horizontal Alignment
                      </label>
                      <select
                        value={selectedElementData.styles.marginLeft === 'auto' && selectedElementData.styles.marginRight === 'auto' ? 'center' :
                               selectedElementData.styles.marginLeft === 'auto' && selectedElementData.styles.marginRight === '0' ? 'right' : 'left'}
                        onChange={(e) => {
                          const alignment = e.target.value;
                          let marginStyle = {
                            marginLeft: '0',
                            marginRight: '0'
                          };
                          
                          if (alignment === 'center') {
                            marginStyle = {
                              marginLeft: 'auto',
                              marginRight: 'auto'
                            };
                          } else if (alignment === 'right') {
                            marginStyle = {
                              marginLeft: 'auto',
                              marginRight: '0'
                            };
                          }
                          
                          updateElement(selectedElement, {
                            styles: { 
                              ...selectedElementData.styles, 
                              ...marginStyle
                            }
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Container Height
                      </label>
                      <select
                        value={selectedElementData.styles.height || 'auto'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, height: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="auto">Auto (fit content)</option>
                        <option value="50px">50px</option>
                        <option value="100px">100px</option>
                        <option value="150px">150px</option>
                        <option value="200px">200px</option>
                        <option value="250px">250px</option>
                        <option value="300px">300px</option>
                        <option value="350px">350px</option>
                        <option value="400px">400px</option>
                        <option value="450px">450px</option>
                        <option value="500px">500px</option>
                        <option value="600px">600px</option>
                        <option value="700px">700px</option>
                        <option value="800px">800px</option>
                        <option value="100vh">Full Viewport Height</option>
                        <option value="50vh">50% Viewport Height</option>
                        <option value="75vh">75% Viewport Height</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Custom Height (px)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={selectedElementData.styles.height ? parseInt(selectedElementData.styles.height.toString()) || 0 : 0}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateElement(selectedElement, {
                            styles: { 
                              ...selectedElementData.styles, 
                              height: value ? `${value}px` : 'auto'
                            }
                          });
                        }}
                        placeholder="Enter height in pixels"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Min Height (optional)
                      </label>
                      <input
                        type="text"
                        value={selectedElementData.styles.minHeight || ''}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { 
                            ...selectedElementData.styles, 
                            minHeight: e.target.value || 'auto'
                          }
                        })}
                        placeholder="e.g., 200px, 30vh"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Max Width (optional)
                      </label>
                      <input
                        type="text"
                        value={selectedElementData.styles.maxWidth || ''}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { 
                            ...selectedElementData.styles, 
                            maxWidth: e.target.value || 'none'
                          }
                        })}
                        placeholder="e.g., 1200px, 100%"
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Flex controls for elements inside containers */}
              {selectedElementData && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Flex Item Controls
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Flex Grow
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={selectedElementData.styles.flexGrow || 0}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, flexGrow: parseFloat(e.target.value) || 0 }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Flex Shrink
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={selectedElementData.styles.flexShrink || 1}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, flexShrink: parseFloat(e.target.value) || 1 }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Flex Basis
                      </label>
                      <select
                        value={selectedElementData.styles.flexBasis || 'auto'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, flexBasis: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="auto">Auto</option>
                        <option value="0">0px</option>
                        <option value="100px">100px</option>
                        <option value="200px">200px</option>
                        <option value="300px">300px</option>
                        <option value="50%">50%</option>
                        <option value="100%">100%</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Align Self
                      </label>
                      <select
                        value={selectedElementData.styles.alignSelf || 'auto'}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, alignSelf: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="auto">Auto</option>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                        <option value="baseline">Baseline</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '3px' }}>
                        Order
                      </label>
                      <input
                        type="number"
                        min="-10"
                        max="10"
                        value={selectedElementData.styles.order || 0}
                        onChange={(e) => updateElement(selectedElement, {
                          styles: { ...selectedElementData.styles, order: parseInt(e.target.value) || 0 }
                        })}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => deleteElement(selectedElement)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Delete Element
              </button>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              padding: '40px 20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>No element selected</p>
              <p style={{ fontSize: '12px' }}>Click on an element to edit its properties</p>
            </div>
          )}

          {/* Page Settings */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Page Settings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Page Title
                </label>
                <input
                  type="text"
                  value={pageData.title}
                  onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={pageData.description}
                  onChange={(e) => setPageData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '60px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Popup Modal */}
      {showPreviewPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '95vw',
            height: '95vh',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                Landing Page Preview
              </h3>
              <button
                onClick={() => setShowPreviewPopup(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: pageData.globalStyles?.backgroundColor || '#ffffff'
            }}>
              <div style={{
                fontFamily: pageData.globalStyles?.fontFamily || 'Inter, sans-serif',
                padding: '40px 20px',
                minHeight: '100%'
              }}>
                {pageData.elements.map(element => {
                  // Use the same filtering logic as edit mode to prevent duplication
                  const isInsideContainer = pageData.elements.some(container => 
                    container.type === 'container' && 
                    container.content.children && 
                    container.content.children.includes(element.id)
                  );
                  
                  // Only render elements that are NOT inside containers
                  if (!isInsideContainer) {
                    // Use a modified version of renderElement for saved page (non-interactive)
                    return renderSavedElement(element, pageData);
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      <style>{`
        .builder-element:hover {
          outline: 1px solid #3b82f6;
        }
        
        [contenteditable]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default LandingPageBuilder;

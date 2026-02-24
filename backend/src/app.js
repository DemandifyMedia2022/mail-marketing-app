import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/email.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import landingPageRoutes from './routes/landingPage.routes.js';
import authRoutes from './routes/auth.routes.js';
import templateRoutes from './routes/template.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(cors());
// Allow larger JSON bodies so attachment payloads (base64) can be processed
app.use(express.json({ limit: '20mb' }));

app.use('/api/emails', emailRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/landing-pages', landingPageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);

// Serve standalone survey form at root level
app.get('/survey.html', (req, res) => {
  try {
    // Use absolute path to ensure it works
    const surveyPath = 'c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/frontend/public/survey.html';
    
    console.log('📝 Serving survey form from:', surveyPath);
    
    if (fs.existsSync(surveyPath)) {
      console.log('✅ Survey file found, serving...');
      res.sendFile(surveyPath);
    } else {
      console.log('❌ Survey file not found at:', surveyPath);
      res.status(404).send(`
        <h1>Survey Form Not Found</h1>
        <p>Expected at: ${surveyPath}</p>
      `);
    }
  } catch (error) {
    console.error('❌ Error serving survey form:', error);
    res.status(500).send('Internal server error');
  }
});

// Serve standalone landing page
app.get('/landing-page/:id', (req, res) => {
  try {
    const landingPagePath = 'c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/frontend/public/landing-page.html';
    
    // Create a simple HTML page that will handle the landing page
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
            font-size: 18px;
        }
        
        .error {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .error h2 {
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">Loading landing page...</div>
    </div>
    
    <script>
        // Function to render builder content
        function renderBuilderContent(pageData, root, emailId, campaignId, recipientEmail) {
            // Create main container - EXACTLY match builder preview
            const container = document.createElement('div');
            container.style.cssText = \`
                font-family: \${pageData.globalStyles?.fontFamily || 'Inter, sans-serif'};
                background-color: \${pageData.globalStyles?.backgroundColor || '#ffffff'};
                min-height: 100vh;
                width: 100%;
                padding: 40px 25px;
                margin: 0;
                overflow-x: hidden;
                box-sizing: border-box;
            \`;
            
            // Function to render individual elements - EXACTLY match builder preview
            function renderElement(element) {
                // Apply EXACT same elementStyles as builder preview
                const elementStyles = {
                    ...element.styles,
                    border: 'none', // No selection border in saved page
                    position: 'relative',
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
                        const headingWrapper = document.createElement('div');
                        Object.assign(headingWrapper.style, finalElementStyles);
                        
                        const heading = document.createElement(element.content.level || 'h1');
                        heading.textContent = element.content.text;
                        heading.style.cssText = \`
                            margin: 0;
                            color: \${element.styles.color || '#000000'};
                            font-size: \${element.styles.fontSize || 'inherit'};
                            text-align: \${element.styles.textAlign || 'left'};
                            font-weight: \${element.styles.fontWeight || 'bold'};
                            font-style: \${element.styles.fontStyle || 'normal'};
                            text-decoration: \${element.styles.textDecoration || 'none'};
                            letter-spacing: \${element.styles.letterSpacing || 'normal'};
                            word-spacing: \${element.styles.wordSpacing || 'normal'};
                            text-transform: \${element.styles.textTransform || 'none'};
                            text-shadow: \${element.styles.textShadow || 'none'};
                            font-family: \${element.styles.fontFamily || 'inherit'};
                            max-width: 100%;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        \`;
                        headingWrapper.appendChild(heading);
                        return headingWrapper;
                        
                    case 'text':
                        const textWrapper = document.createElement('div');
                        Object.assign(textWrapper.style, finalElementStyles);
                        
                        const text = document.createElement('div');
                        text.textContent = element.content.text;
                        text.style.cssText = \`
                            margin: 0;
                            color: \${element.styles.color || '#000000'};
                            font-size: \${element.styles.fontSize || '16px'};
                            line-height: \${element.styles.lineHeight || '1.5'};
                            text-align: \${element.styles.textAlign || 'left'};
                            font-weight: \${element.styles.fontWeight || 'normal'};
                            font-style: \${element.styles.fontStyle || 'normal'};
                            text-decoration: \${element.styles.textDecoration || 'none'};
                            letter-spacing: \${element.styles.letterSpacing || 'normal'};
                            word-spacing: \${element.styles.wordSpacing || 'normal'};
                            text-transform: \${element.styles.textTransform || 'none'};
                            text-shadow: \${element.styles.textShadow || 'none'};
                            font-family: \${element.styles.fontFamily || 'inherit'};
                            max-width: 100%;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        \`;
                        textWrapper.appendChild(text);
                        return textWrapper;
                        
                    case 'image':
                        if (element.content.isBackground) {
                            const bgDiv = document.createElement('div');
                            Object.assign(bgDiv.style, {
                                ...element.styles,
                                backgroundImage: \`url(\${element.content.src})\`,
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
                            });
                            
                            if (element.content.overlayText) {
                                const overlay = document.createElement('div');
                                overlay.textContent = element.content.overlayText;
                                overlay.style.cssText = \`
                                    position: absolute;
                                    top: 50%;
                                    left: \${element.content.overlayTextAlign === 'left' ? '20px' : 
                                           element.content.overlayTextAlign === 'right' ? 'auto' : '50%'};
                                    right: \${element.content.overlayTextAlign === 'right' ? '20px' : 'auto'};
                                    transform: \${element.content.overlayTextAlign === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)'};
                                    textAlign: \${element.content.overlayTextAlign || 'center'};
                                    color: \${element.content.overlayTextColor || '#ffffff'};
                                    fontSize: \${element.content.overlayFontSize || '24px'};
                                    font-weight: bold;
                                    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                                    z-index: 1;
                                    max-width: \${element.content.overlayTextAlign === 'center' ? '80%' : 'calc(100% - 40px)'};
                                    padding: 20px;
                                    word-wrap: break-word;
                                \`;
                                bgDiv.appendChild(overlay);
                            }
                            return bgDiv;
                        } else {
                            const img = document.createElement('img');
                            img.src = element.content.src;
                            img.alt = element.content.alt || '';
                            Object.assign(img.style, {
                                ...element.styles,
                                maxWidth: element.styles.width || '100%',
                                height: 'auto',
                                borderRadius: element.styles.borderRadius || '8px',
                                boxShadow: element.styles.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
                                display: 'block',
                                objectFit: element.styles.objectFit || 'cover'
                            });
                            
                            const wrapper = document.createElement('div');
                            wrapper.style.cssText = 'text-align: center; margin: 20px 0;';
                            wrapper.appendChild(img);
                            return wrapper;
                        }
                        
                    case 'form':
                        const form = document.createElement('form');
                        Object.assign(form.style, {
                            ...element.styles,
                            // Override problematic styles for proper display
                            width: '100%',
                            margin: '0',
                            padding: '0',
                            overflow: 'visible',
                            boxSizing: 'border-box',
                            minHeight: 'auto'
                        });
                        
                        element.content.fields.forEach((field, index) => {
                            const fieldWrapper = document.createElement('div');
                            fieldWrapper.style.cssText = 'margin-bottom: 8px;'; // Match builder preview
                            
                            let input;
                            if (field.type === 'textarea') {
                                input = document.createElement('textarea');
                                input.rows = 4;
                            } else if (field.type === 'select') {
                                input = document.createElement('select');
                                const defaultOption = document.createElement('option');
                                defaultOption.value = '';
                                defaultOption.textContent = field.placeholder;
                                input.appendChild(defaultOption);
                                field.options?.forEach(option => {
                                    const optionElement = document.createElement('option');
                                    optionElement.value = option;
                                    optionElement.textContent = option;
                                    input.appendChild(optionElement);
                                });
                            } else {
                                input = document.createElement('input');
                                input.type = field.type;
                            }
                            
                            input.name = \`field_\${index}\`;
                            input.placeholder = field.placeholder;
                            input.required = field.required;
                            
                            Object.assign(input.style, {
                                width: '100%',
                                padding: '0px', // No padding
                                border: '1px solid #d1d5db',
                                borderRadius: '0px',
                                fontSize: '5px', // Ultra-small font
                                boxSizing: 'border-box',
                                minHeight: '12px', // Ultra-compact height
                                lineHeight: '1.0' // Ultra-tight line height
                            });
                            
                            fieldWrapper.appendChild(input);
                            form.appendChild(fieldWrapper);
                        });
                        
                        // Add hidden fields for tracking
                        if (emailId) {
                            const emailIdInput = document.createElement('input');
                            emailIdInput.type = 'hidden';
                            emailIdInput.name = 'emailId';
                            emailIdInput.value = emailId;
                            form.appendChild(emailIdInput);
                        }
                        
                        if (campaignId) {
                            const campaignIdInput = document.createElement('input');
                            campaignIdInput.type = 'hidden';
                            campaignIdInput.name = 'campaignId';
                            campaignIdInput.value = campaignId;
                            form.appendChild(campaignIdInput);
                        }
                        
                        if (recipientEmail) {
                            const recipientEmailInput = document.createElement('input');
                            recipientEmailInput.type = 'hidden';
                            recipientEmailInput.name = 'recipientEmail';
                            recipientEmailInput.value = recipientEmail;
                            form.appendChild(recipientEmailInput);
                        }
                        
                        const submitBtn = document.createElement('button');
                        submitBtn.type = 'submit';
                        submitBtn.textContent = element.content.submitText;
                        submitBtn.style.cssText = \`
                            background-color: #3b82f6;
                            color: white;
                            padding: 0px; // No padding
                            border: none;
                            border-radius: 0px;
                            font-size: '5px'; // Ultra-small font
                            font-weight: 600;
                            cursor: pointer;
                            width: 100%;
                            box-sizing: border-box;
                            min-height: 14px; // Ultra-compact height
                            margin-top: 0px; // No spacing from fields
                            line-height: 1.0; // Ultra-tight line height
                        \`;
                        form.appendChild(submitBtn);
                        
                        // Add form submission handler
                        form.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            
                            const formData = new FormData(form);
                            const data = {};
                            
                            element.content.fields.forEach((field, index) => {
                                const fieldName = \`field_\${index}\`;
                                const value = formData.get(fieldName);
                                data[fieldName] = {
                                    type: field.type,
                                    placeholder: field.placeholder,
                                    required: field.required,
                                    value: value,
                                    label: field.label || field.placeholder
                                };
                            });
                            
                            try {
                                const response = await fetch(\`\${window.location.origin}/api/landing-pages/\${window.location.pathname.split('/').pop()}/submit-form\`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        landingPageId: window.location.pathname.split('/').pop(),
                                        emailId: emailId,
                                        campaignId: campaignId,
                                        recipientEmail: recipientEmail,
                                        formData: data,
                                        submittedAt: new Date().toISOString()
                                    })
                                });
                                
                                const result = await response.json();
                                if (result.success) {
                                    alert('Form submitted successfully!');
                                    form.reset();
                                } else {
                                    alert('Failed to submit form. Please try again.');
                                }
                            } catch (error) {
                                console.error('Error submitting form:', error);
                                alert('Error submitting form. Please try again.');
                            }
                        });
                        
                        const formWrapper = document.createElement('div');
                        // Check if this form is inside a container
                        const isInsideContainer = pageData.elements.some(container => 
                            container.type === 'container' && 
                            container.content.children && 
                            container.content.children.includes(element.id)
                        );
                        
                        if (isInsideContainer) {
                            // Most aggressive size constraints for forms inside containers
                            const userMaxWidth = parseInt(element.styles.maxWidth) || 200;
                            const userPadding = parseInt(element.styles.padding) || 4;
                            const userFontSize = parseInt(element.styles.fontSize) || 9;
                            formWrapper.style.cssText = 'max-width: ' + Math.min(userMaxWidth, 200) + 'px; margin: ' + (element.styles.margin || '0') + '; padding: ' + Math.min(userPadding, 4) + 'px; box-sizing: border-box; overflow: visible; font-size: ' + Math.min(userFontSize, 9) + 'px; width: ' + (element.styles.width || '180px') + '; min-width: ' + Math.max(parseInt(element.styles.minWidth) || 120, 120) + 'px; flex: 0 0 auto; line-height: 1.2;';
                        } else {
                            // More aggressive size constraints for standalone forms
                            const userMaxWidth = parseInt(element.styles.maxWidth) || 300;
                            const userPadding = parseInt(element.styles.padding) || 8;
                            const userFontSize = parseInt(element.styles.fontSize) || 10;
                            formWrapper.style.cssText = 'max-width: ' + Math.min(userMaxWidth, 300) + 'px; margin: ' + (element.styles.margin || '0 auto') + '; padding: ' + Math.min(userPadding, 8) + 'px; box-sizing: border-box; overflow: visible; font-size: ' + Math.min(userFontSize, 10) + 'px; width: ' + (element.styles.width || '250px') + '; min-width: ' + Math.max(parseInt(element.styles.minWidth) || 180, 180) + 'px; line-height: 1.2;';
                        }
                        formWrapper.appendChild(form);
                        return formWrapper;
                        
                    case 'divider':
                        const divider = document.createElement('div');
                        Object.assign(divider.style, {
                            width: '100%',
                            height: element.styles.height || '1px',
                            backgroundColor: element.styles.backgroundColor || '#e5e7eb',
                            margin: element.styles.margin || '24px 0'
                        });
                        return divider;
                        
                    case 'container':
                        const containerDiv = document.createElement('div');
                        Object.assign(containerDiv.style, {
                            ...element.styles,
                            border: element.styles.border || 'none',
                            backgroundColor: element.styles.backgroundColor || '#f9fafb',
                            minHeight: Math.min(parseInt(element.styles.minHeight) || 60, 60) + 'px', // Much smaller default
                            padding: Math.min(parseInt(element.styles.padding) || 8, 8) + 'px', // Much smaller padding
                            margin: element.styles.margin || '0px',
                            borderRadius: element.styles.borderRadius || '8px',
                            width: element.styles.width || '100%',
                            height: element.styles.height || 'auto',
                            maxWidth: element.styles.maxWidth || 'none',
                            overflow: 'visible', // Changed from 'hidden' to 'visible'
                            boxSizing: 'border-box',
                            minWidth: Math.min(parseInt(element.styles.minWidth) || 150, 150) + 'px' // Much smaller min width
                        });
                        
                        if (element.content.children && element.content.children.length > 0) {
                            const flexContainer = document.createElement('div');
                            Object.assign(flexContainer.style, {
                                display: element.containerStyles?.display || 'flex',
                                flexDirection: element.containerStyles?.flexDirection || 'row',
                                alignItems: element.containerStyles?.alignItems || 'center',
                                justifyContent: element.containerStyles?.justifyContent || 'flex-start',
                                gap: Math.min(parseInt(element.containerStyles?.gap) || 8, 8) + 'px', // Much smaller gap
                                width: '100%',
                                height: '100%',
                                flexWrap: element.containerStyles?.flexWrap || 'wrap', // Changed to wrap
                                position: 'relative',
                                overflow: 'visible', // Changed from 'hidden' to 'visible'
                                boxSizing: 'border-box',
                                // Add padding to prevent edge clipping
                                padding: Math.min(parseInt(element.containerStyles?.padding) || 4, 4) + 'px', // Much smaller padding
                                // Ensure container can grow to fit content
                                minHeight: 'auto',
                                // Add minimum width for container
                                minWidth: '120px' // Much smaller min width
                            });
                            
                            element.content.children.forEach(childId => {
                                const childElement = pageData.elements.find(el => el.id === childId);
                                if (childElement) {
                                    // Apply container-specific styling directly to the element
                                    const originalStyles = { ...childElement.styles };
                                    
                                    // Apply flex container styling for child elements
                                    Object.assign(childElement.styles, {
                                        border: 'none',
                                        position: 'relative',
                                        cursor: 'default',
                                        minHeight: childElement.styles.minHeight || 'auto',
                                        minWidth: childElement.styles.minWidth || 'auto',
                                        width: childElement.type === 'image' ? (childElement.styles.width || '100%') : (childElement.styles.width || 'auto'),
                                        height: childElement.styles.height || 'auto',
                                        padding: Math.min(parseInt(childElement.styles.padding) || 2, 2) + 'px', // Ultra-minimal padding
                                        margin: Math.min(parseInt(childElement.styles.margin) || 2, 2) + 'px', // Ultra-minimal margin
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
                                        marginLeft: '0',
                                        marginRight: '0',
                                        marginTop: '0',
                                        marginBottom: '0',
                                        // Changed overflow to visible to prevent cropping
                                        overflow: 'visible',
                                        // Ensure proper box sizing
                                        boxSizing: 'border-box',
                                        // Remove maxWidth constraint to allow full element display
                                        maxWidth: childElement.styles.maxWidth || 'none',
                                        // Ensure text doesn't overflow
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        // Special handling for forms to prevent cropping
                                        ...(childElement.type === 'form' ? {
                                            // Ultra-extreme size constraints
                                            width: '120px', // Ultra-small fixed width
                                            maxWidth: '120px', // Ultra-small fixed max width
                                            minWidth: '120px', // Ultra-small fixed min width
                                            flex: '0 0 auto', // Don't grow or shrink
                                            flexGrow: 0, // Never grow
                                            flexShrink: 0, // Never shrink
                                            overflow: 'visible',
                                            margin: '0',
                                            padding: '1px', // Ultra-minimal padding
                                            fontSize: '6px', // Ultra-small font
                                            minHeight: 'auto',
                                            maxHeight: 'none',
                                            boxSizing: 'border-box',
                                            lineHeight: '1.0',
                                            // Override all user styles to prevent conflicts
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            borderRadius: '0px'
                                        } : {}),
                                        // Special handling for images to prevent cropping
                                        ...(childElement.type === 'image' ? {
                                            width: childElement.styles.width || '100%',
                                            maxWidth: childElement.styles.maxWidth || 'none',
                                            minWidth: childElement.styles.minWidth || 'auto',
                                            flex: '0 1 auto',
                                            overflow: 'visible',
                                            margin: '0',
                                            padding: Math.min(parseInt(childElement.styles.padding) || 2, 2) + 'px', // Ultra-minimal padding
                                            objectFit: 'contain'
                                        } : {})
                                    });
                                    
                                    // Render the element directly and add to flex container
                                    const renderedElement = renderElement(childElement);
                                    flexContainer.appendChild(renderedElement);
                                    
                                    // Restore original styles
                                    childElement.styles = originalStyles;
                                }
                            });
                            
                            containerDiv.appendChild(flexContainer);
                        } else {
                            // Empty container
                            const emptyDiv = document.createElement('div');
                            emptyDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 14px; border: 2px dashed #d1d5db; border-radius: 4px; padding: 20px; text-align: center;';
                            emptyDiv.innerHTML = '<div style="font-size: 24px; margin-bottom: 8px;">📦</div><div>Container - Empty</div>';
                            containerDiv.appendChild(emptyDiv);
                        }
                        
                        return containerDiv;
                        
                    case 'button':
                        const buttonWrapper = document.createElement('div');
                        Object.assign(buttonWrapper.style, finalElementStyles);
                        
                        const button = document.createElement('button');
                        button.textContent = element.content.text;
                        button.style.cssText = \`
                            margin: 0;
                            padding: \${element.styles.padding || '10px 20px'};
                            border: \${element.styles.border || '1px solid #3b82f6'};
                            background-color: \${element.styles.backgroundColor || '#3b82f6'};
                            color: \${element.styles.color || '#ffffff'};
                            border-radius: \${element.styles.borderRadius || '6px'};
                            font-size: \${element.styles.fontSize || '16px'};
                            text-align: \${element.styles.textAlign || 'center'};
                            cursor: pointer;
                            width: \${element.styles.width || 'fit-content'};
                            min-width: \${element.styles.minWidth || 'auto'};
                            max-width: \${element.styles.maxWidth || '100%'};
                            height: \${element.styles.height || 'auto'};
                            font-weight: \${element.styles.fontWeight || 'normal'};
                            font-style: \${element.styles.fontStyle || 'normal'};
                            text-decoration: \${element.styles.textDecoration || 'none'};
                            letter-spacing: \${element.styles.letterSpacing || 'normal'};
                            word-spacing: \${element.styles.wordSpacing || 'normal'};
                            text-transform: \${element.styles.textTransform || 'none'};
                            text-shadow: \${element.styles.textShadow || 'none'};
                            font-family: \${element.styles.fontFamily || 'inherit'};
                        \`;
                        buttonWrapper.appendChild(button);
                        return buttonWrapper;
                        
                    default:
                        return document.createElement('div');
                }
            }
            
            // Render all elements that are not inside containers
            pageData.elements.forEach(element => {
                const isInsideContainer = pageData.elements.some(container => 
                    container.type === 'container' && 
                    container.content.children && 
                    container.content.children.includes(element.id)
                );
                
                if (!isInsideContainer) {
                    const elementDiv = document.createElement('div');
                    elementDiv.style.marginBottom = element.styles.marginBottom || '0px';
                    elementDiv.appendChild(renderElement(element));
                    container.appendChild(elementDiv);
                }
            });
            
            root.innerHTML = '';
            root.appendChild(container);
        }
        
        // Extract landing page ID from URL
        const pathParts = window.location.pathname.split('/');
        const landingPageId = pathParts[pathParts.length - 1];
        
        // Extract query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const emailId = urlParams.get('emailId');
        const campaignId = urlParams.get('campaignId');
        const recipientEmail = urlParams.get('recipientEmail');
        
        // Fetch landing page data
        fetch(\`\${window.location.origin}/api/landing-pages/\${landingPageId}\`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    const landingPage = data.data;
                    
                    // Record acknowledgement
                    fetch(\`\${window.location.origin}/api/landing-pages/\${landingPageId}/acknowledge\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            emailId,
                            campaignId,
                            recipientEmail
                        })
                    }).catch(error => {
                        console.error('Error recording acknowledgement:', error);
                    });
                    
                    // Render landing page content
                    const root = document.getElementById('root');
                    
                    if (landingPage.contentType === 'html') {
                        // Check if this is builder-generated content (JSON format)
                        if (landingPage.content && landingPage.content.includes('"elements"') && landingPage.content.includes('"type"')) {
                            // Parse the JSON content and render it properly
                            try {
                                const pageData = JSON.parse(landingPage.content);
                                
                                if (pageData.elements && Array.isArray(pageData.elements)) {
                                    // This is builder content - render it properly
                                    renderBuilderContent(pageData, root, emailId, campaignId, recipientEmail);
                                } else {
                                    // Fallback to direct HTML rendering
                                    root.innerHTML = landingPage.content;
                                }
                            } catch (e) {
                                console.error('Error parsing landing page content:', e);
                                // Fallback to direct HTML rendering
                                root.innerHTML = landingPage.content;
                            }
                        } else {
                            // Regular HTML content
                            root.innerHTML = landingPage.content;
                        }
                    } else if (landingPage.contentType === 'iframe' || landingPage.contentType === 'pdf') {
                        root.innerHTML = \`
                            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; margin: 20px auto; max-width: 1200px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <h1 style="color: #1f2937; font-size: 32px; font-weight: bold; margin-bottom: 16px;">\${landingPage.title}</h1>
                                    <p style="color: #6b7280; font-size: 16px;">\${landingPage.description || ''}</p>
                                </div>
                                <iframe 
                                    src="\${landingPage.contentUrl}" 
                                    style="width: 100%; height: 80vh; border: none; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);" 
                                    title="\${landingPage.title}">
                                </iframe>
                            </div>
                        \`;
                    }
                    
                    // Add acknowledgement indicator
                    const indicator = document.createElement('div');
                    indicator.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; z-index: 1000;';
                    indicator.innerHTML = '✓ Acknowledged';
                    document.body.appendChild(indicator);
                    
                } else {
                    document.getElementById('root').innerHTML = \`
                        <div class="error">
                            <h2>Landing Page Not Found</h2>
                            <p>The requested landing page could not be found or the URL is invalid.</p>
                        </div>
                    \`;
                }
            })
            .catch(error => {
                console.error('Error loading landing page:', error);
                document.getElementById('root').innerHTML = \`
                    <div class="error">
                        <h2>Error Loading Landing Page</h2>
                        <p>Unable to load the landing page. Please try again later.</p>
                    </div>
                \`;
            });
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
    
  } catch (error) {
    console.error('❌ Error serving landing page:', error);
    res.status(500).send('Internal server error');
  }
});

export default app;

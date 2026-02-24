/**
 * Survey Helper Utilities
 * Functions to generate survey links and buttons for email templates
 */

export interface SurveyLinkOptions {
  type: 'button' | 'link';
  text: string;
  surveyId?: string;
  emailId?: string;
  recipientEmail?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Generate survey URL with parameters
 */
export const generateSurveyUrl = (
  baseUrl: string = window.location.origin,
  options: {
    surveyId?: string;
    emailId?: string;
    recipientEmail?: string;
  } = {}
): string => {
  const params = new URLSearchParams();
  
  if (options.surveyId) {
    params.append('surveyId', options.surveyId);
  }
  if (options.emailId) {
    params.append('emailId', options.emailId);
  }
  if (options.recipientEmail) {
    params.append('recipientEmail', options.recipientEmail);
  }
  
  const queryString = params.toString();
  return `${baseUrl}/survey${queryString ? `?${queryString}` : ''}`;
};

/**
 * Generate HTML for survey button
 */
export const generateSurveyButton = (options: SurveyLinkOptions): string => {
  const surveyUrl = generateSurveyUrl(window.location.origin, {
    surveyId: options.surveyId,
    emailId: options.emailId,
    recipientEmail: options.recipientEmail
  });

  const buttonStyle = options.style ? 
    Object.entries(options.style)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ') : '';

  return `
    <a href="${surveyUrl}" 
       style="${buttonStyle}"
       class="${options.className || ''}"
       target="_blank">
      ${options.text}
    </a>
  `.trim();
};

/**
 * Generate HTML for survey link
 */
export const generateSurveyLink = (options: SurveyLinkOptions): string => {
  const surveyUrl = generateSurveyUrl(window.location.origin, {
    surveyId: options.surveyId,
    emailId: options.emailId,
    recipientEmail: options.recipientEmail
  });

  return `
    <a href="${surveyUrl}" 
       class="${options.className || ''}"
       target="_blank">
      ${options.text}
    </a>
  `.trim();
};

/**
 * Inject survey into email template body
 */
export const injectSurveyIntoEmail = (
  emailBody: string,
  surveyId: string,
  emailId: string,
  baseUrl: string = window.location.origin,
  options: {
    type?: 'button' | 'link';
    text?: string;
    position?: 'start' | 'end' | 'after-first-paragraph';
    buttonStyle?: React.CSSProperties;
    linkStyle?: React.CSSProperties;
  } = {}
): string => {
  const {
    type = 'button',
    text = 'Take Survey',
    position = 'end',
    buttonStyle = {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 24px',
      textDecoration: 'none',
      borderRadius: '4px',
      display: 'inline-block'
    },
    linkStyle = {
      color: '#3b82f6',
      textDecoration: 'underline'
    }
  } = options;

  const surveyOptions: SurveyLinkOptions = {
    type,
    text,
    surveyId,
    emailId,
    style: type === 'button' ? buttonStyle : linkStyle
  };

  const surveyHtml = type === 'button' 
    ? generateSurveyButton(surveyOptions)
    : generateSurveyLink(surveyOptions);

  let modifiedBody = emailBody;

  switch (position) {
    case 'start':
      modifiedBody = surveyHtml + '\n\n' + emailBody;
      break;
    case 'end':
      modifiedBody = emailBody + '\n\n' + surveyHtml;
      break;
    case 'after-first-paragraph':
      const paragraphs = emailBody.split('\n\n');
      if (paragraphs.length > 1) {
        modifiedBody = paragraphs[0] + '\n\n' + surveyHtml + '\n\n' + paragraphs.slice(1).join('\n\n');
      } else {
        modifiedBody = emailBody + '\n\n' + surveyHtml;
      }
      break;
  }

  return modifiedBody;
};

/**
 * Open survey form in new window
 */
export const openSurveyForm = (
  options: {
    surveyId?: string;
    emailId?: string;
    recipientEmail?: string;
  } = {}
): void => {
  const surveyUrl = generateSurveyUrl(window.location.origin, options);
  window.open(surveyUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
};

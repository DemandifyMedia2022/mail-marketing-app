/**
 * Generate survey link for email
 */
export const generateSurveyLink = (baseUrl, surveyId, emailId, linkText = 'Take Survey') => {
  const surveyUrl = `${baseUrl}/api/emails/survey/${surveyId}/${emailId}`;
  return `<a href="${surveyUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">${linkText}</a>`;
};

/**
 * Generate survey button for email
 */
export const generateSurveyButton = (baseUrl, surveyId, emailId, buttonText = 'Take Survey') => {
  const surveyUrl = `${baseUrl}/api/emails/survey/${surveyId}/${emailId}`;
  return `
    <table border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
          <a href="${surveyUrl}" target="_blank" style="
            font-size: 16px; 
            font-family: Arial, sans-serif; 
            color: #ffffff; 
            text-decoration: none; 
            border-radius: 6px; 
            padding: 12px 24px; 
            border: 1px solid #1d4ed8; 
            display: inline-block; 
            font-weight: 500;
          ">${buttonText}</a>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Inject survey into email template
 */
export const injectSurveyIntoEmail = (emailBody, surveyId, emailId, baseUrl, options = {}) => {
  const { type = 'button', text = 'Take Survey', position = 'end' } = options;
  
  let surveyHtml;
  if (type === 'button') {
    surveyHtml = generateSurveyButton(baseUrl, surveyId, emailId, text);
  } else {
    surveyHtml = generateSurveyLink(baseUrl, surveyId, emailId, text);
  }
  
  if (position === 'start') {
    return surveyHtml + emailBody;
  } else if (position === 'end') {
    return emailBody + surveyHtml;
  } else {
    // Insert after first paragraph or at end
    const firstParagraphEnd = emailBody.indexOf('</p>');
    if (firstParagraphEnd !== -1) {
      return emailBody.substring(0, firstParagraphEnd + 4) + surveyHtml + emailBody.substring(firstParagraphEnd + 4);
    }
    return emailBody + surveyHtml;
  }
};

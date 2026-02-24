import React, { useState } from 'react';
import axios from 'axios';

interface BasicSurveyFormProps {
  surveyId?: string;
  emailId?: string;
  onSubmit?: (data: BasicSurveyData) => void;
  className?: string;
}

interface BasicSurveyData {
  name: string;
  contact: string;
  interested: boolean;
  feedback: string;
  emailId?: string;
}

const BasicSurveyForm: React.FC<BasicSurveyFormProps> = ({ 
  surveyId, 
  emailId, 
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<BasicSurveyData>({
    name: '',
    contact: '',
    interested: false,
    feedback: '',
    emailId: emailId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.contact.trim()) {
        throw new Error('Contact number is required');
      }
      if (!formData.feedback.trim()) {
        throw new Error('Feedback is required');
      }

      // Submit to backend
      const response = await axios.post('http://localhost:5000/api/survey-responses/basic', {
        ...formData,
        surveyId: surveyId || 'basic-survey',
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        setSubmitted(true);
        onSubmit?.(formData);
      } else {
        throw new Error(response.data.message || 'Failed to submit survey');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`survey-form-success ${className}`}>
        <div className="success-message">
          <h3>Thank you for your feedback!</h3>
          <p>Your response has been successfully submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`basic-survey-form ${className}`}>
      <form onSubmit={handleSubmit} className="survey-form-container">
        <h3>Quick Survey</h3>
        <p className="survey-description">We'd love to hear from you!</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact" className="form-label">
            Contact Number *
          </label>
          <input
            type="tel"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Interested in our services?
          </label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="interested"
                checked={formData.interested}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">Yes, I'm interested</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedback" className="form-label">
            Feedback *
          </label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Share your thoughts and feedback..."
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <style>{`
        .basic-survey-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .survey-form-container h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .survey-description {
          margin: 0 0 24px 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          transition: border-color 0.15s ease-in-out;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-group {
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
        }

        .form-checkbox {
          margin-right: 8px;
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
        }

        .submit-button {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
        }

        .submit-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .survey-form-success {
          max-width: 500px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          background: #ecfdf5;
          text-align: center;
        }

        .success-message h3 {
          margin: 0 0 8px 0;
          color: #065f46;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .success-message p {
          margin: 0;
          color: #047857;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default BasicSurveyForm;

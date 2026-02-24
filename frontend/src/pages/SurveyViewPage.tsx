import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Calendar, Users, Tag, FileText, CheckCircle, Star, Send, ChevronRight, Sparkles } from 'lucide-react';
import type { Survey } from '../types/survey.types';
import type { ViewKey } from '../types/app.types';
import SurveyResponseService from '../services/surveyResponseService';

interface SurveyViewPageProps {
  survey?: Survey | null;
  onNavigate?: (view: ViewKey) => void;
}

const SurveyViewPage: React.FC<SurveyViewPageProps> = ({ onNavigate }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const viewingSurveyData = localStorage.getItem('viewingSurveyData');
    if (viewingSurveyData) {
      try {
        const surveyData = JSON.parse(viewingSurveyData);
        setSurvey(surveyData);
        localStorage.removeItem('viewingSurveyData');
      } catch (error) {
        console.error('Error parsing viewing data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) {
      console.error('No survey data available');
      return;
    }

    try {
      // Prepare answers array for API
      const answers = (survey.questions || []).map((question: any, index: number) => {
        const fieldId = question._id || `q_${index}`;
        const answer = formData[fieldId];
        
        return {
          questionId: question._id || `q_${index}`,
          question: question.question || `Question ${index + 1}`,
          answer: answer,
          answerText: typeof answer === 'string' ? answer : JSON.stringify(answer)
        };
      }) || [];

      // Prepare response data for basic submission (matches backend expectations)
      const responseData = {
        surveyId: survey._id || (survey as any).id, // Use _id first, fallback to id
        recipientEmail: 'user@example.com', // You can make this dynamic based on logged-in user
        name: 'Survey User', // You can make this dynamic based on logged-in user
        contact: 'user@example.com', // You can make this dynamic based on logged-in user
        feedback: 'Survey completed via preview form', // You can customize this message
        answers: answers.map((answer: any) => ({
          questionId: answer.questionId,
          question: answer.question,
          answer: answer.answer,
          answerText: answer.answerText
        })),
        // Include survey data for backend to create survey if it doesn't exist
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        ipAddress: '127.0.0.1', // This will be automatically set by backend
        userAgent: navigator.userAgent // This will be automatically set by backend
      };

      console.log('Submitting survey response:', responseData);

      // Submit to MongoDB via preview API (no emailId validation)
      const result = await SurveyResponseService.submitSurveyPreviewResponse(responseData);
      
      if (result.success) {
        console.log('✅ Survey response submitted successfully:', result.data);
        setSubmitted(true);
      } else {
        console.error('❌ Failed to submit survey response:', result.message);
        alert('Failed to submit survey response. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting survey response:', error);
      alert('Error submitting survey response. Please try again.');
    }
  };

  const renderInteractiveField = (question: any, index: number) => {
    const fieldId = question._id || `q_${index}`;
    
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={question.placeholder || `Enter ${question.question.toLowerCase()}`}
            value={formData[fieldId] || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            placeholder={question.placeholder || 'Enter your email address'}
            value={formData[fieldId] || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder || 'Enter your response'}
            value={formData[fieldId] || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 resize-none"
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            {(question.options || ['Option 1', 'Option 2']).map((option: string, idx: number) => (
              <label key={idx} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all duration-200 hover:border-blue-300">
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={formData[fieldId] === option}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {(question.options || ['Option 1', 'Option 2']).map((option: string, idx: number) => (
              <label key={idx} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all duration-200 hover:border-blue-300">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[fieldId] || []).includes(option)}
                  onChange={(e) => {
                    const current = formData[fieldId] || [];
                    if (e.target.checked) {
                      handleInputChange(fieldId, [...current, option]);
                    } else {
                      handleInputChange(fieldId, current.filter((item: string) => item !== option));
                    }
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange(fieldId, star)}
                className="p-2 transition-all duration-200 hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= (formData[fieldId] || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                />
              </button>
            ))}
          </div>
        );
      
      case 'emoji':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg">
              <span className="text-2xl">{formData[fieldId] || '😊'}</span>
              <input
                type="text"
                placeholder="Click to select emoji or type emoji"
                value={formData[fieldId] || ''}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['😊', '😃', '😍', '🤔', '😎', '👍', '👎', '❤️', '🎉', '🔥', '💯', '✨'].map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInputChange(fieldId, emoji)}
                  className="text-2xl p-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={question.placeholder || 'Enter your response'}
            value={formData[fieldId] || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" style={{width: '100%'}} >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"  style={{width: '100%'}} >
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Survey Not Found</h2>
          <p className="text-slate-600 mb-4">The survey you're looking for doesn't exist.</p>
          <button
            onClick={() => onNavigate?.('surveyTemplates')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center" style={{width: '100%'}}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">Your survey response has been submitted successfully.</p>
          <button
            onClick={() => onNavigate?.('surveyTemplates')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Back to Surveys
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" style={{width: '100%'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('surveyTemplates')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Surveys
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('editingSurveyData', JSON.stringify(survey));
                  onNavigate?.('surveyForm');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Edit Survey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Survey Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
                <p className="text-blue-100 text-lg">{survey.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{survey.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Created {new Date(survey.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{survey.responses?.length || 0} responses</span>
              </div>
            </div>
          </div>

          {/* Survey Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Check if survey has questions */}
              {survey && survey.questions ? (
                survey.questions.map((question: any, index: number) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors duration-200">
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {question.question}
                        {question.required && <span className="text-red-500">*</span>}
                      </label>
                      {question.description && (
                        <p className="text-slate-600 text-sm ml-10">{question.description}</p>
                      )}
                    </div>
                    {renderInteractiveField(question, index)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-500">No survey questions available</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Survey data: {survey ? 'Loaded but no questions' : 'Not loaded'}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-3 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Submit Survey
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyViewPage;

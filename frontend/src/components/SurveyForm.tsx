import React, { useState, useEffect } from 'react';
import SurveyBuilder from './SurveyBuilder';
import type { Survey } from '../types/survey.types';
import type { SurveyField } from '../types/surveyBuilder.types';
import { ArrowLeft } from 'lucide-react';

interface SurveyFormProps {
  survey: Survey | null | undefined;
  onSave: (survey: Partial<Survey>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ 
  survey, 
  onSave, 
  onCancel, 
  isLoading 
}) => {
  console.log('=== SURVEY FORM COMPONENT ===');
  console.log('Survey prop:', survey);
  console.log('isLoading prop:', isLoading);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Feedback' as Survey['category'],
    status: 'Draft' as Survey['status'],
    expiryDate: '',
    targetCampaign: '',
    targetEmailTemplate: ''
  });
  
  const [fields, setFields] = useState<SurveyField[]>([]);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [saveCallCount, setSaveCallCount] = useState(0);

  const categories: Survey['category'][] = ['Feedback', 'Lead', 'Product', 'Support', 'HR', 'Other'];
  const statuses: Survey['status'][] = ['Draft', 'Active', 'Inactive'];

  // Update form data when survey prop changes (for edit functionality)
  useEffect(() => {
    console.log('=== SURVEY PROP CHANGED ===');
    console.log('Survey prop received:', survey);
    console.log('Survey prop type:', typeof survey);
    console.log('Survey is null?', survey === null);
    console.log('Survey is undefined?', survey === undefined);
    
    // Debug current fields state
    console.log('Current fields state before update:', fields);
    console.log('Current fields length:', fields.length);
    
    // Additional debug: Check localStorage directly
    const editingData = localStorage.getItem('editingSurveyData');
    console.log('Direct localStorage check - editingSurveyData:', editingData);
    if (editingData) {
      try {
        const parsed = JSON.parse(editingData);
        console.log('Direct localStorage parsed data:', parsed);
        console.log('Direct localStorage questions:', parsed.questions);
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
    
    try {
      // If survey prop is null/undefined but we have localStorage data, use it
      let surveyData = survey;
      if (!surveyData && editingData) {
        console.log('⚠️ Survey prop is null but localStorage has data, using localStorage');
        surveyData = JSON.parse(editingData);
        // Clean up localStorage after using it
        localStorage.removeItem('editingSurveyData');
        localStorage.removeItem('editingSurveyId');
      }
      
      if (surveyData && typeof surveyData === 'object' && surveyData !== null) {
        console.log('✅ Survey object found, processing...');
        console.log('Survey object keys:', Object.keys(surveyData));
        console.log('Survey questions:', surveyData.questions);
        console.log('Survey questions type:', typeof surveyData.questions);
        console.log('Survey questions is array?', Array.isArray(surveyData.questions));
        console.log('Survey questions length:', surveyData.questions?.length);
        
        // Always update form data if we have a survey object
        console.log('✅ Updating form with survey data');
        console.log('✅ Survey title:', surveyData.title);
        console.log('✅ Survey questions count:', surveyData.questions?.length || 0);
        
        // Update form data
        setFormData({
          title: surveyData.title || '',
          description: surveyData.description || '',
          category: surveyData.category || 'Feedback',
          status: surveyData.status || 'Draft',
          expiryDate: surveyData.expiryDate ? new Date(surveyData.expiryDate).toISOString().split('T')[0] : '',
          targetCampaign: surveyData.targetCampaign || '',
          targetEmailTemplate: surveyData.targetEmailTemplate || ''
        });
        
        // Convert questions to fields if they exist
        if (surveyData.questions && Array.isArray(surveyData.questions) && surveyData.questions.length > 0) {
          console.log('✅ Converting questions to fields...');
          const newFields = surveyData.questions.map((q: any, index) => {
            console.log(`✅ Converting question ${index}:`, q);
            console.log(`Question ${index} details:`, {
              _id: q._id,
              type: q.type,
              question: q.question,
              options: q.options,
              required: q.required
            });
            
            return {
              id: q._id || `field_${index}`,
              type: q.type || 'text',
              label: q.question || '',
              placeholder: q.placeholder || '',
              required: q.required || false,
              order: q.order || index,
              options: q.options || [],
              validation: q.validation || {}
            };
          });
          
          console.log('✅ Converted fields:', newFields);
          console.log('✅ Setting fields with length:', newFields.length);
          setFields(newFields);
          
          // Verify fields were set
          setTimeout(() => {
            console.log('Fields after timeout check:', newFields);
            console.log('Fields state should be updated now');
          }, 100);
        } else {
          console.log('⚠️ No questions found in survey, setting empty fields');
          console.log('Questions value:', surveyData.questions);
          console.log('Questions type:', typeof surveyData.questions);
          console.log('Questions isArray:', Array.isArray(surveyData.questions));
          setFields([]);
        }
        
        console.log('✅ Form updated successfully');
      } else {
        console.log('❌ Survey prop is null or undefined');
        console.log('Setting up for new survey creation');
        
        // Reset form for new survey
        setFormData({
          title: '',
          description: '',
          category: 'Feedback' as Survey['category'],
          status: 'Draft' as Survey['status'],
          expiryDate: '',
          targetCampaign: '',
          targetEmailTemplate: ''
        });
        
        // Clear fields if no questions
        setFields([]);
      }
    } catch (error) {
      console.error('❌ Error processing survey data:', error);
      console.error('Error details:', (error as Error).message);
      console.error('Error stack:', (error as Error).stack);
      
      // Reset to safe state
      setFormData({
        title: '',
        description: '',
        category: 'Feedback' as Survey['category'],
        status: 'Draft' as Survey['status'],
        expiryDate: '',
        targetCampaign: '',
        targetEmailTemplate: ''
      });
      setFields([]);
    }
  }, [survey]);

  // Debug fields state changes
  useEffect(() => {
    console.log('=== FIELDS STATE CHANGED ===');
    console.log('New fields state:', fields);
    console.log('Fields length:', fields.length);
    console.log('Fields type:', typeof fields);
    console.log('Fields is array:', Array.isArray(fields));
  }, [fields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMITTED - MANUAL SAVE ===');
    console.log('Save call count before:', saveCallCount);
    setSaveCallCount(prev => prev + 1);
    console.log('Current form data:', formData);
    console.log('Current fields:', fields);
    
    // Convert SurveyField back to SurveyQuestion format
    const questions = fields.map(field => ({
      _id: field.id,
      type: field.type,
      question: field.label,
      required: field.required,
      order: field.order,
      options: field.options,
      placeholder: field.placeholder,
      validation: field.validation
    }));

    const surveyData = {
      ...formData,
      questions: questions.filter(q => q.question.trim() !== ''),
      // Preserve original survey data for editing
      ...(survey && {
        _id: survey._id,
        createdAt: survey.createdAt,
        createdBy: survey.createdBy,
        responses: survey.responses || [],
        metadata: survey.metadata || {}
      })
    };
    
    console.log('MANUAL SAVE - Calling onSave with data:', surveyData);
    
    // Only call onSave when form is actually submitted
    onSave(surveyData);
  };

  const handleFieldUpdate = (field: SurveyField) => {
    // Optional: Handle field-specific updates
    console.log('Field updated:', field);
  };

  // Debug: Log fields changes
  useEffect(() => {
    console.log('=== FIELDS STATE UPDATED ===');
    console.log('Current fields:', fields);
    console.log('Fields length:', fields.length);
    console.log('Fields array type:', Array.isArray(fields));
    
    // Log each field details
    fields.forEach((field, index) => {
      console.log(`Field ${index}:`, {
        id: field.id,
        type: field.type,
        label: field.label,
        hasOptions: field.options && field.options.length > 0
      });
    });
  }, [fields]);

  // Safety check to prevent errors - allow both null and undefined for new surveys
  if (survey === undefined) {
    console.log('❌ Survey prop is undefined, treating as new survey');
    // Don't return early, just log and continue
  }
  
  // Allow null survey for new surveys - this is expected behavior
  if (survey === null) {
    console.log('✅ Survey prop is null - creating new survey (this is expected)');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  console.log('Back button clicked');
                  if (onCancel) {
                    onCancel();
                  } else {
                    window.location.hash = '#surveyForms';
                  }
                }}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Surveys</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {survey ? 'Edit Survey' : 'Create Survey'}
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Back button clicked');
                    if (onCancel) {
                      onCancel();
                    } else {
                      window.location.hash = '#surveyForms';
                    }
                  }}
                  className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <span className="font-medium">Cancel</span>
                </button>
                
                {/* View Form Button */}
                {fields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowFormPreview(!showFormPreview)}
                    className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C2.458 12 2 12.458 2 13s.458 1 1 1 1 .458 1 1-.458 1-1-.458-1-1z" />
                    </svg>
                    <span className="font-medium">{showFormPreview ? 'Hide Form' : 'View Form'}</span>
                  </button>
                )}
                
                {/* Save Button */}
                <button
                  type="button"
                  onClick={() => document.getElementById('survey-form-submit')?.click()}
                  disabled={isLoading || !formData.title?.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3v6" />
                  </svg>
                  <span className="font-medium">{isLoading ? 'Saving...' : 'Save Survey'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Survey Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Basic Survey Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Survey Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter survey title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Survey Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Campaign (optional)
                </label>
                <input
                  type="text"
                  name="targetCampaign"
                  value={formData.targetCampaign}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Email Template (optional)
                </label>
                <input
                  type="text"
                  name="targetEmailTemplate"
                  value={formData.targetEmailTemplate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email template name"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter survey description"
              />
            </div>
          </div>

          {/* Survey Builder */}
          <SurveyBuilder
            fields={fields}
            onChange={setFields}
            onFieldUpdate={handleFieldUpdate}
          />
          
          {/* Hidden Submit Button for Header Save Button */}
          <button
            id="survey-form-submit"
            type="submit"
            className="hidden"
            disabled={isLoading || !formData.title.trim()}
          >
            Submit
          </button>
        </form>
          
          {/* Form Preview */}
          {showFormPreview && fields.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Survey Form Preview</h3>
                  <button
                    type="button"
                    onClick={() => setShowFormPreview(false)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-slate-600">This is how users will see your survey form:</p>
              </div>
              
              <div className="p-6">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="font-medium text-slate-900">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{field.type}</span>
                          </div>
                          
                          {/* Render Actual Form Fields */}
                          <div className="mt-3">
                            {field.type === 'text' && (
                              <input
                                type="text"
                                placeholder={field.placeholder || 'Enter your answer'}
                                required={field.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                            
                            {field.type === 'email' && (
                              <input
                                type="email"
                                placeholder={field.placeholder || 'Enter your email'}
                                required={field.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                            
                            {field.type === 'textarea' && (
                              <textarea
                                placeholder={field.placeholder || 'Enter your answer'}
                                required={field.required}
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                            
                            {field.type === 'radio' && field.options && field.options.length > 0 && (
                              <div className="space-y-2">
                                {field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`preview_field_${field.id}`}
                                      value={option}
                                      required={field.required}
                                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                    />
                                    <label className="text-slate-700">{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {field.type === 'checkbox' && field.options && field.options.length > 0 && (
                              <div className="space-y-2">
                                {field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      value={option}
                                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="text-slate-700">{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {field.type === 'dropdown' && field.options && field.options.length > 0 && (
                              <select
                                required={field.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select an option</option>
                                {field.options.map((option, optionIndex) => (
                                  <option key={optionIndex} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Form Actions */}
                  <div className="mt-8 flex justify-center">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Survey
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default SurveyForm;

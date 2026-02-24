import React, { useState } from 'react';
import SurveyForm from '../components/SurveyForm';
import SurveyDatabaseService from '../services/surveyDatabase';
import type { Survey } from '../types/survey.types';
import type { ViewKey } from '../App';
import { ArrowLeft, Save, Edit, Eye, Check, X, Upload } from 'lucide-react';

interface SurveyFormPageProps {
  surveyId?: string;
  emailId?: string;
  recipientEmail?: string;
  onNavigate?: (view: ViewKey) => void;
}

const SurveyFormPage: React.FC<SurveyFormPageProps> = ({ 
  surveyId, 
  emailId, 
  recipientEmail, 
  onNavigate 
}) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load survey data on component mount
  React.useEffect(() => {
    console.log('=== SURVEY FORM PAGE MOUNT ===');
    
    // Set loading to false immediately to prevent stuck loading
    setLoading(false);
    
    // Check for editing or viewing survey data
    const editingSurveyData = localStorage.getItem('editingSurveyData');
    const viewingSurveyData = localStorage.getItem('viewingSurveyData');
    
    console.log('Checking localStorage...');
    console.log('editingSurveyData:', editingSurveyData);
    console.log('viewingSurveyData:', viewingSurveyData);
    
    // Load survey data
    let surveyData = null;
    let isViewingMode = false;
    
    if (editingSurveyData && editingSurveyData !== 'null' && editingSurveyData !== 'undefined') {
      try {
        surveyData = JSON.parse(editingSurveyData);
        console.log('✅ Editing survey loaded:', surveyData);
        // Don't remove localStorage immediately - let SurveyForm handle it
      } catch (error) {
        console.error('❌ Error parsing editing data:', error);
        localStorage.removeItem('editingSurveyData');
        localStorage.removeItem('editingSurveyId');
      }
    } else if (viewingSurveyData && viewingSurveyData !== 'null' && viewingSurveyData !== 'undefined') {
      try {
        surveyData = JSON.parse(viewingSurveyData);
        isViewingMode = true;
        console.log('✅ Viewing survey loaded:', surveyData);
        // Don't remove localStorage immediately - let SurveyForm handle it
      } catch (error) {
        console.error('❌ Error parsing viewing data:', error);
        localStorage.removeItem('viewingSurveyData');
        localStorage.removeItem('viewingSurveyId');
      }
    } else {
      console.log('🆕 No existing survey data found - creating new survey');
      // This is a new survey creation, ensure survey is null
      surveyData = null;
    }
    
    // Only set state if we have data or if current state is null
    if (surveyData || !survey) {
      console.log('Setting survey state:', surveyData);
      setSurvey(surveyData);
      setIsViewing(isViewingMode);
    }
    
    console.log('✅ Survey page loaded successfully');
  }, []);

  const handleSave = async (surveyData: Partial<Survey>) => {
    console.log('=== SURVEY FORM PAGE SAVE CALLED ===');
    console.log('Survey data received:', surveyData);
    
    setSaving(true);
    
    try {
      // Initialize database if needed
      await SurveyDatabaseService.initDatabase();
      
      // Create complete survey object with metadata
      const completeSurvey: Survey = {
        _id: surveyData._id || Date.now().toString(),
        title: surveyData.title || 'Untitled Survey',
        description: surveyData.description || '',
        category: surveyData.category || 'Feedback',
        status: surveyData.status || 'Draft',
        expiryDate: surveyData.expiryDate || '',
        targetCampaign: surveyData.targetCampaign || '',
        targetEmailTemplate: surveyData.targetEmailTemplate || '',
        questions: surveyData.questions || [],
        responses: surveyData.responses || [],
        createdAt: surveyData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: surveyData.createdBy || 'admin',
        // Add metadata for easy management
        metadata: surveyData.metadata || {
          lastModified: new Date().toISOString(),
          modifiedBy: 'admin',
          version: '1.0',
          isTemplate: false,
          usageCount: 0,
          tags: [],
          shareable: true
        }
      };
      
      console.log('Saving complete survey:', completeSurvey);
      console.log('Is this an update?', !!surveyData._id);
      console.log('Survey ID:', completeSurvey._id);
      
      // Try to save to IndexedDB first
      try {
        await SurveyDatabaseService.saveSurvey(completeSurvey);
        console.log('✅ Survey saved successfully to IndexedDB');
      } catch (dbError) {
        console.warn('⚠️ IndexedDB save failed, falling back to localStorage:', dbError);
        
        // Fallback to localStorage
        const existingSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
        const updatedSurveys = existingSurveys.filter((s: any) => s._id !== completeSurvey._id);
        updatedSurveys.push(completeSurvey);
        localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
        console.log('✅ Survey saved successfully to localStorage');
      }
      
      alert('Survey saved successfully!');
      
      // Navigate back to survey list
      if (onNavigate) {
        onNavigate('surveyTemplates');
      }
    } catch (error) {
      console.error('❌ Error saving survey:', error);
      console.error('Error details:', (error as Error).message);
      
      // Try localStorage as last resort
      try {
        const completeSurvey: Survey = {
          _id: surveyData._id || Date.now().toString(),
          title: surveyData.title || 'Untitled Survey',
          description: surveyData.description || '',
          category: surveyData.category || 'Feedback',
          status: surveyData.status || 'Draft',
          expiryDate: surveyData.expiryDate || '',
          targetCampaign: surveyData.targetCampaign || '',
          targetEmailTemplate: surveyData.targetEmailTemplate || '',
          questions: surveyData.questions || [],
          responses: [],
          createdAt: surveyData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin'
        };
        
        const existingSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
        const updatedSurveys = existingSurveys.filter((s: any) => s._id !== completeSurvey._id);
        updatedSurveys.push(completeSurvey);
        localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
        
        console.log('✅ Survey saved to localStorage as fallback');
        alert('Survey saved successfully!');
        
        if (onNavigate) {
          onNavigate('surveyTemplates');
        }
      } catch (fallbackError) {
        console.error('❌ Even localStorage fallback failed:', fallbackError);
        alert('Failed to save survey. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('=== CANCEL BUTTON CLICKED ===');
    console.log('Navigating back to previous page...');
    
    // Use the navigation function if available
    if (onNavigate) {
      console.log('Using onNavigate to go to surveyForms');
      onNavigate('surveyTemplates');
    } else {
      // Fallback to browser history if no navigation function
      if (window.history.length > 1) {
        console.log('Using browser history to go back');
        window.history.back();
      } else {
        console.log('No navigation function or history, going to surveyTemplates');
        window.location.hash = '#surveyTemplates';
      }
    }
    
    console.log('✅ Navigation completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading survey...</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Debug Info:</h3>
            <p>Editing Survey Data: {localStorage.getItem('editingSurveyData') ? 'YES' : 'NO'}</p>
            <p>Survey ID: {localStorage.getItem('editingSurveyId') || 'NONE'}</p>
            <p>Database Surveys: {JSON.parse(localStorage.getItem('surveyFormsDatabase') || '[]').length} surveys found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </div>

      {isViewing ? (
        // Survey View Mode - Interactive Form Preview
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Survey Header */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{survey?.title}</h2>
              <p className="text-slate-600 mb-4">{survey?.description}</p>
              
              {/* Survey Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Category:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{survey?.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    survey?.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    survey?.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>{survey?.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Questions:</span>
                  <span>{survey?.questions?.length || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Actual Survey Form */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Survey Form Preview</h3>
                
                {/* Edit Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isEditMode ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Mode
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Mode
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {survey?.questions && Array.isArray(survey.questions) && survey.questions.length > 0 ? (
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {survey.questions.map((question, index) => (
                    <div key={question._id || index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="font-medium text-slate-900">
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{question.type}</span>
                          </div>
                          
                          {/* Render Actual Form Fields */}
                          <div className="mt-3">
                            {question.type === 'text' && (
                              <input
                                type="text"
                                placeholder={question.placeholder || 'Enter your answer'}
                                required={question.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!isEditMode}
                              />
                            )}
                            
                            {question.type === 'email' && (
                              <input
                                type="email"
                                placeholder={question.placeholder || 'Enter your email'}
                                required={question.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!isEditMode}
                              />
                            )}
                            
                            {question.type === 'textarea' && (
                              <textarea
                                placeholder={question.placeholder || 'Enter your answer'}
                                required={question.required}
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!isEditMode}
                              />
                            )}
                            
                            {question.type === 'radio' && question.options && question.options.length > 0 && (
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`question_${question._id}`}
                                      value={option}
                                      required={question.required}
                                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                      disabled={!isEditMode}
                                    />
                                    <label className="text-slate-700">{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'checkbox' && question.options && question.options.length > 0 && (
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      value={option}
                                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                      disabled={!isEditMode}
                                    />
                                    <label className="text-slate-700">{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'dropdown' && question.options && question.options.length > 0 && (
                              <select
                                required={question.required}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!isEditMode}
                              >
                                <option value="">Select an option</option>
                                {question.options.map((option, optionIndex) => (
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
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled
                    >
                      Submit Survey
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-lg">No questions added to this survey yet.</div>
                  <div className="text-slate-400 text-sm mt-2">
                    {survey ? 'Survey exists but has no questions.' : 'No survey data available.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Survey Edit/Create Mode
        <SurveyForm
          survey={survey || null}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={saving}
        />
      )}
    </div>
  );
};

export default SurveyFormPage;

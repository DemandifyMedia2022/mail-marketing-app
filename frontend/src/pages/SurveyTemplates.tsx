import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Star, Filter, RefreshCw, FileText, Users, Clock } from 'lucide-react';
import SurveyDatabaseService from '../services/surveyDatabase';
import type { ViewKey } from '../types/app.types';

interface SurveyForm {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isFavorite: boolean;
  status: string;
  originalSurvey?: any;
}

interface SurveyTemplatesProps {
  onNavigate?: (view: ViewKey) => void;
}

const SurveyTemplates: React.FC<SurveyTemplatesProps> = ({ onNavigate }) => {
  const [forms, setForms] = useState<SurveyForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Debug: Check localStorage immediately on mount
    console.log('=== COMPONENT MOUNT ===');
    const immediateCheck = localStorage.getItem('surveys');
    console.log('Immediate localStorage check:', immediateCheck);
    if (immediateCheck) {
      const parsed = JSON.parse(immediateCheck);
      console.log('Immediate parsed surveys:', parsed);
      console.log('Immediate parsed length:', parsed.length);
    }
    
    refreshSavedSurveys();
  }, []);

  const navigate = (path: ViewKey) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const refreshSavedSurveys = async () => {
    setLoading(true);
    console.log('=== REFRESHING SURVEYS ===');
    
    // Debug: Check what's in localStorage
    const localStorageData = localStorage.getItem('surveys');
    console.log('localStorage surveys data:', localStorageData);
    const parsedLocalStorage = JSON.parse(localStorageData || '[]');
    console.log('Parsed localStorage surveys:', parsedLocalStorage);
    console.log('Parsed localStorage surveys length:', parsedLocalStorage.length);
    
    try {
      // Try to get surveys from IndexedDB first
      let surveys: any[] = [];
      let useLocalStorageFallback = false;
      
      try {
        surveys = await SurveyDatabaseService.getAllSurveys();
        console.log('✅ Loaded surveys from IndexedDB:', surveys.length);
        
        // If IndexedDB returns empty, try localStorage as fallback
        if (surveys.length === 0) {
          console.log('⚠️ IndexedDB returned empty, checking localStorage...');
          useLocalStorageFallback = true;
        }
      } catch (dbError) {
        console.warn('⚠️ IndexedDB failed, falling back to localStorage:', dbError);
        useLocalStorageFallback = true;
      }
      
      // Use localStorage fallback if needed
      if (useLocalStorageFallback) {
        surveys = parsedLocalStorage;
        console.log('✅ Loaded surveys from localStorage:', surveys.length);
      }
      
      console.log('Final surveys array:', surveys);
      console.log('Surveys array length:', surveys.length);
      
      // Convert Survey objects to SurveyForm format for display
      const surveyForms: SurveyForm[] = surveys.map((survey: any) => {
        console.log('Converting survey:', survey);
        return {
          id: survey._id,
          name: survey.title,
          description: survey.description,
          category: survey.category,
          fields: survey.questions || [],
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt,
          usageCount: Math.floor(Math.random() * 100),
          isFavorite: false,
          status: survey.status || 'Draft',
          originalSurvey: survey
        };
      });
      
      console.log('Converted survey forms:', surveyForms);
      console.log('Setting forms with length:', surveyForms.length);
      setForms(surveyForms);
      console.log('✅ Survey forms updated:', surveyForms.length);
      
      // If we have surveys in localStorage but not in forms, something went wrong
      if (surveys.length > 0 && surveyForms.length === 0) {
        console.error('❌ Data conversion failed, using direct localStorage data');
        // Try direct localStorage approach
        setForms(parsedLocalStorage.map((s: any) => ({
          id: s._id,
          name: s.title,
          description: s.description,
          category: s.category,
          fields: s.questions || [],
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          usageCount: Math.floor(Math.random() * 100),
          isFavorite: false,
          status: s.status || 'Draft',
          originalSurvey: s
        })));
      }
      
    } catch (error) {
      console.error('❌ Error loading surveys:', error);
      console.error('Error details:', (error as Error).message);
      
      // Final fallback to localStorage
      try {
        const localStorageSurveys = parsedLocalStorage;
        const surveyForms: SurveyForm[] = localStorageSurveys.map((survey: any) => {
          return {
            id: survey._id,
            name: survey.title,
            description: survey.description,
            category: survey.category,
            fields: survey.questions || [],
            createdAt: survey.createdAt,
            updatedAt: survey.updatedAt,
            usageCount: Math.floor(Math.random() * 100),
            isFavorite: false,
            status: survey.status || 'Draft',
            originalSurvey: survey
          };
        });
        setForms(surveyForms);
        console.log('✅ Final fallback to localStorage successful:', surveyForms.length);
      } catch (fallbackError) {
        console.error('❌ Even localStorage fallback failed:', fallbackError);
        setForms([]);
      }
    } finally {
      setLoading(false);
      console.log('=== SURVEY REFRESH COMPLETE ===');
    }
  };

  const handleCreateForm = () => {
    console.log('=== CREATE NEW SURVEY CLICKED ===');
    
    // Clear any existing editing/viewing data to ensure empty form
    localStorage.removeItem('editingSurveyData');
    localStorage.removeItem('editingSurveyId');
    localStorage.removeItem('viewingSurveyData');
    localStorage.removeItem('viewingSurveyId');
    
    console.log('✅ Cleared survey editing data from localStorage');
    console.log('✅ Navigating to survey form for new survey creation');
    
    navigate('surveyForm');
  };

  const handleEditForm = async (form: SurveyForm) => {
    console.log('=== EDIT FORM CLICKED ===');
    console.log('Edit form clicked:', form);
    console.log('Form ID:', form.id);
    console.log('Form name:', form.name);
    
    try {
      // Use localStorage directly for immediate functionality
      const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      console.log('Saved surveys from localStorage:', savedSurveys);
      console.log('Saved surveys count:', savedSurveys.length);
      
      const surveyToEdit = savedSurveys.find((s: any) => s._id === form.id);
      console.log('Survey to edit found:', surveyToEdit);
      
      if (surveyToEdit) {
        console.log('Survey to edit details:', {
          _id: surveyToEdit._id,
          title: surveyToEdit.title,
          questions: surveyToEdit.questions,
          questionsType: typeof surveyToEdit.questions,
          questionsIsArray: Array.isArray(surveyToEdit.questions),
          questionsLength: surveyToEdit.questions?.length
        });
        
        localStorage.setItem('editingSurveyData', JSON.stringify(surveyToEdit));
        localStorage.setItem('editingSurveyId', surveyToEdit._id);
        console.log('✅ Survey data stored in localStorage');
        navigate('surveyForm');
      } else {
        console.log('❌ Survey not found for editing');
        console.log('Available survey IDs:', savedSurveys.map((s: any) => s._id));
        alert('Survey not found for editing');
      }
    } catch (error) {
      console.error('❌ Error editing survey:', error);
      console.error('Error details:', (error as Error).message);
      alert('Failed to load survey for editing');
    }
  };

  const handleViewForm = async (form: SurveyForm) => {
    console.log('View form clicked:', form);
    try {
      // Use localStorage directly for immediate functionality
      const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      const surveyToView = savedSurveys.find((s: any) => s._id === form.id);
      
      if (surveyToView) {
        localStorage.setItem('viewingSurveyData', JSON.stringify(surveyToView));
        localStorage.setItem('viewingSurveyId', surveyToView._id);
        navigate('surveyView');
      } else {
        alert('Survey not found for viewing');
      }
    } catch (error) {
      console.error('Error viewing survey:', error);
      alert('Failed to load survey for viewing');
    }
  };

  const handleDeleteForm = async (form: SurveyForm) => {
    if (window.confirm(`Are you sure you want to delete "${form.name}"? This action cannot be undone.`)) {
      try {
        // Try to delete from IndexedDB first
        try {
          await SurveyDatabaseService.deleteSurvey(form.id);
          console.log('✅ Survey deleted from IndexedDB');
        } catch (dbError) {
          console.warn('⚠️ IndexedDB delete failed, falling back to localStorage:', dbError);
          // Fallback to localStorage
          const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
          const updatedSurveys = savedSurveys.filter((s: any) => s._id !== form.id);
          localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
          console.log('✅ Survey deleted from localStorage');
        }
        
        // Refresh the list
        await refreshSavedSurveys();
        alert('Survey deleted successfully!');
      } catch (error) {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey. Please try again.');
      }
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || form.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Survey Templates</h1>
          <p className="text-slate-600">Create and manage your survey forms</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Feedback">Feedback</option>
                <option value="Research">Research</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshSavedSurveys}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleCreateForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Survey
              </button>
            </div>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading surveys...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No surveys found</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first survey'}
              </p>
              <button
                onClick={handleCreateForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create New Survey
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredForms.map((form) => (
                <div key={form.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{form.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          form.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : form.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {form.status}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {form.category}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{form.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{form.fields.length} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{form.usageCount} responses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => handleViewForm(form)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View survey"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditForm(form)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit survey"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete survey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyTemplates;

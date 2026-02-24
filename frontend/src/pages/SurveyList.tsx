import React, { useState, useEffect } from 'react';
import type { Survey } from '../types/survey.types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Search,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const SurveyList: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const navigate = (path: string) => {
    // Simple navigation - in real app, use React Router
    console.log('Navigate to:', path);
  };

  // Mock data - replace with API call
  useEffect(() => {
    const mockSurveys: Survey[] = [
      {
        _id: '1',
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve our services by sharing your feedback',
        category: 'Feedback',
        status: 'Active',
        expiryDate: '2024-12-31',
        targetCampaign: 'Welcome Campaign',
        targetEmailTemplate: 'Feedback Template',
        questions: [],
        responses: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        _id: '2',
        title: 'Product Feature Request',
        description: 'Tell us what features you would like to see',
        category: 'Product',
        status: 'Draft',
        expiryDate: '2024-11-30',
        questions: [],
        responses: [],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        createdBy: 'admin'
      },
      {
        _id: '3',
        title: 'Employee Engagement Survey',
        description: 'Annual employee satisfaction and engagement survey',
        category: 'HR',
        status: 'Inactive',
        expiryDate: '2024-10-31',
        questions: [],
        responses: [],
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z',
        createdBy: 'admin'
      }
    ];
    
    setTimeout(() => {
      setSurveys(mockSurveys);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || survey.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryColor = (category: Survey['category']) => {
    switch (category) {
      case 'Feedback':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lead':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Product':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Support':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HR':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDelete = async (surveyId: string) => {
    // API call to delete survey
    setSurveys(prev => prev.filter(s => s._id !== surveyId));
    setShowDeleteModal(null);
  };

  const handleDuplicate = (survey: Survey) => {
    const newSurvey = {
      ...survey,
      _id: Date.now().toString(),
      title: `${survey.title} (Copy)`,
      status: 'Draft' as Survey['status'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSurveys(prev => [newSurvey, ...prev]);
  };

  const getSurveyStats = (survey: Survey) => {
    const totalResponses = survey.responses.length;
    const completionRate = survey.questions.length > 0 
      ? Math.round((totalResponses / survey.questions.length) * 100) 
      : 0;
    
    return { totalResponses, completionRate };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Survey Manager</h1>
            </div>
            <button
              onClick={() => navigate('/surveys/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Survey</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Feedback">Feedback</option>
                <option value="Lead">Lead</option>
                <option value="Product">Product</option>
                <option value="Support">Support</option>
                <option value="HR">HR</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Survey Grid */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first survey'
              }
            </p>
            <button
              onClick={() => navigate('/surveys/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Survey</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => {
              const stats = getSurveyStats(survey);
              return (
                <div key={survey._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                          {survey.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {survey.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(survey.category)}`}>
                        {survey.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          {stats.totalResponses}
                        </div>
                        <div className="text-xs text-slate-600">Responses</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          {stats.completionRate}%
                        </div>
                        <div className="text-xs text-slate-600">Completion</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          {survey.questions.length}
                        </div>
                        <div className="text-xs text-slate-600">Questions</div>
                      </div>
                    </div>

                    {survey.expiryDate && (
                      <div className="text-xs text-slate-500 mb-4">
                        Expires: {new Date(survey.expiryDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/surveys/${survey._id}/edit`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      
                      <button
                        onClick={() => navigate(`/surveys/${survey._id}/analytics`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Analytics</span>
                      </button>
                      
                      <button
                        onClick={() => handleDuplicate(survey)}
                        className="flex items-center justify-center px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Duplicate Survey"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteModal(survey._id)}
                        className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Survey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Delete Survey
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this survey? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyList;

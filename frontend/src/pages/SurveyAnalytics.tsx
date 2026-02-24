import React, { useState, useEffect } from 'react';
import type { Survey, SurveyAnalytics } from '../types/survey.types';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  Download,
  CheckCircle
} from 'lucide-react';

const SurveyAnalytics: React.FC = () => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data - replace with API call
  useEffect(() => {
    const mockSurvey: Survey = {
      _id: '1',
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our services by sharing your feedback',
      category: 'Feedback',
      status: 'Active',
      expiryDate: '2024-12-31',
      targetCampaign: 'Welcome Campaign',
      targetEmailTemplate: 'Feedback Template',
      questions: [
        {
          _id: 'q1',
          type: 'rating',
          question: 'How satisfied are you with our service?',
          required: true,
          order: 0
        },
        {
          _id: 'q2',
          type: 'checkbox',
          question: 'What features do you use most?',
          options: ['Email Campaigns', 'Analytics', 'Templates', 'Automation'],
          required: true,
          order: 1
        }
      ],
      responses: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin'
    };

    const mockAnalytics: SurveyAnalytics = {
      surveyId: '1',
      totalResponses: 245,
      completionRate: 78,
      averageTime: 4.5,
      responsesByDate: [
        { date: '2024-01-15', count: 45 },
        { date: '2024-01-16', count: 38 },
        { date: '2024-01-17', count: 52 },
        { date: '2024-01-18', count: 41 },
        { date: '2024-01-19', count: 35 },
        { date: '2024-01-20', count: 34 }
      ],
      questionAnalytics: [
        {
          questionId: 'q1',
          question: 'How satisfied are you with our service?',
          type: 'rating',
          responses: [
            { answer: '5', count: 89, percentage: 36.3 },
            { answer: '4', count: 76, percentage: 31.0 },
            { answer: '3', count: 45, percentage: 18.4 },
            { answer: '2', count: 23, percentage: 9.4 },
            { answer: '1', count: 12, percentage: 4.9 }
          ]
        },
        {
          questionId: 'q2',
          question: 'What features do you use most?',
          type: 'multiple',
          responses: [
            { answer: 'Email Campaigns', count: 189, percentage: 77.1 },
            { answer: 'Analytics', count: 156, percentage: 63.7 },
            { answer: 'Templates', count: 134, percentage: 54.7 },
            { answer: 'Automation', count: 98, percentage: 40.0 }
          ]
        }
      ]
    };

    setTimeout(() => {
      setSurvey(mockSurvey);
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, []);

  const exportData = () => {
    // Export functionality
    console.log('Export survey data');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!survey || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Survey not found</h3>
          <p className="text-slate-600">The survey you're looking for doesn't exist.</p>
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
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Surveys</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{survey.title}</h1>
                  <p className="text-sm text-slate-600">Survey Analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">+12.5%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.totalResponses.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Responses</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">+5.2%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.completionRate}%
            </div>
            <div className="text-sm text-slate-600">Completion Rate</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">-8.3%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.averageTime}m
            </div>
            <div className="text-sm text-slate-600">Avg. Time</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-amber-600">+18.7%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {Math.round(analytics.totalResponses * (analytics.completionRate / 100)).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </div>

        {/* Response Timeline Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Response Timeline</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.responsesByDate.map((data) => {
              const maxValue = Math.max(...analytics.responsesByDate.map(d => d.count));
              const height = (data.count / maxValue) * 100;
              return (
                <div key={data.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${data.date}: ${data.count} responses`}
                  ></div>
                  <div className="text-xs text-slate-600 mt-2 text-center">
                    {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Question Breakdown</h2>
          <div className="space-y-8">
            {analytics.questionAnalytics.map((question) => (
              <div key={question.questionId} className="border-b border-slate-200 pb-6 last:border-0">
                <h3 className="font-medium text-slate-900 mb-4">{question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {question.responses.map((response, responseIndex) => (
                    <div key={responseIndex} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            {response.answer}
                          </span>
                          <span className="text-sm text-slate-600">
                            {response.count} ({response.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${response.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;

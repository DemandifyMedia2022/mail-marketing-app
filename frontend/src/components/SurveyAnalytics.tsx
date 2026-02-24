import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SurveyAnalyticsProps {
  surveyId: string;
}

interface QuestionAnalytics {
  question: string;
  type: string;
  totalResponses: number;
  data: any;
}

interface AnalyticsData {
  survey: {
    title: string;
    description: string;
    totalQuestions: number;
  };
  totalResponses: number;
  questionAnalytics: QuestionAnalytics[];
}

const SurveyAnalytics: React.FC<SurveyAnalyticsProps> = ({ surveyId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (surveyId) {
      fetchAnalytics();
    }
  }, [surveyId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/surveys/${surveyId}/analytics`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionAnalytics = (questionAnalytics: QuestionAnalytics) => {
    const { question, type, totalResponses, data } = questionAnalytics;

    switch (type) {
      case 'radio':
      case 'dropdown':
        return (
          <div>
            <h4>{question}</h4>
            <div style={{ marginTop: '10px' }}>
              {Object.entries(data).map(([option, count]) => (
                <div key={option} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{option}</span>
                    <span>{String(count)} ({totalResponses > 0 ? ((Number(count) / totalResponses) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      backgroundColor: '#3b82f6',
                      height: '100%',
                      width: `${totalResponses > 0 ? (Number(count) / totalResponses) * 100 : 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <h4>{question}</h4>
            <div style={{ marginTop: '10px' }}>
              {Object.entries(data).map(([option, count]) => (
                <div key={option} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{option}</span>
                    <span>{String(count)} selections</span>
                  </div>
                  <div style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      backgroundColor: '#10b981',
                      height: '100%',
                      width: `${totalResponses > 0 ? (Number(count) / totalResponses) * 100 : 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div>
            <h4>{question}</h4>
            {data.average && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Average Rating:</strong> {String(data.average)} / 5
              </div>
            )}
            {data.distribution && (
              <div>
                {Object.entries(data.distribution).map(([rating, count]) => (
                  <div key={rating} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{rating} ⭐</span>
                      <span>{String(count)} ({totalResponses > 0 ? ((Number(count) / totalResponses) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div style={{
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: '#fbbf24',
                        height: '100%',
                        width: `${totalResponses > 0 ? (Number(count) / totalResponses) * 100 : 0}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'yesno':
        return (
          <div>
            <h4>{question}</h4>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <strong>Yes</strong>
                </div>
                <div style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {String(data.yes)}
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', color: '#6b7280' }}>
                  {totalResponses > 0 ? ((Number(data.yes) / totalResponses) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <strong>No</strong>
                </div>
                <div style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {String(data.no)}
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', color: '#6b7280' }}>
                  {totalResponses > 0 ? ((Number(data.no) / totalResponses) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <h4>{question}</h4>
            <div style={{ marginTop: '10px' }}>
              {data.responses && data.responses.length > 0 ? (
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '15px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {data.responses.map((response: string, index: number) => (
                    <div key={index} style={{
                      marginBottom: '8px',
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {response}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No responses yet</div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type: {type}</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '15px',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No analytics data available
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#1f2937' }}>
          {analytics.survey.title}
        </h2>
        {analytics.survey.description && (
          <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
            {analytics.survey.description}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {analytics.totalResponses}
            </div>
            <div style={{ color: '#6b7280' }}>Total Responses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {analytics.survey.totalQuestions}
            </div>
            <div style={{ color: '#6b7280' }}>Questions</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {analytics.questionAnalytics.map((questionAnalytics, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            {renderQuestionAnalytics(questionAnalytics)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyAnalytics;

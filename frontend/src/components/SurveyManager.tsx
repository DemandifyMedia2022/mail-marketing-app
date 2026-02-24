import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Question {
  _id: string;
  question: string;
  type: 'text' | 'radio' | 'checkbox' | 'dropdown' | 'rating' | 'yesno';
  options: string[];
  required: boolean;
  order: number;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SurveyFormData {
  title: string;
  description: string;
  questions: Question[];
}

const SurveyManager: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/surveys');
      if (response.data.success) {
        setSurveys(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      _id: Date.now().toString(),
      question: '',
      type: 'text',
      options: [],
      required: false,
      order: currentSurvey.questions.length
    };
    setCurrentSurvey({
      ...currentSurvey,
      questions: [...currentSurvey.questions, newQuestion]
    });
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[questionIndex].options.push('');
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = currentSurvey.questions.filter((_, i) => i !== index);
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSurvey.title || currentSurvey.questions.length === 0) {
      setError('Title and at least one question are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/surveys', currentSurvey);
      
      if (response.data.success) {
        setSuccess('Survey created successfully!');
        setCurrentSurvey({ title: '', description: '', questions: [] });
        setShowForm(false);
        fetchSurveys();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const editSurvey = (survey: Survey) => {
    setEditingSurvey(survey);
    setCurrentSurvey({
      title: survey.title,
      description: survey.description,
      questions: survey.questions
    });
    setShowForm(true);
  };

  const generateSurveyLink = (surveyId: string, emailId: string) => {
    return `http://localhost:5000/api/emails/survey/${surveyId}/${emailId}`;
  };

  const renderQuestionForm = (question: Question, index: number) => {
    return (
      <div key={question._id} style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, color: '#1f2937' }}>Question {index + 1}</h4>
          <button
            type="button"
            onClick={() => removeQuestion(index)}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            Remove
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Question Text:</label>
          <input
            type="text"
            value={question.question}
            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your question"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Question Type:</label>
          <select
            value={question.type}
            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="text">Text</option>
            <option value="radio">Multiple Choice (Single)</option>
            <option value="checkbox">Multiple Choice (Multiple)</option>
            <option value="dropdown">Dropdown</option>
            <option value="rating">Rating (1-5)</option>
            <option value="yesno">Yes/No</option>
          </select>
        </div>

        {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Options:</label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index, optionIndex)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(index)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Add Option
            </button>
          </div>
        )}

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
            />
            <span style={{ fontWeight: '500' }}>Required</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1f2937' }}>Survey Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancel' : 'Create New Survey'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>
            {editingSurvey ? 'Edit Survey' : 'Create New Survey'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Survey Title:</label>
              <input
                type="text"
                value={currentSurvey.title}
                onChange={(e) => setCurrentSurvey({ ...currentSurvey, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter survey title"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description:</label>
              <textarea
                value={currentSurvey.description}
                onChange={(e) => setCurrentSurvey({ ...currentSurvey, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter survey description (optional)"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Add Question
                </button>
              </div>

              {currentSurvey.questions.map((question, index) => renderQuestionForm(question, index))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Creating...' : (editingSurvey ? 'Update Survey' : 'Create Survey')}
              </button>
              
              {editingSurvey && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSurvey(null);
                    setCurrentSurvey({ title: '', description: '', questions: [] });
                    setShowForm(false);
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Existing Surveys</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading surveys...
          </div>
        ) : surveys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No surveys found. Create your first survey!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {surveys.map((survey) => (
              <div key={survey._id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{survey.title}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#6b7280' }}>{survey.description}</p>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <span>{survey.questions.length} questions</span> • 
                      <span> Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => editSurvey(survey)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateSurveyLink(survey._id, 'EMAIL_ID_HERE'));
                        alert('Survey link copied! Replace EMAIL_ID_HERE with actual email ID.');
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyManager;

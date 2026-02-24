// Add test surveys to localStorage for testing SurveyTemplates
const testSurveys = [
  {
    _id: 'test-survey-1',
    title: 'Customer Feedback Survey',
    description: 'Collect customer feedback about our products and services',
    category: 'Feedback',
    status: 'Draft',
    questions: [
      {
        _id: 'q1',
        type: 'text',
        label: 'What is your name?',
        required: true
      },
      {
        _id: 'q2',
        type: 'rating',
        label: 'How would you rate our service?',
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'test-survey-2',
    title: 'Employee Satisfaction Survey',
    description: 'Measure employee satisfaction and engagement',
    category: 'HR',
    status: 'Active',
    questions: [
      {
        _id: 'q1',
        type: 'text',
        label: 'Department',
        required: true
      },
      {
        _id: 'q2',
        type: 'dropdown',
        label: 'Years with company',
        required: true,
        options: ['< 1 year', '1-3 years', '3-5 years', '5+ years']
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Save to localStorage
localStorage.setItem('surveys', JSON.stringify(testSurveys));
console.log('Test surveys added to localStorage!');
console.log('Current surveys:', JSON.parse(localStorage.getItem('surveys') || '[]'));

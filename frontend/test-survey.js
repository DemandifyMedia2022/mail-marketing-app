// Test survey data
const testSurvey = {
  _id: "test-survey-1",
  title: "Customer Feedback Survey",
  description: "Collect customer feedback about our services",
  category: "Feedback",
  status: "Draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      _id: "q1",
      type: "text",
      question: "What is your name?",
      required: true,
      order: 1,
      placeholder: "Enter your name"
    },
    {
      _id: "q2",
      type: "radio",
      question: "How satisfied are you with our service?",
      required: true,
      order: 2,
      options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very Unsatisfied"]
    },
    {
      _id: "q3",
      type: "checkbox",
      question: "Which services have you used?",
      required: false,
      order: 3,
      options: ["Customer Support", "Product Development", "Sales", "Marketing"]
    }
  ]
};

// Save to localStorage
localStorage.setItem('surveyFormsDatabase', JSON.stringify([testSurvey]));
console.log('Test survey created:', testSurvey);
console.log('Current localStorage:', localStorage.getItem('surveyFormsDatabase'));

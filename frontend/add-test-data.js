// Add test survey data to localStorage
const testSurveys = [
  {
    _id: "survey-1",
    title: "Customer Satisfaction Survey",
    description: "Collect feedback from customers about our services",
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
  },
  {
    _id: "survey-2",
    title: "Product Feedback Survey",
    description: "Get feedback on our new product features",
    category: "Product",
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        _id: "q1",
        type: "text",
        question: "What products do you use?",
        required: true,
        order: 1,
        placeholder: "Enter product names"
      },
      {
        _id: "q2",
        type: "dropdown",
        question: "How often do you use our products?",
        required: true,
        order: 2,
        options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
      }
    ]
  }
];

// Save to localStorage
localStorage.setItem('surveyFormsDatabase', JSON.stringify(testSurveys));
console.log('✅ Test surveys added to localStorage!');
console.log('Number of surveys:', testSurveys.length);
console.log('Survey data:', testSurveys);

// Also add one for viewing
localStorage.setItem('viewingSurveyData', JSON.stringify(testSurveys[0]));
console.log('✅ Test viewing survey set!');

console.log('=== READY FOR TESTING ===');
console.log('1. Survey Templates page should now show 2 surveys');
console.log('2. Survey Form page should load the viewing survey');
console.log('3. Click "View" or "Edit" to test functionality');

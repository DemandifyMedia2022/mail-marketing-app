// Test script to verify survey form page loading
console.log('=== TESTING SURVEY FORM PAGE LOADING ===');

// Create test survey for viewing
const testSurvey = {
  _id: "test-view-1",
  title: "Test Survey for Viewing",
  description: "This is a test survey to verify viewing functionality",
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
      question: "How satisfied are you?",
      required: true,
      order: 2,
      options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"]
    }
  ]
};

// Save test survey for viewing
localStorage.setItem('viewingSurveyData', JSON.stringify(testSurvey));
console.log('✅ Test viewing survey created');

// Create test survey for editing
const testEditSurvey = {
  _id: "test-edit-1",
  title: "Test Survey for Editing",
  description: "This is a test survey to verify editing functionality",
  category: "Feedback",
  status: "Draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      _id: "q1",
      type: "text",
      question: "Email address",
      required: true,
      order: 1,
      placeholder: "Enter your email"
    }
  ]
};

// Save test survey for editing
localStorage.setItem('editingSurveyData', JSON.stringify(testEditSurvey));
console.log('✅ Test editing survey created');

// Save to surveyFormsDatabase for templates page
localStorage.setItem('surveyFormsDatabase', JSON.stringify([testSurvey, testEditSurvey]));
console.log('✅ Test surveys saved to database');

console.log('=== READY FOR TESTING ===');
console.log('1. Navigate to survey form page - should load test survey');
console.log('2. Check console for "=== SURVEY FORM PAGE MOUNT ==="');
console.log('3. Should see survey data loaded in console');

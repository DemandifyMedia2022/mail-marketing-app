import axios from 'axios';

const testEmail = {
  to: "test@example.com",
  subject: "Test Open Tracking",
  body: "<h1>Test Email</h1><p>This is a test email to check open tracking.</p><a href='https://example.com'>Click here</a>",
  campaignName: "test-tracking"
};

axios.post('http://192.168.0.219:5000/api/emails/send', testEmail, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Email sent successfully:', response.data);
})
.catch(error => {
  console.error('Error sending email:', error.response?.data || error.message);
});

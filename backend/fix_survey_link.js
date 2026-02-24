import mongoose from "mongoose";
import Email from "./src/models/Email.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find and update the specific email with wrong survey link
    const emailId = '697af5be3be8db9f397d2220';
    const email = await Email.findById(emailId);
    
    if (email && email.body.includes('/survey?surveyId')) {
      console.log('Found email with old survey link, updating...');
      
      // Fix the survey link to point to survey.html
      const newBody = email.body.replace(
        'href="http://localhost:5173/survey?surveyId=basic-survey"',
        `href="http://localhost:5173/survey.html?surveyId=basic-survey&emailId=${email._id}&recipientEmail=${email.to}" target="_blank"`
      );
      
      await Email.updateOne(
        { _id: email._id },
        { $set: { body: newBody } }
      );
      
      console.log('✅ Survey link updated to point to survey.html');
      console.log('New link will work on localhost and local network');
    } else {
      console.log('Email not found or already has correct link');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

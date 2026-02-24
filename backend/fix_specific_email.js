import mongoose from "mongoose";
import Email from "./src/models/Email.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const emailId = '697af5be3be8db9f397d2220';
    const email = await Email.findById(emailId);
    
    if (email) {
      console.log('Found email, fixing survey link...');
      console.log('Current body:', email.body);
      
      // Replace the old survey link with the new one
      const newBody = email.body.replace(
        'href="http://localhost:5173/survey?surveyId=basic-survey"',
        `href="http://localhost:5173/survey.html?surveyId=basic-survey&emailId=${email._id}&recipientEmail=${email.to}" target="_blank"`
      );
      
      console.log('New body:', newBody);
      
      await Email.updateOne(
        { _id: email._id },
        { $set: { body: newBody } }
      );
      
      console.log('✅ Email updated successfully!');
      console.log('New survey link should now point to survey.html');
      
    } else {
      console.log('Email not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

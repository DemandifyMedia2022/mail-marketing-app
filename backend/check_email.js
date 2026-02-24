import mongoose from "mongoose";
import Email from "./src/models/Email.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const emailId = '697af5be3be8db9f397d2220';
    const email = await Email.findById(emailId);
    
    if (email) {
      console.log(`Email found:`);
      console.log(`To: ${email.to}`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Body contains survey.html: ${email.body.includes('survey.html')}`);
      console.log(`Body contains /survey?: ${email.body.includes('/survey?')}`);
      
      if (email.body.includes('survey')) {
        const surveyMatch = email.body.match(/href="([^"]*survey[^"]*)"/);
        if (surveyMatch) {
          console.log(`Survey URL: ${surveyMatch[1]}`);
        }
      }
      
      console.log('\nFull body:');
      console.log(email.body);
    } else {
      console.log('Email not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

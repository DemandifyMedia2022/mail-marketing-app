import mongoose from "mongoose";
import Email from "./src/models/Email.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find emails with old survey links
    const emails = await Email.find({
      body: { $regex: '/survey\?surveyId' }
    });
    
    console.log(`Found ${emails.length} emails with old survey links`);
    
    for (const email of emails) {
      console.log(`\nUpdating email: ${email.to}`);
      console.log(`Old body contains survey: ${email.body.includes('/survey?surveyId')}`);
      
      // Replace old survey links with new ones
      const newBody = email.body.replace(
        /href="http:\/\/localhost:5173\/survey\?surveyId=([^"]*)"/g,
        'href="http://localhost:5173/survey.html?surveyId=$1&emailId=' + email._id + '&recipientEmail=' + email.to + '" target="_blank"'
      );
      
      if (newBody !== email.body) {
        await Email.updateOne(
          { _id: email._id },
          { $set: { body: newBody } }
        );
        console.log('✅ Updated email body');
      } else {
        console.log('ℹ️ No changes needed');
      }
    }
    
    console.log('\n✅ Survey links fixed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

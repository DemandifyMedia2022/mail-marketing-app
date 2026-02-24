import mongoose from "mongoose";
import Email from "./src/models/Email.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check recent emails for tracking pixel
    const emails = await Email.find({})
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`\nChecking ${emails.length} recent emails for tracking:\n`);
    
    emails.forEach((email, index) => {
      console.log(`${index + 1}. Email: ${email.to}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Has tracking pixel: ${email.body.includes('track/open')}`);
      console.log(`   Has tracking code: ${!!email.trackingCode}`);
      console.log(`   Status: ${email.status}`);
      console.log(`   Open count: ${email.openCount || 0}`);
      console.log(`   Click count: ${email.clickCount || 0}`);
      
      if (email.body.includes('track/open')) {
        const pixelMatch = email.body.match(/src="([^"]*track\/open[^"]*)"/);
        if (pixelMatch) {
          console.log(`   Tracking URL: ${pixelMatch[1]}`);
        }
      }
      
      console.log('---');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

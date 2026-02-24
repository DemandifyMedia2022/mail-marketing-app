import mongoose from "mongoose";
import Template from "./src/models/Template.js";

mongoose.connect('mongodb://localhost:27017/mail_marketing')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const templates = await Template.find({}).limit(5);
    console.log('\nRecent templates:');
    
    templates.forEach((t, index) => {
      console.log(`\n${index + 1}. Template: ${t.name}`);
      console.log(`   Has survey.html: ${t.body.includes('survey.html')}`);
      console.log(`   Has /survey?: ${t.body.includes('/survey?')}`);
      
      if (t.body.includes('survey')) {
        const surveyMatch = t.body.match(/href="([^"]*survey[^"]*)"/);
        if (surveyMatch) {
          console.log(`   Survey URL: ${surveyMatch[1]}`);
        }
      }
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

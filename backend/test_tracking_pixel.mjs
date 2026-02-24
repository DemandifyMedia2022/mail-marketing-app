import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mail_marketing')
.then(async () => {
  console.log('Connected to MongoDB (mail_marketing)');
  
  // Get the test email tracking code
  const Email = mongoose.connection.collection('emails');
  const testEmail = await Email.findOne({ to: 'test@example.com', status: 'sent' });
  
  if (!testEmail) {
    console.log('No sent test email found');
    process.exit(0);
  }
  
  console.log(`Found test email:`);
  console.log(`- Email: ${testEmail.to}`);
  console.log(`- Tracking Code: ${testEmail.trackingCode}`);
  console.log(`- Current Open Count: ${testEmail.openCount || 0}`);
  
  // Check if EmailOpen record exists
  const EmailOpen = mongoose.connection.collection('emailopens');
  const openRecord = await EmailOpen.findOne({ trackingCode: testEmail.trackingCode });
  
  if (openRecord) {
    console.log(`\nEmailOpen record exists:`);
    console.log(`- Email: ${openRecord.email}`);
    console.log(`- Open Count: ${openRecord.openCount}`);
    console.log(`- First Open: ${openRecord.firstOpenedAt}`);
    console.log(`- Last Open: ${openRecord.lastOpenedAt}`);
  } else {
    console.log(`\nNo EmailOpen record found for tracking code: ${testEmail.trackingCode}`);
  }
  
  // Test tracking pixel URL
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
  const trackingUrl = `${baseUrl}/api/emails/track/open/${testEmail.trackingCode}`;
  console.log(`\nTracking pixel URL: ${trackingUrl}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

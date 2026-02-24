import axios from 'axios';

// Test tracking pixel for an old email that hasn't been opened yet
const oldTrackingCode = '2k9rsqyiixebiibl74z5hf'; // From anjali.ghumare email from 2 days ago
const trackingUrl = `http://192.168.0.219:5000/api/emails/track/open/${oldTrackingCode}`;

console.log('Testing old tracking pixel URL:', trackingUrl);
console.log('This simulates an email being opened 2 days after sending...');

axios.get(trackingUrl)
  .then(async response => {
    console.log('✅ Response status:', response.status);
    console.log('✅ Content-Type:', response.headers['content-type']);
    console.log('✅ Response is image:', response.headers['content-type']?.includes('image'));
    
    // Now check if database was updated
    const mongoose = await import('mongoose');
    const dotenv = await import('dotenv');
    dotenv.config();
    
    await mongoose.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mail_marketing');
    
    const Email = mongoose.default.connection.collection('emails');
    const EmailOpen = mongoose.default.connection.collection('emailopens');
    
    // Check email record
    const email = await Email.findOne({ trackingCode: oldTrackingCode });
    console.log('\n📧 Email Record Update:');
    console.log(`- Open Count: ${email.openCount}`);
    console.log(`- Last Opened: ${email.lastOpenedAt}`);
    
    // Check EmailOpen record
    const openRecord = await EmailOpen.findOne({ trackingCode: oldTrackingCode });
    console.log('\n📊 EmailOpen Record Update:');
    console.log(`- Open Count: ${openRecord.openCount}`);
    console.log(`- First Open: ${openRecord.firstOpenedAt}`);
    console.log(`- Last Open: ${openRecord.lastOpenedAt}`);
    console.log(`- IP Address: ${openRecord.ipAddress}`);
    console.log(`- User Agent: ${openRecord.userAgent}`);
    
    await mongoose.default.connection.close();
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  });

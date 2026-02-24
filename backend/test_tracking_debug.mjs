import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail-marketing')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check Email collection
  const Email = mongoose.connection.collection('emails');
  const emailCount = await Email.countDocuments();
  console.log('Total emails:', emailCount);
  
  // Check emails with tracking codes
  const emailsWithTracking = await Email.find({ trackingCode: { $exists: true, $ne: null } }).limit(3).toArray();
  console.log('Sample emails with tracking codes:');
  emailsWithTracking.forEach(e => {
    console.log(`- Email: ${e.to}, TrackingCode: ${e.trackingCode}, OpenCount: ${e.openCount || 0}`);
  });
  
  // Check EmailOpen collection
  const EmailOpen = mongoose.connection.collection('emailopens');
  const openCount = await EmailOpen.countDocuments();
  console.log('Total email open records:', openCount);
  
  const sampleOpens = await EmailOpen.find().limit(3).toArray();
  console.log('Sample email open records:');
  sampleOpens.forEach(o => {
    console.log(`- Email: ${o.email}, TrackingCode: ${o.trackingCode}, OpenCount: ${o.openCount || 0}, FirstOpen: ${o.firstOpenedAt}`);
  });
  
  // Check for potential issues
  console.log('\n=== Checking for Issues ===');
  
  // Check if emails have tracking codes but no EmailOpen records
  const emailsWithoutOpenRecords = await Email.find({ 
    trackingCode: { $exists: true, $ne: null },
    openCount: { $gt: 0 }
  }).limit(3).toArray();
  
  console.log('Emails with opens but checking EmailOpen records:');
  for (const email of emailsWithoutOpenRecords) {
    const openRecord = await EmailOpen.findOne({ trackingCode: email.trackingCode });
    console.log(`- Email: ${email.to}, HasOpenRecord: ${!!openRecord}, EmailOpenCount: ${email.openCount}`);
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

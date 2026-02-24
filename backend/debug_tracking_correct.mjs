import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mail_marketing')
.then(async () => {
  console.log('Connected to MongoDB (mail_marketing)');
  
  // Check Email collection
  const Email = mongoose.connection.collection('emails');
  const emailCount = await Email.countDocuments();
  console.log('Total emails:', emailCount);
  
  // Check recent emails with tracking codes
  const recentEmails = await Email.find({ trackingCode: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  
  console.log('\nRecent emails with tracking codes:');
  recentEmails.forEach(e => {
    console.log(`- Email: ${e.to}, TrackingCode: ${e.trackingCode}, OpenCount: ${e.openCount || 0}, Status: ${e.status}`);
  });
  
  // Check EmailOpen collection
  const EmailOpen = mongoose.connection.collection('emailopens');
  const openCount = await EmailOpen.countDocuments();
  console.log('\nTotal email open records:', openCount);
  
  const recentOpens = await EmailOpen.find()
    .sort({ lastOpenedAt: -1 })
    .limit(5)
    .toArray();
  
  console.log('\nRecent email open records:');
  recentOpens.forEach(o => {
    console.log(`- Email: ${o.email}, TrackingCode: ${o.trackingCode}, OpenCount: ${o.openCount || 0}, LastOpen: ${o.lastOpenedAt}`);
  });
  
  // Check for potential issues
  console.log('\n=== Checking for Issues ===');
  
  // Find emails with tracking codes but no opens
  const emailsWithoutOpens = await Email.find({
    trackingCode: { $exists: true, $ne: null },
    $or: [
      { openCount: { $exists: false } },
      { openCount: 0 }
    ]
  }).limit(3).toArray();
  
  console.log('Emails with tracking codes but no opens:');
  emailsWithoutOpens.forEach(e => {
    console.log(`- Email: ${e.to}, TrackingCode: ${e.trackingCode}, OpenCount: ${e.openCount || 0}`);
    
    // Check if EmailOpen record exists
    EmailOpen.findOne({ trackingCode: e.trackingCode }).then(openRecord => {
      console.log(`  Has EmailOpen record: ${!!openRecord}`);
    });
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

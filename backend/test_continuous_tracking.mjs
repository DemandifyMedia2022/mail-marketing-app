import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mail_marketing')
.then(async () => {
  console.log('Connected to MongoDB (mail_marketing)');
  
  const Email = mongoose.connection.collection('emails');
  const EmailOpen = mongoose.connection.collection('emailopens');
  
  // Test 1: Check if old tracking codes still work
  console.log('=== Testing Old Tracking Codes ===');
  const oldEmails = await Email.find({
    trackingCode: { $exists: true, $ne: null },
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
  }).limit(3).toArray();
  
  console.log(`Found ${oldEmails.length} emails older than 24 hours`);
  
  for (const email of oldEmails) {
    console.log(`\nEmail: ${email.to}`);
    console.log(`Created: ${email.createdAt}`);
    console.log(`Tracking Code: ${email.trackingCode}`);
    console.log(`Current Open Count: ${email.openCount || 0}`);
    
    // Check EmailOpen record
    const openRecord = await EmailOpen.findOne({ trackingCode: email.trackingCode });
    if (openRecord) {
      console.log(`EmailOpen Count: ${openRecord.openCount}`);
      console.log(`Last Open: ${openRecord.lastOpenedAt}`);
    } else {
      console.log('❌ No EmailOpen record found!');
    }
  }
  
  // Test 2: Check recent opens to see if they're being captured
  console.log('\n=== Testing Recent Opens ===');
  const recentOpens = await EmailOpen.find({
    lastOpenedAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Last 2 hours
  }).sort({ lastOpenedAt: -1 }).limit(5).toArray();
  
  console.log(`Found ${recentOpens.length} opens in last 2 hours`);
  recentOpens.forEach(open => {
    console.log(`- ${open.email}: ${open.lastOpenedAt} (Count: ${open.openCount})`);
  });
  
  // Test 3: Check for any gaps in tracking
  console.log('\n=== Checking for Tracking Gaps ===');
  const emailsWithTracking = await Email.find({
    trackingCode: { $exists: true, $ne: null }
  }).toArray();
  
  let missingOpenRecords = 0;
  for (const email of emailsWithTracking.slice(0, 10)) {
    const openRecord = await EmailOpen.findOne({ trackingCode: email.trackingCode });
    if (!openRecord) {
      missingOpenRecords++;
      console.log(`❌ Missing EmailOpen for: ${email.to} (${email.trackingCode})`);
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Total emails with tracking: ${emailsWithTracking.length}`);
  console.log(`- Missing EmailOpen records (sample): ${missingOpenRecords}`);
  console.log(`- Recent opens (2hrs): ${recentOpens.length}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

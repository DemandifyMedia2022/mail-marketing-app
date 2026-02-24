import mongoose from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import dns from 'dns/promises';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mail_marketing')
.then(async () => {
  console.log('Connected to MongoDB');
  
  const testEmail = 'test@example.com';
  console.log(`Testing email: ${testEmail}`);
  
  // 1. Check format validation
  const isValidFormat = validator.isEmail(testEmail);
  console.log(`Format valid: ${isValidFormat}`);
  
  // 2. Check MX records
  const domain = testEmail.split("@")[1];
  console.log(`Domain: ${domain}`);
  
  try {
    const mxRecords = await dns.resolveMx(domain);
    console.log(`MX records found: ${mxRecords.length}`);
    console.log('MX records:', mxRecords);
  } catch (err) {
    console.log(`MX lookup failed: ${err.message}`);
  }
  
  // 3. Check database connection
  const Email = mongoose.connection.collection('emails');
  const count = await Email.countDocuments();
  console.log(`Total emails in database: ${count}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

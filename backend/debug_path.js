import path from 'path';
import fs from 'fs';

console.log('🔍 Debugging survey.html path...');

const __dirname = path.dirname(new URL(import.meta.url).pathname);
console.log('Current directory (__dirname):', __dirname);

const surveyPath = path.join(__dirname, '../frontend/public/survey.html');
console.log('Survey path:', surveyPath);
console.log('Survey path exists:', fs.existsSync(surveyPath));

// Try different paths
const paths = [
  path.join(__dirname, '../frontend/public/survey.html'),
  path.join(__dirname, '../../frontend/public/survey.html'),
  path.join(__dirname, '../../../frontend/public/survey.html'),
  'c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/frontend/public/survey.html'
];

paths.forEach((p, i) => {
  console.log(`Path ${i + 1}: ${p}`);
  console.log(`  Exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    console.log(`  ✅ FOUND! This is the correct path.`);
  }
});

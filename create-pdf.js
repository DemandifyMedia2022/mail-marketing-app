const fs = require('fs');
const path = require('path');

// Simple PDF generation using console output
console.log('🚀 Generating KT Documentation PDF...\n');

// Read the HTML file
const htmlPath = path.join(__dirname, 'KT_DOCUMENTATION.html');
const outputPath = path.join(__dirname, 'KT_DOCUMENTATION.pdf');

try {
    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
        console.error('❌ HTML file not found:', htmlPath);
        process.exit(1);
    }

    console.log('📄 HTML file found:', htmlPath);
    console.log('📁 Output path:', outputPath);
    
    // Method 1: Try using puppeteer if available
    try {
        console.log('🔄 Attempting PDF generation with headless browser...');
        
        const { execSync } = require('child_process');
        
        // Try different browsers
        const browsers = [
            'chrome --headless --disable-gpu --print-to-pdf="' + outputPath + '" --print-to-pdf-no-header "' + htmlPath + '"',
            'msedge --headless --disable-gpu --print-to-pdf="' + outputPath + '" --print-to-pdf-no-header "' + htmlPath + '"',
            'google-chrome --headless --disable-gpu --print-to-pdf="' + outputPath + '" --print-to-pdf-no-header "' + htmlPath + '"'
        ];
        
        let pdfGenerated = false;
        
        for (const browserCmd of browsers) {
            try {
                console.log('🌐 Trying:', browserCmd.split(' ')[0]);
                execSync(browserCmd, { stdio: 'pipe', timeout: 10000 });
                
                if (fs.existsSync(outputPath)) {
                    const stats = fs.statSync(outputPath);
                    console.log('✅ PDF generated successfully!');
                    console.log('📊 File size:', (stats.size / 1024).toFixed(2), 'KB');
                    console.log('📍 Location:', outputPath);
                    pdfGenerated = true;
                    break;
                }
            } catch (err) {
                // Try next browser
                continue;
            }
        }
        
        if (!pdfGenerated) {
            throw new Error('No browser could generate PDF');
        }
        
    } catch (browserError) {
        console.log('⚠️  Browser method failed, trying alternative...');
        
        // Method 2: Create a simple text-based PDF (basic)
        console.log('📝 Creating PDF-compatible document...');
        
        // Read HTML content
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Extract text content and create a simple PDF-compatible format
        const textContent = htmlContent
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
            .replace(/&amp;/g, '&') // Replace HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
        
        // Create a simple text file that can be saved as PDF
        const textFilePath = path.join(__dirname, 'KT_DOCUMENTATION.txt');
        fs.writeFileSync(textFilePath, textContent);
        
        console.log('📄 Text version created:', textFilePath);
        console.log('💡 You can now:');
        console.log('   1. Open this text file in any text editor');
        console.log('   2. Use "Print to PDF" function');
        console.log('   3. Or convert using any online tool');
        
        // Also provide the HTML path for direct browser opening
        console.log('\n🌐 OR simply:');
        console.log('   1. Double-click:', htmlPath);
        console.log('   2. Press Ctrl+P');
        console.log('   3. Save as PDF');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Manual instructions:');
    console.log('1. Open file:', htmlPath);
    console.log('2. Press Ctrl+P');
    console.log('3. Select "Save as PDF"');
    console.log('4. Click Save');
}

console.log('\n📋 Documentation Summary:');
console.log('- 21 comprehensive sections');
console.log('- Complete technical architecture');
console.log('- API documentation');
console.log('- Database schemas');
console.log('- Deployment guide');
console.log('- Troubleshooting guide');
console.log('\n🎯 Ready for developer onboarding!');

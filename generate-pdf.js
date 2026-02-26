const fs = require('fs');
const { exec } = require('child_process');

// Simple HTML to PDF conversion using headless Chrome/Edge
async function convertToPDF() {
    const htmlPath = 'KT_DOCUMENTATION.html';
    const pdfPath = 'KT_DOCUMENTATION.pdf';
    
    // Try to use Chrome/Edge headless mode
    const chromeCommand = process.platform === 'win32' 
        ? 'start chrome --headless --disable-gpu --print-to-pdf="%PDF%" --print-to-pdf-no-header "%HTML%"'
        : 'google-chrome --headless --disable-gpu --print-to-pdf="%PDF%" --print-to-pdf-no-header "%HTML%"';
    
    const command = chromeCommand
        .replace('%PDF%', pdfPath)
        .replace('%HTML%', htmlPath);
    
    console.log('Attempting to convert HTML to PDF...');
    console.log('Command:', command);
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error converting to PDF:', error);
            console.log('Please open the HTML file manually and print to PDF:');
            console.log('File: KT_DOCUMENTATION.html');
            return;
        }
        
        if (fs.existsSync(pdfPath)) {
            console.log('✅ PDF generated successfully: KT_DOCUMENTATION.pdf');
        } else {
            console.log('❌ PDF generation failed. Please open KT_DOCUMENTATION.html and print to PDF manually.');
        }
    });
}

convertToPDF();

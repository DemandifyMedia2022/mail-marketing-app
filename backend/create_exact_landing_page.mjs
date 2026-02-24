import mongoose from 'mongoose';
import LandingPage from './src/models/LandingPage.js';

// The exact landing page HTML content based on the image
const exactLandingPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Get Started - Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .landing-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 48px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .landing-header {
            margin-bottom: 32px;
        }

        .landing-header h1 {
            color: #1f2937;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            line-height: 1.2;
        }

        .landing-header p {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 0;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
            color: #9ca3af;
        }

        .submit-button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            margin-top: 8px;
        }

        .submit-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .submit-button:active {
            transform: translateY(0);
        }

        .success-message {
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            color: #065f46;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            text-align: center;
        }

        .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            text-align: center;
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #6b7280;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
            .landing-container {
                padding: 32px 24px;
                margin: 16px;
            }
            
            .landing-header h1 {
                font-size: 28px;
            }
            
            .landing-header p {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="landing-container">
        <div class="landing-header">
            <h1>Get Started</h1>
            <p>Enter your information below to get started with our service</p>
        </div>

        <div id="message-container"></div>
        
        <form id="landing-form">
            <div class="form-group">
                <label class="form-label" for="name">Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    class="form-input" 
                    placeholder="Enter your full name"
                    required
                >
            </div>

            <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    placeholder="Enter your email address"
                    required
                >
            </div>

            <div class="form-group">
                <label class="form-label" for="company">Company</label>
                <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    class="form-input" 
                    placeholder="Enter your company name"
                >
            </div>

            <button type="submit" class="submit-button" id="submit-btn">
                Get Started
            </button>
        </form>
    </div>

    <script>
        const form = document.getElementById('landing-form');
        const submitBtn = document.getElementById('submit-btn');
        const messageContainer = document.getElementById('message-container');
        
        let submitted = false;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (submitted) return;
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            submitBtn.innerHTML = '<div class="spinner"></div> Processing...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                messageContainer.innerHTML = \`
                    <div class="success-message">
                        <strong>Thank you for your submission!</strong><br>
                        We'll be in touch with you shortly.
                    </div>
                \`;
                
                // Hide form
                form.style.display = 'none';
                submitted = true;
                
                // Track conversion (you can customize this)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'event_category': 'Landing Page',
                        'event_label': 'Form Submission'
                    });
                }
                
            } catch (error) {
                // Show error message
                messageContainer.innerHTML = \`
                    <div class="error-message">
                        Something went wrong. Please try again later.
                    </div>
                \`;
                
                // Reset button
                submitBtn.innerHTML = 'Get Started';
                submitBtn.disabled = false;
            }
        });

        // Track form field interactions
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Track field focus (optional analytics)
                console.log('Field focused:', input.name);
            });
        });

        // Track page engagement
        let timeSpent = 0;
        setInterval(() => {
            timeSpent++;
        }, 1000);

        // Send engagement data when user leaves
        window.addEventListener('beforeunload', () => {
            console.log('Time spent on page:', timeSpent + ' seconds');
            
            // You can send this data to your analytics
            if (typeof navigator.sendBeacon !== 'undefined') {
                const data = new FormData();
                data.append('timeSpent', timeSpent);
                data.append('pageType', 'landing');
                navigator.sendBeacon('/api/analytics/engagement', data);
            }
        });
    </script>
</body>
</html>
`;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mail_marketing');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create the exact landing page
const createExactLandingPage = async () => {
  try {
    let landingPageId;
    
    // Check if landing page already exists
    const existingPage = await LandingPage.findOne({ name: 'Get Started Landing Page' });
    
    if (existingPage) {
      console.log('ℹ️ Landing page already exists. Updating content...');
      existingPage.content = exactLandingPageHTML;
      existingPage.description = 'Modern gradient landing page with contact form';
      await existingPage.save();
      console.log('✅ Landing page updated successfully');
      landingPageId = existingPage._id;
    } else {
      // Create new landing page
      const landingPage = new LandingPage({
        name: 'Get Started Landing Page',
        title: 'Get Started',
        description: 'Modern gradient landing page with contact form',
        contentType: 'html',
        content: exactLandingPageHTML,
        tags: ['landing', 'form', 'gradient', 'modern'],
        isActive: true,
      });

      await landingPage.save();
      console.log('✅ Landing page created successfully');
      landingPageId = landingPage._id;
    }

    console.log('\n🎯 Landing Page Details:');
    console.log('Name: Get Started Landing Page');
    console.log('Type: HTML');
    console.log('Status: Active');
    console.log('URL: http://192.168.0.219:5000/landing-page/' + landingPageId);

  } catch (error) {
    console.error('❌ Error creating landing page:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createExactLandingPage();
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
};

main().catch(console.error);

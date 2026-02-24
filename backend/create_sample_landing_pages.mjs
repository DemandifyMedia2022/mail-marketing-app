import mongoose from 'mongoose';
import LandingPage from './src/models/LandingPage.js';

// Sample landing page HTML content (similar to survey form)
const sampleLandingPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Interest Survey</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .landing-container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            padding: 40px;
            text-align: center;
        }

        .landing-header {
            margin-bottom: 30px;
        }

        .landing-header h1 {
            color: #1f2937;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .landing-header p {
            color: #6b7280;
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .feature-list {
            text-align: left;
            margin: 30px 0;
        }

        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .feature-icon {
            font-size: 24px;
            margin-right: 16px;
        }

        .feature-text h3 {
            color: #1f2937;
            font-size: 1.1rem;
            margin-bottom: 4px;
        }

        .feature-text p {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            margin: 20px 10px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            border: none;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .cta-button.secondary {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
        }

        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }

        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .landing-container {
                padding: 20px;
                margin: 10px;
            }
            
            .landing-header h1 {
                font-size: 2rem;
            }
            
            .stats-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="landing-container">
        <div class="landing-header">
            <h1>Transform Your Email Marketing</h1>
            <p>Discover powerful tools to create, track, and optimize your email campaigns with real-time analytics and automation.</p>
        </div>

        <div class="stats-section">
            <div class="stat-card">
                <div class="stat-number">10K+</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">95%</div>
                <div class="stat-label">Delivery Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Support</div>
            </div>
        </div>

        <div class="feature-list">
            <div class="feature-item">
                <div class="feature-icon">📊</div>
                <div class="feature-text">
                    <h3>Real-time Analytics</h3>
                    <p>Track opens, clicks, and conversions as they happen with detailed reporting.</p>
                </div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">
                    <h3>Smart Segmentation</h3>
                    <p>Target the right audience with advanced segmentation and personalization.</p>
                </div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🤖</div>
                <div class="feature-text">
                    <h3>Automation Tools</h3>
                    <p>Set up automated campaigns that work for you around the clock.</p>
                </div>
            </div>
        </div>

        <div style="margin: 30px 0;">
            <button class="cta-button" onclick="handleGetStarted()">Get Started Free</button>
            <button class="cta-button secondary" onclick="handleLearnMore()">Learn More</button>
        </div>

        <div class="footer">
            <p>© 2024 Mail Marketing Platform. Built for marketers who demand results.</p>
        </div>
    </div>

    <script>
        function handleGetStarted() {
            alert('Thank you for your interest! Our team will contact you soon to get you started.');
        }

        function handleLearnMore() {
            alert('Discover more features and benefits of our email marketing platform!');
        }

        // Track page engagement
        let timeSpent = 0;
        setInterval(() => {
            timeSpent++;
        }, 1000);

        // Send engagement data when user leaves
        window.addEventListener('beforeunload', () => {
            // This would typically send data to your analytics
            console.log('Time spent on page:', timeSpent + ' seconds');
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

// Create sample landing pages
const createSampleLandingPages = async () => {
  try {
    // Sample 1: Product Marketing Landing Page
    const landingPage1 = new LandingPage({
      name: 'Product Marketing Landing Page',
      title: 'Transform Your Email Marketing',
      description: 'A beautiful landing page showcasing email marketing platform features',
      contentType: 'html',
      content: sampleLandingPageHTML,
      tags: ['marketing', 'product', 'business'],
      isActive: true,
    });

    await landingPage1.save();
    console.log('✅ Created landing page:', landingPage1.name);

    // Sample 2: PDF Landing Page
    const landingPage2 = new LandingPage({
      name: 'Product Brochure PDF',
      title: 'Download Our Product Brochure',
      description: 'Interactive PDF brochure with detailed product information',
      contentType: 'pdf',
      contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      tags: ['brochure', 'pdf', 'download'],
      isActive: true,
    });

    await landingPage2.save();
    console.log('✅ Created landing page:', landingPage2.name);

    // Sample 3: Iframe Landing Page
    const landingPage3 = new LandingPage({
      name: 'External Demo Page',
      title: 'Live Product Demo',
      description: 'Interactive demo embedded from external source',
      contentType: 'iframe',
      contentUrl: 'https://www.example.com',
      tags: ['demo', 'interactive', 'external'],
      isActive: true,
    });

    await landingPage3.save();
    console.log('✅ Created landing page:', landingPage3.name);

    console.log('\n🎉 All sample landing pages created successfully!');
    console.log('\n📋 Summary:');
    console.log('1. Product Marketing Landing Page (HTML)');
    console.log('2. Product Brochure PDF (PDF)');
    console.log('3. External Demo Page (Iframe)');

  } catch (error) {
    console.error('❌ Error creating landing pages:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createSampleLandingPages();
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
};

main().catch(console.error);

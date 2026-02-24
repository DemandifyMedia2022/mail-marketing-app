import mongoose from 'mongoose';
import LandingPage from './src/models/LandingPage.js';

const demandFlowHTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>DemandFlow HRMS</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:"Segoe UI",sans-serif}body{background:#f7f9fc;color:#1a1a1a}.navbar{display:flex;justify-content:space-between;padding:20px 60px;background:white;align-items:center}.logo{font-weight:bold;font-size:22px}.logo span{color:#3b6cff}.navbar a{margin:0 12px;text-decoration:none;color:#444}.btn-outline{padding:8px 16px;border:1px solid #3b6cff;background:none;color:#3b6cff;border-radius:20px}.hero{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;padding:60px}.badge{background:#e8f0ff;color:#3b6cff;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:12px}.hero h1 span{color:#3b6cff}.hero p{margin:16px 0}.card{background:white;padding:20px;border-radius:12px}.hero-form{background:white;padding:30px;border-radius:16px}.hero-form h2{margin-bottom:8px}.subtitle{font-size:14px;color:#666;margin-bottom:20px}form .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}form input,form select{padding:10px;border-radius:8px;border:1px solid #ddd;margin-bottom:12px;width:100%}.checkbox{font-size:12px;margin:10px 0;display:flex;gap:6px}.btn-primary{width:100%;padding:12px;background:#3b6cff;color:white;border:none;border-radius:30px;font-weight:bold;cursor:pointer}.btn-primary:hover{background:#2a5ce6}.features{padding:60px;background:white}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px}.feature{background:#f7f9fc;padding:20px;border-radius:12px}.why{display:grid;grid-template-columns:1fr 1fr;padding:60px;gap:30px}.why ul li{list-style:none;margin-bottom:8px}.conclusion{background:white;padding:20px;border-radius:12px}footer{background:#0f172a;color:white;padding:40px 60px}.footer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}.footer-grid a{display:block;color:#cbd5e1;font-size:14px;margin:6px 0;text-decoration:none}.copy{text-align:center;margin-top:30px;font-size:13px;color:#94a3b8}@media (max-width:768px){.hero{grid-template-columns:1fr;padding:30px}.feature-grid{grid-template-columns:1fr}.why{grid-template-columns:1fr;padding:30px}.footer-grid{grid-template-columns:1fr}}</style></head><body><header class="navbar"><div class="logo">Demand<span>Flow</span></div><nav><a href="#">Home</a><a href="#">Services</a><a href="#">Products</a><a href="#">About</a><a href="#">Pricing</a></nav><button class="btn-outline">Contact Us</button></header><section class="hero"><div class="hero-left"><span class="badge">⚡ Smart DemandFlow HRMS</span><h1>Smart <span>DemandFlow HRMS</span><br/>for Growing Teams</h1><p>Simplify HR procedures, eliminate manual labor, and manage your personnel confidently.</p><div class="card"><h3>One Platform. Complete Workforce Control</h3><p>Centralized data, automation, and real-time visibility across teams and departments.</p></div></div><div class="hero-form"><h2>Download the DemandFlow HRMS Guide</h2><p class="subtitle">A concise guide to modernize and scale HR operations</p><form id="surveyForm"><div class="row"><input type="text" placeholder="First Name *" required/><input type="text" placeholder="Last Name *" required/></div><div class="row"><input type="email" placeholder="Work Email *" required/><input type="text" placeholder="Company Name *" required/></div><div class="row"><input type="tel" placeholder="Phone Number"/><select><option>Country</option><option>India</option><option>USA</option></select></div><select><option>Current HR Setup</option></select><select><option>Important HRMS Capabilities</option></select><select><option>Automation Importance</option></select><select><option>Organization Size</option></select><select><option>Implementation Timeline</option></select><label class="checkbox"><input type="checkbox"/> I agree to receive HR insights</label><button type="submit" class="btn-primary">Get My Free DemandFlow HRMS Guide</button></form></div></section><section class="features"><h2>DemandFlow HRMS Features</h2><div class="feature-grid"><div class="feature">Unified Workforce Management</div><div class="feature">Smart Attendance Intelligence</div><div class="feature">Smooth Onboarding</div><div class="feature">Automated Payroll & Compliance</div><div class="feature">Task & Performance Tracking</div><div class="feature">Employee Self-Service</div><div class="feature">Incident & Grievance Management</div></div></section><section class="why"><div><h3>Why Choose DemandFlow HRMS</h3><ul><li>✔ AI-Powered Automation</li><li>✔ Unified HR & Payroll</li><li>✔ Flexible Workflows</li><li>✔ Secure Role-Based Access</li><li>✔ Scales for Any Team Size</li></ul></div><div class="conclusion"><h3>Conclusion</h3><p>DemandFlow HRMS transforms HR into a strategic advantage — improving productivity, compliance, and employee experience.</p></div></section><footer><div class="footer-grid"><div><h4>DemandTech</h4><p>Stay ahead of the curve.</p></div><div><h4>Company</h4><a href="#">About</a><a href="#">Services</a><a href="#">Products</a><a href="#">Careers</a></div><div><h4>Resources</h4><a href="#">Blogs</a><a href="#">Case Studies</a></div><div><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">GDPR</a><a href="#">CCPA</a></div></div><p class="copy">© 2026 DemandTech. All rights reserved.</p></footer><script>document.getElementById("surveyForm").addEventListener("submit",function(e){e.preventDefault();alert("Form submitted successfully!")});</script></body></html>`;

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mail_marketing');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createDemandFlowLandingPage = async () => {
  try {
    await LandingPage.deleteMany({});
    console.log('🗑️ Cleared existing landing pages');
    
    const landingPage = new LandingPage({
      name: 'DemandFlow HRMS',
      title: 'DemandFlow HRMS - Smart Workforce Management',
      description: 'Complete HRMS solution with form submission and modern design',
      contentType: 'html',
      content: demandFlowHTML,
      tags: ['HRMS', 'DemandFlow', 'workforce', 'automation'],
      isActive: true,
    });

    await landingPage.save();
    console.log('✅ DemandFlow HRMS landing page created');
    console.log('🔗 URL: http://192.168.0.219:5000/landing-page/' + landingPage._id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const main = async () => {
  await connectDB();
  await createDemandFlowLandingPage();
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
};

main().catch(console.error);

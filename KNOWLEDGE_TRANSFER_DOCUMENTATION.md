# Mail Marketing Application - Knowledge Transfer (KT) Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Modules](#core-modules)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Key Features Implementation](#key-features-implementation)
8. [Development Guidelines](#development-guidelines)
9. [Deployment & Configuration](#deployment--configuration)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### Application Purpose
The Mail Marketing Application is a comprehensive email marketing platform that enables businesses to:
- Create and send email campaigns
- Build and distribute surveys
- Create landing pages with forms
- Track campaign performance in real-time
- Manage templates and analytics

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live updates
- **File Handling**: Multer for uploads
- **Email Service**: ZeptoMail integration
- **Authentication**: JWT-based auth system

### Project Structure
```
mail-marketing-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Backend utilities
│   │   └── webhooks/        # Webhook handlers
│   └── tests/               # Backend test files
└── docs/                    # Documentation files
```

---

## 🏗️ Architecture

### Frontend Architecture
- **Component-based Architecture**: Modular React components with TypeScript
- **State Management**: React hooks and local state management
- **Routing**: React Router for navigation
- **API Communication**: Axios for HTTP requests
- **UI Framework**: Tailwind CSS for styling
- **Icons**: Lucide React for icon components

### Backend Architecture
- **MVC Pattern**: Model-View-Controller architecture
- **RESTful APIs**: Standard REST API design
- **Middleware**: Express middleware for authentication, validation, CORS
- **Database Layer**: Mongoose ODM for MongoDB operations
- **Service Layer**: Business logic separated from controllers
- **Error Handling**: Centralized error handling middleware

### Data Flow
1. **Frontend** → API Request → **Backend Controller** → **Service Layer** → **Database**
2. **Database** → **Service Layer** → **Backend Controller** → API Response → **Frontend**
3. **Real-time Updates**: Socket.IO for live data synchronization

---

## 📦 Core Modules

### 1. Email Campaign Module
**Purpose**: Create, send, and track email campaigns

**Key Components**:
- `ComposeMail.tsx` - Email composition interface
- `Campaigns.tsx` - Campaign management dashboard
- `CampaignDetail.tsx` - Individual campaign view
- `CampaignAnalytics.tsx` - Campaign performance analytics

**Backend Services**:
- `email.controller.js` - Email CRUD operations
- `email.routes.js` - Email API endpoints
- `email.service.js` - Email sending logic
- `emailTracking.js` - Email tracking utilities

**Key Features**:
- Single and bulk email sending
- Template management
- Campaign creation and tracking
- Real-time analytics
- Open and click tracking

### 2. Survey Module
**Purpose**: Create surveys and collect responses

**Key Components**:
- `SurveyFormPage.tsx` - Survey creation/editing
- `SurveyTemplates.tsx` - Survey template management
- `SurveyList.tsx` - Survey listing
- `SurveyAnalytics.tsx` - Survey response analytics

**Backend Services**:
- `survey.controller.js` - Survey CRUD operations
- `survey.routes.js` - Survey API endpoints
- `surveyHelper.js` - Survey utility functions

**Key Features**:
- Drag-and-drop survey builder
- Multiple question types
- Response collection and analysis
- Template system
- Real-time response tracking

### 3. Landing Page Module
**Purpose**: Create landing pages with forms

**Key Components**:
- `LandingPageBuilder.tsx` - Drag-and-drop page builder
- `LandingPagesList.tsx` - Landing page management
- `LandingPageViewer.tsx` - Page rendering component

**Backend Services**:
- `landingPage.controller.js` - Landing page CRUD operations
- `landingPage.routes.js` - Landing page API endpoints

**Key Features**:
- Visual page builder
- Form integration
- Responsive design
- Publishing and analytics
- Template support

### 4. Template Module
**Purpose**: Manage reusable templates

**Key Components**:
- Template management in various components
- Template selection modals

**Backend Services**:
- `template.controller.js` - Template CRUD operations
- `template.routes.js` - Template API endpoints

**Key Features**:
- Email templates
- Survey templates
- Landing page templates
- Template categories
- Usage tracking

---

## 🗄️ Database Schema

### Email Campaign Schema
```javascript
{
  _id: ObjectId,
  name: String,
  subject: String,
  body: String,
  recipients: [String],
  status: String, // draft, sent, scheduled
  campaignId: String,
  createdAt: Date,
  updatedAt: Date,
  sentAt: Date,
  analytics: {
    opens: Number,
    clicks: Number,
    bounces: Number,
    deliveries: Number
  }
}
```

### Survey Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  status: String, // draft, active, completed
  questions: [{
    type: String, // text, multiple, rating, etc.
    question: String,
    options: [String], // for multiple choice
    required: Boolean
  }],
  createdAt: Date,
  updatedAt: Date,
  expiryDate: Date,
  responses: [{
    emailId: String,
    answers: [Object],
    submittedAt: Date
  }]
}
```

### Landing Page Schema
```javascript
{
  _id: ObjectId,
  name: String,
  title: String,
  description: String,
  contentType: String, // html, iframe, pdf
  content: String, // JSON for builder content
  contentUrl: String, // for iframe/pdf
  isActive: Boolean,
  campaignId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  tags: [String],
  acknowledgements: [{
    emailId: String,
    timestamp: Date
  }],
  formSubmissions: [{
    data: Object,
    submittedAt: Date
  }]
}
```

### Template Schema
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // email, survey, landing_page
  subject: String, // for email templates
  body: String,
  content: Object, // template content structure
  category: String,
  campaignId: ObjectId,
  usageCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Email Campaign APIs
```
POST   /api/emails/send                  # Send email campaign
POST   /api/emails/draft                 # Save email draft
GET    /api/emails/templates              # List email templates
POST   /api/emails/templates              # Create email template
DELETE /api/emails/templates/:id          # Delete email template
GET    /api/emails/campaigns              # List all campaigns
POST   /api/emails/campaigns              # Create new campaign
GET    /api/emails/campaigns/analytics/all # Get campaigns with analytics
POST   /api/emails/acknowledgment/:id    # Check email acknowledgment
GET    /api/emails/campaigns/:id          # Get campaign details
DELETE /api/emails/campaigns/:id          # Delete campaign
GET    /api/emails/analytics/:id          # Get campaign analytics
```

### Survey APIs
```
POST   /api/surveys                      # Create new survey
GET    /api/surveys                      # List all surveys
GET    /api/surveys/:id                  # Get survey details
POST   /api/surveys/responses             # Submit survey response
POST   /api/surveys/responses/preview     # Submit preview response
GET    /api/surveys/:id/responses        # Get survey responses
GET    /api/surveys/:id/analytics        # Get survey analytics
POST   /api/surveys/responses/basic      # Submit basic response
GET    /api/surveys/responses/basic      # Get basic responses
GET    /api/surveys/campaign/:id/responses # Get responses by campaign
GET    /api/surveys/email/:id/response   # Get response by email
```

### Landing Page APIs
```
POST   /api/landing-pages                 # Create landing page
GET    /api/landing-pages                 # List landing pages
GET    /api/landing-pages/:id             # Get landing page details
PUT    /api/landing-pages/:id             # Update landing page
DELETE /api/landing-pages/:id             # Delete landing page
POST   /api/landing-pages/:id/acknowledge # Record acknowledgment
GET    /api/landing-pages/:id/acknowledgements # Get acknowledgements
GET    /api/landing-pages/campaign/:id/acknowledgements # Get campaign acknowledgements
POST   /api/landing-pages/:id/submit-form # Submit form
GET    /api/landing-pages/:id/form-submissions # Get form submissions
GET    /api/landing-pages/campaign/:id/form-submissions # Get campaign form submissions
```

### Template APIs
```
GET    /api/templates                     # List templates
POST   /api/templates                     # Create template
GET    /api/templates/:id                 # Get template details
PUT    /api/templates/:id                 # Update template
DELETE /api/templates/:id                 # Delete template
```

---

## 🎨 Frontend Components

### Core Components

#### 1. ComposeMail Component
**Location**: `frontend/src/pages/ComposeMail.tsx`
**Purpose**: Email composition interface
**Key Features**:
- Rich text editor for email body
- Single and bulk recipient modes
- Template selection and management
- File attachment support
- CC/BCC functionality
- Campaign linking

**State Management**:
```typescript
interface FormState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  bulkRecipients: string;
  mode: "single" | "bulk";
}
```

#### 2. LandingPageBuilder Component
**Location**: `frontend/src/components/LandingPageBuilder.tsx`
**Purpose**: Visual landing page creation
**Key Features**:
- Drag-and-drop interface
- Multiple element types (heading, text, image, button, form, divider, container)
- Real-time preview
- Styling controls
- Form integration

**Element Structure**:
```typescript
interface BlockElement {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'form' | 'divider' | 'container';
  content: any;
  styles: React.CSSProperties;
  containerStyles?: ContainerStyles;
}
```

#### 3. SurveyForm Component
**Location**: `frontend/src/components/SurveyForm.tsx`
**Purpose**: Survey creation and editing
**Key Features**:
- Question type selection
- Drag-and-drop reordering
- Preview mode
- Local storage integration
- Template selection

#### 4. Campaigns Component
**Location**: `frontend/src/pages/Campaigns.tsx`
**Purpose**: Campaign management dashboard
**Key Features**:
- Campaign listing with analytics
- Real-time updates
- Search and filtering
- Campaign status tracking
- Performance metrics

### Utility Components

#### 1. ProtectedRoute Component
**Location**: `frontend/src/components/ProtectedRoute.tsx`
**Purpose**: Authentication guard
**Functionality**: Protects routes requiring authentication

#### 2. RealtimeTracking Component
**Location**: `frontend/src/components/RealtimeTracking.tsx`
**Purpose**: Real-time campaign tracking
**Functionality**: WebSocket integration for live updates

---

## 🔧 Key Features Implementation

### 1. Email Tracking Implementation

**Open Tracking**:
- Uses 1x1 pixel tracking images
- Tracking pixel URL: `/api/emails/track-open/:campaignId/:emailId`
- Records open timestamp and user agent

**Click Tracking**:
- Link wrapping with tracking URLs
- Tracking URL: `/api/emails/track-click/:campaignId/:emailId/:linkId`
- Records click timestamp and target URL

**Implementation Code**:
```javascript
// Email tracking pixel generation
const trackingPixel = `<img src="${baseUrl}/api/emails/track-open/${campaignId}/${emailId}" width="1" height="1" />`;

// Link tracking wrapper
const wrapLinkWithTracking = (url, campaignId, emailId) => {
  return `${baseUrl}/api/emails/track-click/${campaignId}/${emailId}/${encodeURIComponent(url)}`;
};
```

### 2. Survey Builder Implementation

**Question Types**:
- Text input (single/multi-line)
- Multiple choice (single/multiple)
- Dropdown selection
- Rating scales
- File upload

**Local Storage Management**:
```javascript
// Save survey to localStorage
const saveSurveyToStorage = (surveyData) => {
  localStorage.setItem('editingSurveyData', JSON.stringify(surveyData));
};

// Load survey from localStorage
const loadSurveyFromStorage = () => {
  const data = localStorage.getItem('editingSurveyData');
  return data ? JSON.parse(data) : null;
};
```

### 3. Landing Page Builder Implementation

**Drag-and-Drop System**:
- HTML5 Drag and Drop API
- Element positioning and styling
- Container-based layouts
- Real-time preview

**Form Integration**:
- Dynamic form generation
- Form submission handling
- Data collection and storage

**Rendering System**:
```javascript
// Element rendering function
const renderElement = (element) => {
  switch (element.type) {
    case 'heading':
      return <HeadingTag>{element.content.text}</HeadingTag>;
    case 'text':
      return <div>{element.content.text}</div>;
    case 'form':
      return renderForm(element);
    // ... other element types
  }
};
```

### 4. Template System Implementation

**Template Structure**:
```javascript
interface Template {
  _id: string;
  name: string;
  type: 'email' | 'survey' | 'landing_page';
  subject?: string; // For email templates
  body: string;
  content: Object; // Template content structure
  category: string;
  campaignId?: string;
  usageCount: number;
}
```

**Template Usage**:
- Template selection modals
- Template preview functionality
- Template customization options
- Usage tracking

---

## 👨‍💻 Development Guidelines

### Code Standards

#### Frontend Guidelines
- **TypeScript**: Use strict TypeScript for type safety
- **Component Structure**: Follow functional component pattern
- **State Management**: Use React hooks for state management
- **Styling**: Use Tailwind CSS for consistent styling
- **Error Handling**: Implement proper error boundaries

#### Backend Guidelines
- **Node.js**: Use async/await for asynchronous operations
- **Error Handling**: Centralized error handling middleware
- **Validation**: Input validation using appropriate libraries
- **Security**: Implement proper authentication and authorization
- **Logging**: Comprehensive logging for debugging

### File Naming Conventions
- **Components**: PascalCase (e.g., `LandingPageBuilder.tsx`)
- **Services**: camelCase (e.g., `emailService.ts`)
- **Utilities**: camelCase with descriptive names (e.g., `emailTracking.js`)
- **Routes**: kebab-case (e.g., `email.routes.js`)

### Git Workflow
- **Branch Naming**: `feature/feature-name` or `bugfix/bug-description`
- **Commit Messages**: Conventional commit format
- **Pull Requests**: Code review required before merge

### Testing Guidelines
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Coverage**: Maintain minimum 80% test coverage

---

## 🚀 Deployment & Configuration

### Environment Setup

#### Frontend Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Backend Environment Variables
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mail-marketing
JWT_SECRET=your-jwt-secret
ZEPTO_MAIL_API_KEY=your-zeptomail-api-key
```

### Database Setup

#### MongoDB Collections
- `emails` - Email campaigns and drafts
- `surveys` - Survey definitions and responses
- `landingpages` - Landing page definitions
- `templates` - Template definitions
- `users` - User accounts and authentication

#### Database Indexes
```javascript
// Email collection indexes
db.emails.createIndex({ campaignId: 1 });
db.emails.createIndex({ status: 1 });
db.emails.createIndex({ createdAt: -1 });

// Survey collection indexes
db.surveys.createIndex({ category: 1 });
db.surveys.createIndex({ status: 1 });
db.surveys.createIndex({ createdAt: -1 });
```

### Server Configuration

#### Express Server Setup
```javascript
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/landing-pages', landingPageRoutes);
app.use('/api/templates', templateRoutes);
```

#### Socket.IO Setup
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Real-time event handlers
io.on('connection', (socket) => {
  socket.on('join-campaign', (campaignId) => {
    socket.join(`campaign-${campaignId}`);
  });
});
```

### Production Deployment

#### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Email Sending Failures
**Symptoms**: Emails not being sent, API errors
**Solutions**:
- Check ZeptoMail API key configuration
- Verify email format and recipient addresses
- Check rate limiting and quota limits
- Review server logs for detailed error messages

#### 2. Database Connection Issues
**Symptoms**: Application not connecting to MongoDB
**Solutions**:
- Verify MongoDB connection string
- Check MongoDB service status
- Ensure network connectivity
- Review authentication credentials

#### 3. Real-time Updates Not Working
**Symptoms**: Live updates not appearing in dashboard
**Solutions**:
- Check Socket.IO connection status
- Verify WebSocket configuration
- Check firewall settings
- Review client-side Socket.IO implementation

#### 4. File Upload Issues
**Symptoms**: File uploads failing or not processing
**Solutions**:
- Check Multer configuration
- Verify file size limits
- Check upload directory permissions
- Review file validation logic

### Debugging Tools

#### Frontend Debugging
- **React DevTools**: Component inspection and state debugging
- **Browser DevTools**: Network request inspection
- **Console Logging**: Application-specific logging

#### Backend Debugging
- **Winston Logger**: Structured logging system
- **MongoDB Logs**: Database operation logs
- **API Testing**: Postman or similar tools

### Performance Optimization

#### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed images and lazy loading
- **Caching**: Browser caching strategies
- **Bundle Optimization**: Webpack optimization

#### Backend Optimization
- **Database Indexing**: Proper MongoDB indexes
- **API Caching**: Redis or in-memory caching
- **Connection Pooling**: Database connection optimization
- **Compression**: Gzip compression for responses

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### External Services
- [ZeptoMail API](https://www.zeptomail.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Development Tools
- **VS Code**: Recommended IDE with extensions
- **Postman**: API testing tool
- **MongoDB Compass**: Database management tool
- **React DevTools**: Browser extension for React debugging

---

*This KT documentation provides comprehensive information about the mail-marketing-app implementation. It should be used as a reference for developers joining the project or for understanding the system architecture and implementation details.*

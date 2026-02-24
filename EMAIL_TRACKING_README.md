# Email Open Tracking Implementation

## Overview
Implemented real-time email open tracking using invisible tracking pixels and WebSocket technology.

## Features Implemented

### 1. Tracking Pixel Endpoint
- **Route**: `GET /api/emails/track/open/:trackingCode`
- Returns 1x1 transparent PNG image
- Updates email open statistics in database
- Captures IP address and user agent
- Emits real-time events via Socket.IO

### 2. Real-time Tracking with Socket.IO
- **WebSocket server** integrated with Express
- **Real-time events** for email opens
- **Campaign-specific rooms** for targeted updates
- **Live connection status** indicators

### 3. Email Model Enhancements
- **Unique tracking codes** generated for each email
- **Automatic tracking code generation** on save
- **EmailOpen records** created for tracking

### 4. Email Sending Integration
- **Tracking pixel injection** into email HTML
- **EmailOpen record creation** during send
- **Tracking code generation** for each email

### 5. Frontend Real-time Dashboard
- **Live tracking component** with Socket.IO client
- **Real-time open notifications**
- **Campaign-specific tracking**
- **Recent opens display** with animations

## How It Works

1. **Email Creation**: When an email is sent, a unique tracking code is generated
2. **Pixel Injection**: A 1x1 invisible pixel is added to the email HTML
3. **Email Open**: When recipient opens email, mail client loads the pixel
4. **Tracking**: Server logs the open and updates statistics
5. **Real-time Update**: WebSocket event broadcast to connected clients
6. **Dashboard**: Frontend displays live open notifications

## API Endpoints

### Track Email Open
```
GET /api/emails/track/open/:trackingCode
```
- Returns: 1x1 PNG image
- Updates: Email open statistics
- Emits: Real-time open event

## Socket.IO Events

### Client Events
- `joinCampaign`: Join campaign-specific room
- `leaveCampaign`: Leave campaign room

### Server Events
- `emailOpened`: Global email open event
- `campaignEmailOpened`: Campaign-specific open event

## Database Schema

### Email Model
```javascript
{
  trackingCode: String, // Unique tracking identifier
  openCount: Number,    // Total opens
  lastOpenedAt: Date,   // Last open timestamp
}
```

### EmailOpen Model
```javascript
{
  emailId: ObjectId,    // Reference to Email
  trackingCode: String, // Unique tracking code
  openCount: Number,    // Open count
  firstOpenedAt: Date,  // First open timestamp
  lastOpenedAt: Date,   // Last open timestamp
  ipAddress: String,    // Client IP address
  userAgent: String,    // Client user agent
}
```

## Environment Variables

```bash
# Backend
PORT=5000
APP_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_SOCKET_URL=http://localhost:5000
```

## Usage

1. **Start Backend Server**: `npm run dev`
2. **Start Frontend**: `npm run dev`
3. **Send Email**: Use existing email sending functionality
4. **Monitor Opens**: View Campaign Analytics page for real-time tracking

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── email.controller.js     # Updated with tracking
│   ├── models/
│   │   ├── Email.js               # Tracking code generation
│   │   └── EmailOpen.js           # Open tracking model
│   ├── services/
│   │   └── socket.service.js      # WebSocket setup
│   ├── utils/
│   │   └── emailTracking.js       # Tracking utilities
│   ├── routes/
│   │   └── email.routes.js        # Tracking endpoint
│   └── server.js                  # Socket.IO integration
frontend/
├── src/
│   ├── components/
│   │   └── RealtimeTracking.tsx   # Live tracking component
│   └── pages/
│       └── CampaignAnalytics.tsx  # Updated with tracking
```

## Testing

1. Send an email through the application
2. Open the email in a mail client
3. Check the Campaign Analytics page
4. Verify real-time open notifications
5. Monitor browser console for Socket.IO events

## Security Considerations

- **Unique tracking codes** prevent enumeration attacks
- **No-cache headers** ensure accurate tracking
- **IP and user agent logging** for analytics
- **Error handling** prevents broken images

import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 30;
import { createServer } from 'http';
import { zeptoWebhook } from "./webhooks/zeptomail.webhook.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./services/socket.service.js";
import analyticsService from "./services/analytics.service.js";

connectDB();

const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize Socket.IO for real-time tracking
const io = initializeSocket(server);

// Start scheduled analytics updates (every 5 minutes)
analyticsService.startScheduledUpdates();

// ZeptoMail Webhook
app.post("/webhook/zeptomail", zeptoWebhook);

// Make io available to the app for emitting events
app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible on your local network at: http://192.168.0.219:${PORT}`);
  console.log(`Real-time tracking enabled`);
  console.log(`Analytics auto-update enabled (every 5 minutes)`);
});


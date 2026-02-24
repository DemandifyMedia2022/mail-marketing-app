import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected for real-time tracking:', socket.id);

    // Join campaign-specific rooms for targeted updates
    socket.on('joinCampaign', (campaignId) => {
      socket.join(`campaign-${campaignId}`);
      console.log(`Client ${socket.id} joined campaign ${campaignId}`);
    });

    socket.on('leaveCampaign', (campaignId) => {
      socket.leave(`campaign-${campaignId}`);
      console.log(`Client ${socket.id} left campaign ${campaignId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const broadcastEmailOpen = (data) => {
  if (io) {
    // Broadcast to all connected clients
    io.emit('emailOpened', data);
    
    // Also broadcast to campaign-specific room if campaignId exists
    if (data.campaignId) {
      io.to(`campaign-${data.campaignId}`).emit('campaignEmailOpened', data);
    }
  }
};

export const broadcastEmailClick = (data) => {
  if (io) {
    io.emit('emailClicked', data);
    
    if (data.campaignId) {
      io.to(`campaign-${data.campaignId}`).emit('campaignEmailClicked', data);
    }
  }
};

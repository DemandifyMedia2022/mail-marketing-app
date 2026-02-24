import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface RealtimeOpenEvent {
  emailId: string;
  campaignId: string;
  email: string;
  openCount: number;
  timestamp: string;
}

interface RealtimeTrackingProps {
  campaignId?: string;
  onOpenEvent?: (event: RealtimeOpenEvent) => void;
}

const RealtimeTracking: React.FC<RealtimeTrackingProps> = ({ 
  campaignId, 
  onOpenEvent 
}) => {
  const [connected, setConnected] = useState(false);
  const [recentOpens, setRecentOpens] = useState<RealtimeOpenEvent[]>([]);
  const [liveOpenCount, setLiveOpenCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io((import.meta.env?.VITE_SOCKET_URL) || 'http://localhost:5000');

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to real-time tracking server');
      setConnected(true);
      
      // Join campaign room if campaignId provided
      if (campaignId) {
        newSocket.emit('joinCampaign', campaignId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from tracking server');
      setConnected(false);
    });

    // Listen for email open events
    newSocket.on('emailOpened', (event: RealtimeOpenEvent) => {
      console.log('Email opened:', event);
      
      // Update recent opens (keep last 10)
      setRecentOpens(prev => [event, ...prev.slice(0, 9)]);
      setLiveOpenCount(prev => prev + 1);
      
      // Call parent callback if provided
      if (onOpenEvent) {
        onOpenEvent(event);
      }
    });

    // Listen for campaign-specific events
    newSocket.on('campaignEmailOpened', (event: RealtimeOpenEvent) => {
      console.log('Campaign email opened:', event);
      
      // Only update if this is our campaign
      if (event.campaignId === campaignId) {
        setRecentOpens(prev => [event, ...prev.slice(0, 9)]);
        setLiveOpenCount(prev => prev + 1);
        
        if (onOpenEvent) {
          onOpenEvent(event);
        }
      }
    });

    return () => {
      if (campaignId) {
        newSocket.emit('leaveCampaign', campaignId);
      }
      newSocket.close();
    };
  }, [campaignId, onOpenEvent]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!connected) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        🔄 Connecting to real-time tracking...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          margin: 0,
          color: '#1e293b',
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          Live Email Tracking
        </h3>
        <div style={{
          color: '#6b7280',
          fontSize: '12px'
        }}>
          {liveOpenCount} opens detected
        </div>
      </div>

      {recentOpens.length > 0 ? (
        <div>
          <div style={{
            color: '#6b7280',
            fontSize: '12px',
            marginBottom: '10px',
            fontWeight: '500'
          }}>
            Recent Opens:
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {recentOpens.map((open, index) => (
              <div
                key={`${open.emailId}-${index}`}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: index === 0 ? 'slideIn 0.3s ease-out' : 'none'
                }}
              >
                <div>
                  <div style={{
                    color: '#1e293b',
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    {open.email}
                  </div>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '11px'
                  }}>
                    Open #{open.openCount} • {formatTime(open.timestamp)}
                  </div>
                </div>
                <div style={{
                  color: '#10b981',
                  fontSize: '16px'
                }}>
                  👁️
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '13px',
          padding: '20px'
        }}>
          📭 Waiting for email opens...
        </div>
      )}
    </div>
  );
};

export default RealtimeTracking;

import React, { useState, useEffect } from 'react';
import { useDataScheduler } from '../utils/dataScheduler';

const SchedulerDemo: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSchedulerEnabled, setIsSchedulerEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds default

  // Set up scheduler
  const scheduler = useDataScheduler({
    enabled: isSchedulerEnabled,
    interval: refreshInterval,
    immediate: true
  });

  // Add a demo task
  useEffect(() => {
    if (isSchedulerEnabled) {
      scheduler.addTask('demo-task', 'Demo Data Fetch', async () => {
        const timestamp = new Date().toLocaleTimeString();
        const message = `🔄 Auto-refresh at ${timestamp}`;
        
        setLogs(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 logs
        console.log(message);
      }, refreshInterval);
    }
  }, [isSchedulerEnabled, refreshInterval, scheduler]);

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleScheduler = () => {
    setIsSchedulerEnabled(!isSchedulerEnabled);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📅 Data Scheduler Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Controls</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={isSchedulerEnabled}
              onChange={toggleScheduler}
              style={{ marginRight: '8px' }}
            />
            Enable Scheduler
          </label>
          
          <label>
            Interval (ms):
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              min="1000"
              max="60000"
              step="1000"
              disabled={!isSchedulerEnabled}
              style={{ marginLeft: '20px', width: '100px' }}
            />
          </label>
          
          <button onClick={clearLogs} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
            Clear Logs
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Live Logs (Last 10)</h3>
        <div style={{ 
          background: '#f8f9fa', 
          border: '1px solid #e9ecef', 
          borderRadius: '4px', 
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#6c757d', textAlign: 'center' }}>No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px', borderBottom: index < logs.length - 1 ? '1px solid #e9ecef' : 'none' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ 
        background: '#e3f2fd', 
        border: '1px solid #0366d6', 
        borderRadius: '8px', 
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#0366d6', marginBottom: '10px' }}>🎯 How to Use in Your App</h3>
        <ol style={{ marginLeft: '20px', color: '#333' }}>
          <li><strong>Import the scheduler:</strong> <code>import { useDataScheduler } from '../utils/dataScheduler';</code></li>
          <li><strong>Set up scheduler:</strong> <code>const scheduler = useDataScheduler({ enabled: true, interval: 30000 });</code></li>
          <li><strong>Add tasks:</strong> <code>scheduler.addTask('refresh-templates', 'Refresh Templates', refreshTemplates, 30000);</code></li>
          <li><strong>Tasks run automatically:</strong> No manual refresh needed!</li>
          <li><strong>Background updates:</strong> Data updates without disturbing users</li>
          <li><strong>Customizable intervals:</strong> Set any interval from 1 second to 1 hour</li>
        </ol>
      </div>
    </div>
  );
};

export default SchedulerDemo;

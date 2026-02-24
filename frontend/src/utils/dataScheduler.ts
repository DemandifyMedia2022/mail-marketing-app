import { useEffect, useRef } from 'react';

// Scheduler configuration
interface SchedulerConfig {
  interval: number; // in milliseconds
  enabled: boolean;
  immediate?: boolean; // run immediately on mount
}

interface ScheduledTask {
  id: string;
  name: string;
  interval: number;
  lastRun: number;
  isRunning: boolean;
}

/**
 * Custom hook for scheduling periodic data fetching
 */
export const useDataScheduler = (config: SchedulerConfig) => {
  const intervalRef = useRef<number | null>(null);
  const scheduledTasks = useRef<Map<string, ScheduledTask>>(new Map());
  
  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const runTask = async () => {
      const now = Date.now();
      
      // Update all scheduled tasks
      scheduledTasks.current.forEach((task, id) => {
        if (now - task.lastRun >= task.interval) {
          task.lastRun = now;
          task.isRunning = true;
          
          console.log(`🔄 Running scheduled task: ${task.name}`);
          
          // Execute task (this would be defined per task)
          executeTask(id);
        }
      });
    };

    // Run immediately if configured
    if (config.immediate) {
      runTask();
    }

    // Set up interval
    const intervalId = window.setInterval(runTask, config.interval);
    intervalRef.current = intervalId;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config.interval, config.enabled, config.immediate]);

  return {
    addTask: (id: string, name: string, task: () => Promise<void>, interval: number) => {
      scheduledTasks.current.set(id, {
        id,
        name,
        interval,
        lastRun: 0,
        isRunning: false
      });
      
      console.log(`📅 Scheduled task added: ${name} (${interval}ms interval)`);
    },
    
    removeTask: (id: string) => {
      scheduledTasks.current.delete(id);
      console.log(`🗑️ Scheduled task removed: ${id}`);
    },
    
    getTaskStatus: (id: string) => {
      return scheduledTasks.current.get(id);
    },
    
    getAllTasks: () => {
      return Array.from(scheduledTasks.current.values());
    }
  };
};

// Task execution function (to be implemented per task)
const executeTask = async (taskId: string) => {
  try {
    console.log(`🔄 Executing task: ${taskId}`);
    
    // This would be replaced with actual task implementations
    switch (taskId) {
      case 'fetch-emails':
        await fetchEmails();
        break;
      case 'fetch-campaigns':
        await fetchCampaigns();
        break;
      case 'fetch-templates':
        await fetchTemplates();
        break;
      case 'fetch-surveys':
        await fetchSurveys();
        break;
      case 'fetch-analytics':
        await fetchAnalytics();
        break;
      default:
        console.warn(`Unknown task: ${taskId}`);
    }
  } catch (error) {
    console.error(`❌ Task ${taskId} failed:`, error);
  }
};

// Example task implementations (these would be imported from actual services)
const fetchEmails = async () => {
  console.log('📧 Fetching emails...');
  // Implementation would go here
};

const fetchCampaigns = async () => {
  console.log('📊 Fetching campaigns...');
  // Implementation would go here
};

const fetchTemplates = async () => {
  console.log('📋 Fetching templates...');
  // Implementation would go here
};

const fetchSurveys = async () => {
  console.log('📝 Fetching surveys...');
  // Implementation would go here
};

const fetchAnalytics = async () => {
  console.log('📈 Fetching analytics...');
  // Implementation would go here
};

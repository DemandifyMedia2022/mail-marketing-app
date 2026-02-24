import cron from 'node-cron';
import Email from '../models/Email.js';
import EmailOpen from '../models/EmailOpen.js';
import EmailClick from '../models/EmailClick.js';
import Campaign from '../models/Campaign.js';

class AnalyticsService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Calculate comprehensive campaign analytics
   */
  async calculateCampaignAnalytics(campaignId) {
    try {
      // Get all emails for this campaign
      const emails = await Email.find({ campaignId });
      
      if (emails.length === 0) {
        return {
          campaignId,
          totalEmails: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
          openRate: 0,
          clickRate: 0,
          deliveryRate: 0,
          bounceRate: 0,
          failureRate: 0,
          uniqueOpens: 0,
          uniqueClicks: 0,
          totalOpenEvents: 0,
          totalClickEvents: 0,
          lastUpdated: new Date()
        };
      }

      const emailIds = emails.map(e => e._id);

      // Get email opens
      const emailOpens = await EmailOpen.find({
        emailId: { $in: emailIds }
      });

      // Get email clicks
      const emailClicks = await EmailClick.find({
        emailId: { $in: emailIds }
      });

      // Calculate metrics
      const sent = emails.filter(e => e.status === 'sent').length;
      const delivered = emails.filter(e => e.status === 'delivered').length;
      const bounced = emails.filter(e => e.status.includes('bounced')).length;
      const failed = emails.filter(e => e.status === 'failed').length;
      
      const uniqueOpens = emailOpens.length;
      const uniqueClicks = emailClicks.length;
      const totalOpenEvents = emailOpens.reduce((sum, open) => sum + open.openCount, 0);
      const totalClickEvents = emailClicks.reduce((sum, click) => sum + (click.clickCount || 1), 0);

      const totalEmails = emails.length;
      const openRate = sent > 0 ? ((uniqueOpens / sent) * 100).toFixed(2) : 0;
      const clickRate = uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(2) : 0;
      const deliveryRate = totalEmails > 0 ? ((delivered / totalEmails) * 100).toFixed(2) : 0;
      const bounceRate = totalEmails > 0 ? ((bounced / totalEmails) * 100).toFixed(2) : 0;
      const failureRate = totalEmails > 0 ? ((failed / totalEmails) * 100).toFixed(2) : 0;

      return {
        campaignId,
        totalEmails,
        sent,
        delivered,
        opened: uniqueOpens,
        clicked: uniqueClicks,
        bounced,
        failed,
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        deliveryRate: parseFloat(deliveryRate),
        bounceRate: parseFloat(bounceRate),
        failureRate: parseFloat(failureRate),
        uniqueOpens,
        uniqueClicks,
        totalOpenEvents,
        totalClickEvents,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error calculating analytics for campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Update analytics for all campaigns
   */
  async updateAllCampaignAnalytics() {
    try {
      console.log('🔄 Starting analytics update for all campaigns...');
      
      const campaigns = await Campaign.find({});
      
      for (const campaign of campaigns) {
        try {
          const analytics = await this.calculateCampaignAnalytics(campaign._id);
          
          // Update campaign with latest analytics
          await Campaign.findByIdAndUpdate(campaign._id, {
            $set: {
              analytics: analytics
            }
          });
          
          console.log(`✅ Updated analytics for campaign: ${campaign.name || campaign._id}`);
        } catch (error) {
          console.error(`❌ Failed to update analytics for campaign ${campaign._id}:`, error);
        }
      }
      
      console.log('✅ Analytics update completed for all campaigns');
    } catch (error) {
      console.error('❌ Error updating all campaign analytics:', error);
    }
  }

  /**
   * Get real-time analytics for a specific campaign
   */
  async getRealtimeAnalytics(campaignId) {
    try {
      const analytics = await this.calculateCampaignAnalytics(campaignId);
      
      // Also update the campaign record
      await Campaign.findByIdAndUpdate(campaignId, {
        $set: {
          'analytics': analytics,
          'analytics.lastUpdated': new Date()
        }
      });
      
      return analytics;
    } catch (error) {
      console.error(`Error getting realtime analytics for campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Start scheduled analytics updates (every 5 minutes)
   */
  startScheduledUpdates() {
    if (this.isRunning) {
      console.log('⚠️  Analytics scheduler is already running');
      return;
    }

    console.log('🚀 Starting scheduled analytics updates (every 5 minutes)...');
    
    // Run immediately on start
    this.updateAllCampaignAnalytics();
    
    // Schedule to run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      console.log('⏰ Running scheduled analytics update...');
      this.updateAllCampaignAnalytics();
    });
    
    this.isRunning = true;
    console.log('✅ Analytics scheduler started successfully');
  }

  /**
   * Stop scheduled updates
   */
  stopScheduledUpdates() {
    if (!this.isRunning) {
      console.log('⚠️  Analytics scheduler is not running');
      return;
    }
    
    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('🛑 Analytics scheduler stopped');
  }
}

export default new AnalyticsService();

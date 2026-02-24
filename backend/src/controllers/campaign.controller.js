import Campaign from '../models/Campaign.js';
import Email from '../models/Email.js';

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    console.log('📊 Fetching all campaigns...');
    
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${campaigns.length} campaigns`);
    
    res.json({
      success: true,
      data: campaigns,
      message: 'Campaigns retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message
    });
  }
};

// Get campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 Fetching campaign: ${id}`);
    
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    console.log(`✅ Campaign found: ${campaign.name}`);
    
    res.json({
      success: true,
      data: campaign,
      message: 'Campaign retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign',
      error: error.message
    });
  }
};

// Create new campaign
export const createCampaign = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    
    console.log('📝 Creating new campaign:', { name, description, status });
    
    const campaign = new Campaign({
      name,
      description,
      status: status || 'draft',
      startDate,
      endDate
    });
    
    await campaign.save();
    
    console.log(`✅ Campaign created: ${campaign._id}`);
    
    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign',
      error: error.message
    });
  }
};

// Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;
    
    console.log(`📝 Updating campaign: ${id}`);
    
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { name, description, status, startDate, endDate },
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    console.log(`✅ Campaign updated: ${campaign._id}`);
    
    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign',
      error: error.message
    });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting campaign: ${id}`);
    
    const campaign = await Campaign.findByIdAndDelete(id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    console.log(`✅ Campaign deleted: ${campaign._id}`);
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign',
      error: error.message
    });
  }
};

// Get campaign summary (existing function)
export const getCampaignSummary = async (req, res) => {
  try {
    const { campaignId } = req.params;

    console.log(`📊 Getting campaign summary: ${campaignId}`);
    
    const emails = await Email.find({ campaignId });

    const summary = {
      sent: emails.filter(e => e.status === "sent").length,
      failed: emails.filter(e => e.status === "failed").length,
      softBounced: emails.filter(e => e.status === "soft_bounced").length,
      hardBounced: emails.filter(e => e.status === "hard_bounced").length,
    };

    console.log(`✅ Campaign summary generated: ${campaignId}`);

    res.json({
      success: true,
      summary,
      emails,
    });
  } catch (error) {
    console.error('❌ Error getting campaign summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting campaign summary',
      error: error.message
    });
  }
};

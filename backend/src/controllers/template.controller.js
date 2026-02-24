import Template from '../models/Template.js';

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    console.log('📋 Fetching all templates...');
    
    const templates = await Template.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${templates.length} templates`);
    
    res.json({
      success: true,
      data: templates,
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📋 Fetching template: ${id}`);
    
    const template = await Template.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    console.log(`✅ Template found: ${template.name}`);
    
    res.json({
      success: true,
      data: template,
      message: 'Template retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const { name, subject, body, campaignId } = req.body;
    
    console.log('📝 Creating new template:', { name, subject, campaignId });
    
    const template = new Template({
      name,
      subject,
      body,
      campaignId
    });
    
    await template.save();
    
    console.log(`✅ Template created: ${template._id}`);
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, campaignId } = req.body;
    
    console.log(`📝 Updating template: ${id}`);
    
    const template = await Template.findByIdAndUpdate(
      id,
      { name, subject, body, campaignId },
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    console.log(`✅ Template updated: ${template._id}`);
    
    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting template: ${id}`);
    
    const template = await Template.findByIdAndDelete(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    console.log(`✅ Template deleted: ${template._id}`);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

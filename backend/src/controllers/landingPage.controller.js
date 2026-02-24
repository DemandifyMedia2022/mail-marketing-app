import LandingPage from "../models/LandingPage.js";
import Acknowledgement from "../models/Acknowledgement.js";
import Campaign from "../models/Campaign.js";
import FormSubmission from "../models/FormSubmission.js";

/**
 * Create a new landing page
 */
export const createLandingPage = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      contentType,
      content,
      contentUrl,
      campaignId,
      tags,
      thumbnail,
    } = req.body;

    // Validate required fields
    if (!name || !title || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Name, title, and contentType are required",
      });
    }

    // Validate content based on type
    if (contentType === "html" && !content) {
      return res.status(400).json({
        success: false,
        message: "Content is required for HTML landing pages",
      });
    }

    if ((contentType === "iframe" || contentType === "pdf") && !contentUrl) {
      return res.status(400).json({
        success: false,
        message: "Content URL is required for iframe/PDF landing pages",
      });
    }

    // Validate campaign if provided
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }
    }

    const landingPage = new LandingPage({
      name,
      title,
      description,
      contentType,
      content: contentType === "html" ? content : "",
      contentUrl: (contentType === "iframe" || contentType === "pdf") ? contentUrl : "",
      campaignId,
      tags,
      thumbnail,
      createdBy: "admin", // You can modify this to use authenticated user
    });

    await landingPage.save();

    res.status(201).json({
      success: true,
      message: "Landing page created successfully",
      data: landingPage,
    });
  } catch (error) {
    console.error("Create landing page error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating landing page",
      error: error.message,
    });
  }
};

/**
 * Get all landing pages
 */
export const getAllLandingPages = async (req, res) => {
  try {
    const { page = 1, limit = 10, campaignId, isActive, search } = req.query;

    // Build query
    const query = {};
    if (campaignId) query.campaignId = campaignId;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const landingPages = await LandingPage.find(query)
      .populate("campaignId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LandingPage.countDocuments(query);

    res.json({
      success: true,
      data: landingPages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get landing pages error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching landing pages",
      error: error.message,
    });
  }
};

/**
 * Get a single landing page by ID
 */
export const getLandingPageById = async (req, res) => {
  try {
    const { id } = req.params;

    const landingPage = await LandingPage.findById(id).populate("campaignId", "name");

    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    res.json({
      success: true,
      data: landingPage,
    });
  } catch (error) {
    console.error("Get landing page error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching landing page",
      error: error.message,
    });
  }
};

/**
 * Update a landing page
 */
export const updateLandingPage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const landingPage = await LandingPage.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("campaignId", "name");

    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    res.json({
      success: true,
      message: "Landing page updated successfully",
      data: landingPage,
    });
  } catch (error) {
    console.error("Update landing page error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating landing page",
      error: error.message,
    });
  }
};

/**
 * Delete a landing page
 */
export const deleteLandingPage = async (req, res) => {
  try {
    const { id } = req.params;

    const landingPage = await LandingPage.findByIdAndDelete(id);

    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    // Also delete related acknowledgements
    await Acknowledgement.deleteMany({ landingPageId: id });

    res.json({
      success: true,
      message: "Landing page deleted successfully",
    });
  } catch (error) {
    console.error("Delete landing page error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting landing page",
      error: error.message,
    });
  }
};

/**
 * Record an acknowledgement for a landing page view
 */
export const recordAcknowledgement = async (req, res) => {
  try {
    const { landingPageId } = req.params;
    const { emailId, campaignId, recipientEmail } = req.body;

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const referrer = req.headers["referer"] || "";

    // Check if landing page exists
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage || !landingPage.isActive) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found or inactive",
      });
    }

    // Check for existing acknowledgement from same IP within last hour
    const existingAcknowledgement = await Acknowledgement.findOne({
      landingPageId,
      ipAddress,
      acknowledgedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    });

    const isUnique = !existingAcknowledgement;

    // Handle template placeholders - if emailId is a template placeholder, set it to null
    const actualEmailId = (emailId && emailId !== "{{emailId}}") ? emailId : null;
    
    // Handle template placeholders for campaignId as well
    const actualCampaignId = (campaignId && campaignId !== "{{campaignId}}") ? campaignId : null;

    // Create acknowledgement record
    const acknowledgement = new Acknowledgement({
      landingPageId,
      emailId: actualEmailId, // Use null for template placeholders
      campaignId: actualCampaignId, // Use null for template placeholders
      recipientEmail,
      ipAddress,
      userAgent,
      referrer,
      isUnique,
      device: getDeviceType(userAgent),
      browser: getBrowserName(userAgent),
    });

    await acknowledgement.save();

    res.status(201).json({
      success: true,
      message: "Acknowledgement recorded successfully",
      data: acknowledgement,
    });
  } catch (error) {
    console.error("Record acknowledgement error:", error);
    res.status(500).json({
      success: false,
      message: "Error recording acknowledgement",
      error: error.message,
    });
  }
};

/**
 * Get acknowledgements for a landing page
 */
export const getLandingPageAcknowledgements = async (req, res) => {
  try {
    const { landingPageId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Build query
    const query = { landingPageId };
    if (startDate || endDate) {
      query.acknowledgedAt = {};
      if (startDate) query.acknowledgedAt.$gte = new Date(startDate);
      if (endDate) query.acknowledgedAt.$lte = new Date(endDate);
    }

    const acknowledgements = await Acknowledgement.find(query)
      .populate("emailId", "to subject")
      .populate("campaignId", "name")
      .sort({ acknowledgedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Acknowledgement.countDocuments(query);

    // Get statistics
    const stats = await Acknowledgement.aggregate([
      { $match: { landingPageId: mongoose.Types.ObjectId(landingPageId) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueViews: { $sum: { $cond: ["$isUnique", 1, 0] } },
          avgTimeSpent: { $avg: "$timeSpent" },
        },
      },
    ]);

    res.json({
      success: true,
      data: acknowledgements,
      statistics: stats[0] || {
        totalViews: 0,
        uniqueViews: 0,
        avgTimeSpent: 0,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get acknowledgements error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching acknowledgements",
      error: error.message,
    });
  }
};

/**
 * Get acknowledgements for a campaign
 */
export const getCampaignAcknowledgements = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const acknowledgements = await Acknowledgement.find({ campaignId })
      .populate("landingPageId", "name title")
      .populate("emailId", "to subject")
      .sort({ acknowledgedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Acknowledgement.countDocuments({ campaignId });

    res.json({
      success: true,
      data: acknowledgements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get campaign acknowledgements error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching campaign acknowledgements",
      error: error.message,
    });
  }
};

// Helper functions
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
};

const getBrowserName = (userAgent) => {
  if (!userAgent) return "unknown";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  return "Other";
};

/**
 * Submit form data from landing page
 */
export const submitForm = async (req, res) => {
  try {
    const {
      landingPageId,
      emailId,
      campaignId,
      recipientEmail,
      formData,
      submittedAt
    } = req.body;

    // Validate required fields
    if (!landingPageId || !recipientEmail || !formData) {
      return res.status(400).json({
        success: false,
        message: "Landing page ID, recipient email, and form data are required",
      });
    }

    // Verify landing page exists
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    // Validate campaign if provided
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }
    }

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Create form submission
    const formSubmission = new FormSubmission({
      landingPageId,
      emailId,
      campaignId,
      recipientEmail,
      formData,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      ipAddress,
      userAgent
    });

    await formSubmission.save();

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: formSubmission
    });

  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get form submissions for a landing page
 */
export const getFormSubmissions = async (req, res) => {
  try {
    const { landingPageId } = req.params;

    // Validate landing page exists
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    const submissions = await FormSubmission.find({ landingPageId })
      .sort({ submittedAt: -1 })
      .populate('emailId', 'subject')
      .populate('campaignId', 'name');

    res.status(200).json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error("Error fetching form submissions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get form submissions for a campaign
 */
export const getCampaignFormSubmissions = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Validate campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const submissions = await FormSubmission.find({ campaignId })
      .sort({ submittedAt: -1 })
      .populate('emailId', 'subject')
      .populate('campaignId', 'name')
      .populate('landingPageId', 'name title');

    res.status(200).json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error("Error fetching campaign form submissions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

import { Router } from 'express';



import {
  sendEmail,
  saveDraft,
  listTemplates,
  createTemplate,
  deleteTemplate,
  listSentEmails,
  listDraftEmails,
  listTrashedEmails,
  getEmailById,
  moveEmailToTrash,
  deleteCampaign,
  trackOpen,
  trackClick,
  listCampaignsWithStats,
  createCampaign,
  listCampaigns,
  countSentEmails,
  campaignDashboard,
  getBouncedEmails,
  getCampaignStatistics,
  getCampaignSummary,
  getCampaignsWithEnhancedStats,
  checkEmailAcknowledgment,
  getCampaignAnalyticsReport,
  getCampaignEmailOpens,
  getCampaignOpenStats,
  getCampaignEmailsWithAnalytics,
  getCampaignContent,
  serveSurveyForm,
  serveLandingPage,
  getCampaignLandingPageClicks,
  getRealtimeCampaignAnalytics,
  getCachedCampaignAnalytics,
  forceUpdateCampaignAnalytics,
  getAllCampaignsWithAnalytics,
} from '../controllers/email.controller.js';

const router = Router();

router.post('/send', sendEmail);
router.post('/acknowledgment/:campaignId', checkEmailAcknowledgment);
router.post('/draft', saveDraft);

// tracking pixel and click tracking

// 
// templates
router.get('/templates', listTemplates);
router.post('/templates', createTemplate);
router.delete('/templates/:id', deleteTemplate);

// campaigns + analytics
router.get('/campaigns', listCampaigns);
router.get('/campaigns/enhanced-stats', getCampaignsWithEnhancedStats);
router.get('/campaigns/stats', listCampaignsWithStats);
router.get('/campaigns/:campaignId/dashboard', campaignDashboard);
router.get('/campaigns/:campaignId/analytics', getCampaignAnalyticsReport);
router.get('/campaigns/:campaignId/statistics', getCampaignStatistics);
router.get('/campaigns/:campaignId/summary', getCampaignSummary);
router.get(
  "/campaign/:campaignId/dashboard",
  campaignDashboard
);

router.post('/campaigns', createCampaign);

// bounce management
router.get('/bounced-emails', getBouncedEmails);

// simple stats
router.get('/stats/sent-count', countSentEmails);

// folder-style views
router.get('/sent', listSentEmails);
router.get('/drafts', listDraftEmails);
router.get('/trash', listTrashedEmails);

// single email + trash action
router.get('/:id', getEmailById);
router.post('/:id/trash', moveEmailToTrash);

router.get("/track/open/:trackingCode", trackOpen);
router.get("/track/click/:emailId", trackClick);
router.get("/survey/:surveyId/:emailId", serveSurveyForm);
router.get("/landing-page/:landingPageId/:emailId", serveLandingPage);

// Test endpoint for debugging
router.get("/track/test/:emailId", (req, res) => {
  const testUrl = "https://www.google.com";
  const emailId = req.params.emailId;
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
  const trackedUrl = `${baseUrl}/api/emails/track/click/${emailId}?url=${encodeURIComponent(testUrl)}`;
  
  res.json({
    message: "Click tracking test",
    originalUrl: testUrl,
    trackedUrl: trackedUrl,
    testLink: `<a href="${trackedUrl}">Test Link to Google</a>`,
    openPixel: `${baseUrl}/api/emails/track/open/${emailId}`
  });
});

router.get("/campaigns/:campaignId/opens", getCampaignEmailOpens);
router.get("/campaigns/:campaignId/open-stats", getCampaignOpenStats);
router.get("/campaigns/:campaignId/emails", getCampaignEmailsWithAnalytics);
router.get("/campaigns/:campaignId/content", getCampaignContent);
router.get("/campaigns/:campaignId/landing-page-clicks", getCampaignLandingPageClicks);

// Real-time analytics endpoints
router.get("/campaigns/:campaignId/analytics/realtime", getRealtimeCampaignAnalytics);
router.get("/campaigns/:campaignId/analytics/cached", getCachedCampaignAnalytics);
router.post("/campaigns/:campaignId/analytics/update", forceUpdateCampaignAnalytics);
router.get("/campaigns/analytics/all", getAllCampaignsWithAnalytics);

router.delete("/campaigns/:campaignId", deleteCampaign);



export default router;

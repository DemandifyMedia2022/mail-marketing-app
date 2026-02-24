import { Router } from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  submitSurveyResponse,
  getSurveyResponses,
  getSurveyAnalytics,
  submitBasicSurveyResponse,
  getBasicSurveyResponses,
  getSurveyResponsesByCampaign,
  getSurveyResponseByEmail,
  submitSurveyPreviewResponse
} from '../controllers/survey.controller.js';

const router = Router();

// Survey CRUD
router.post('/', createSurvey);
router.get('/', getSurveys);
router.get('/:id', getSurveyById);

// Survey responses
router.post('/responses', submitSurveyResponse);
router.post('/responses/preview', submitSurveyPreviewResponse);
router.get('/:surveyId/responses', getSurveyResponses);
router.get('/:surveyId/analytics', getSurveyAnalytics);

// Basic survey responses
router.post('/responses/basic', submitBasicSurveyResponse);
router.get('/responses/basic', getBasicSurveyResponses);

// Campaign and email specific survey responses
router.get('/campaign/:campaignId/responses', getSurveyResponsesByCampaign);
router.get('/email/:emailId/response', getSurveyResponseByEmail);

export default router;

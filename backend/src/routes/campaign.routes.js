import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignSummary
} from '../controllers/campaign.controller.js';

const router = express.Router();

// GET /api/campaigns - Get all campaigns
router.get('/', getCampaigns);

// GET /api/campaigns/:id - Get campaign by ID
router.get('/:id', getCampaignById);

// POST /api/campaigns - Create new campaign
router.post('/', createCampaign);

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', updateCampaign);

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', deleteCampaign);

// GET /api/campaigns/:campaignId/summary - Get campaign summary
router.get('/:campaignId/summary', getCampaignSummary);

export default router;

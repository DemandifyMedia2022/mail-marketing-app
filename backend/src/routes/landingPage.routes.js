import { Router } from "express";
import {
  createLandingPage,
  getAllLandingPages,
  getLandingPageById,
  updateLandingPage,
  deleteLandingPage,
  recordAcknowledgement,
  getLandingPageAcknowledgements,
  getCampaignAcknowledgements,
  submitForm,
  getFormSubmissions,
  getCampaignFormSubmissions,
} from "../controllers/landingPage.controller.js";

const router = Router();

// Landing page CRUD operations
router.post("/", createLandingPage);
router.get("/", getAllLandingPages);
router.get("/:id", getLandingPageById);
router.put("/:id", updateLandingPage);
router.delete("/:id", deleteLandingPage);

// Acknowledgement operations
router.post("/:landingPageId/acknowledge", recordAcknowledgement);
router.get("/:landingPageId/acknowledgements", getLandingPageAcknowledgements);

// Campaign acknowledgements
router.get("/campaign/:campaignId/acknowledgements", getCampaignAcknowledgements);

// Form submission operations
router.post("/:landingPageId/submit-form", submitForm);
router.get("/:landingPageId/form-submissions", getFormSubmissions);
router.get("/campaign/:campaignId/form-submissions", getCampaignFormSubmissions);

export default router;

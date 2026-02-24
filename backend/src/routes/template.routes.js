import express from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/template.controller.js';

const router = express.Router();

// GET /api/templates - Get all templates
router.get('/', getTemplates);

// GET /api/templates/:id - Get template by ID
router.get('/:id', getTemplateById);

// POST /api/templates - Create new template
router.post('/', createTemplate);

// PUT /api/templates/:id - Update template
router.put('/:id', updateTemplate);

// DELETE /api/templates/:id - Delete template
router.delete('/:id', deleteTemplate);

export default router;

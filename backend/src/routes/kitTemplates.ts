import express from 'express';
import {
  getKitTemplates,
  getKitTemplate,
  createKitTemplate,
  updateKitTemplate,
  deleteKitTemplate
} from '../controllers/kitTemplateController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/kit-templates - Get all kit templates
router.get('/', getKitTemplates);

// GET /api/kit-templates/:id - Get kit template by ID with items
router.get('/:id', getKitTemplate);

// POST /api/kit-templates - Create new kit template
router.post('/', createKitTemplate);

// PUT /api/kit-templates/:id - Update kit template
router.put('/:id', updateKitTemplate);

// DELETE /api/kit-templates/:id - Delete kit template (soft delete)
router.delete('/:id', deleteKitTemplate);

export default router;

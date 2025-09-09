import express from 'express';
import { getRoles, createRole } from '../controllers/roleController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private
router.get('/', getRoles);

// @route   POST /api/roles
// @desc    Create new role
// @access  Private
router.post('/', createRole);

export default router;

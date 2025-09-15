import express from 'express';
import { protect } from '../middleware/auth';
import { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../controllers/roleController';

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private (Admin only)
router.get('/', getRoles);

// @route   GET /api/roles/:id
// @desc    Get role by ID
// @access  Private (Admin only)
router.get('/:id', getRoleById);

// @route   POST /api/roles
// @desc    Create new role
// @access  Private (Admin only)
router.post('/', createRole);

// @route   PUT /api/roles/:id
// @desc    Update role
// @access  Private (Admin only)
router.put('/:id', updateRole);

// @route   DELETE /api/roles/:id
// @desc    Delete role
// @access  Private (Admin only)
router.delete('/:id', deleteRole);

export default router;
import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectBookings,
  getProjectItems
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', getProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', getProjectById);

// @route   GET /api/projects/:id/bookings
// @desc    Get project bookings
// @access  Private
router.get('/:id/bookings', getProjectBookings);

// @route   GET /api/projects/:id/items
// @desc    Get project items
// @access  Private
router.get('/:id/items', getProjectItems);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', deleteProject);

export default router;

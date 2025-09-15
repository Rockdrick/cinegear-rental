import express from 'express';
import { 
  getProjectTeamMembers, 
  addProjectTeamMember, 
  updateProjectTeamMember, 
  removeProjectTeamMember
} from '../controllers/projectTeamController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/projects/:projectId/team
// @desc    Get project team members
// @access  Private
router.get('/:projectId/team', getProjectTeamMembers);

// @route   POST /api/projects/:projectId/team
// @desc    Add team member to project
// @access  Private
router.post('/:projectId/team', addProjectTeamMember);

// @route   PUT /api/projects/:projectId/team/:assignmentId
// @desc    Update project team member
// @access  Private
router.put('/:projectId/team/:assignmentId', updateProjectTeamMember);

// @route   DELETE /api/projects/:projectId/team/:assignmentId
// @desc    Remove team member from project
// @access  Private
router.delete('/:projectId/team/:assignmentId', removeProjectTeamMember);

export default router;

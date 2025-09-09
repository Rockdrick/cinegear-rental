import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', getUserById);

// @route   POST /api/users
// @desc    Create new user
// @access  Private
router.post('/', createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', deleteUser);

export default router;

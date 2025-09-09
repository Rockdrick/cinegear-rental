import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roleId').isInt().withMessage('Role ID must be a valid integer')
], register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Please provide a valid phone number')
], updateProfile);

export default router;

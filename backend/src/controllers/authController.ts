import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { validationResult } from 'express-validator';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roleId: number;
  };
}

// Generate JWT Token
const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role_id',
      [firstName, lastName, email, hashedPassword, roleId]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        roleId: user.role_id
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists with role information
    const result = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.password_hash,
        u.role_id,
        r.name as role_name,
        r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1 AND u.is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user with full role information
    const result = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.role_id,
        r.name as role_name,
        r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.is_active = true
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: {
          id: user.role_id,
          name: user.role_name,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phoneNumber } = req.body;
    const userId = req.user!.id;

    const result = await pool.query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), phone_number = COALESCE($4, phone_number), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, first_name, last_name, email, phone_number, role_id',
      [firstName, lastName, email, phoneNumber, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        roleId: user.role_id
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    });
  }
};

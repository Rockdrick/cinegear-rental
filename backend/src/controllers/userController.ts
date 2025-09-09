import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number, u.is_active, u.created_at,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number, u.is_active, u.created_at,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting user'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private
export const createUser = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Create user endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Update user endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Delete user endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting user'
    });
  }
};

import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name as "firstName", u.last_name as "lastName", u.email, 
             u.phone_number as "phoneNumber", u.is_active as "isActive", u.created_at as "createdAt",
             u.updated_at as "updatedAt", u.address,
             r.id as "roleId", r.name as "roleName"
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

    // Transform the data to match frontend expectations
    const users = result.rows.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      address: row.address,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      role: {
        id: row.roleId,
        name: row.roleName
      }
    }));

    res.json({
      success: true,
      count: users.length,
      users: users
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
    const { firstName, lastName, email, phoneNumber, address, roleId, isActive } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, phone_number, address, role_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, first_name, last_name, email, phone_number, address, is_active, created_at, updated_at
    `, [firstName, lastName, email, phoneNumber || null, address || null, roleId || 3, isActive !== false]);

    // Get the role information
    const roleResult = await pool.query(
      'SELECT id, name FROM roles WHERE id = $1',
      [roleId || 3]
    );

    const user = {
      id: result.rows[0].id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
      phoneNumber: result.rows[0].phone_number,
      address: result.rows[0].address,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      role: {
        id: roleResult.rows[0].id,
        name: roleResult.rows[0].name
      }
    };

    res.status(201).json(user);
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
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, address, roleId, isActive } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, and email are required'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is already taken by another user
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already taken by another user'
      });
    }

    // Update user
    const result = await pool.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, phone_number = $4, 
          address = $5, role_id = $6, is_active = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id, first_name, last_name, email, phone_number, address, is_active, created_at, updated_at
    `, [firstName, lastName, email, phoneNumber || null, address || null, roleId || 3, isActive !== false, id]);

    // Get the role information
    const roleResult = await pool.query(
      'SELECT id, name FROM roles WHERE id = $1',
      [roleId || 3]
    );

    const user = {
      id: result.rows[0].id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
      phoneNumber: result.rows[0].phone_number,
      address: result.rows[0].address,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      role: {
        id: roleResult.rows[0].id,
        name: roleResult.rows[0].name
      }
    };

    res.json(user);
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
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting user'
    });
  }
};

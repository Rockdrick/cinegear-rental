import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
export const getRoles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, permissions, created_at, updated_at
      FROM roles
      ORDER BY name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting roles'
    });
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Role name is required'
      });
    }

    // Check if role already exists
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Role with this name already exists'
      });
    }

    // Create role
    const result = await pool.query(`
      INSERT INTO roles (name, permissions, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, name, permissions, created_at, updated_at
    `, [name, permissions || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating role'
    });
  }
};

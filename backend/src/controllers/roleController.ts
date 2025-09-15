import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin only)
export const getRoles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        permissions,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_groups
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

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private (Admin only)
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        permissions,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_groups
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting role'
    });
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin only)
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !permissions) {
      return res.status(400).json({
        success: false,
        error: 'Name and permissions are required'
      });
    }

    // Check if role name already exists
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Role name already exists'
      });
    }

    const result = await pool.query(`
      INSERT INTO roles (name, description, permissions)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, permissions, created_at as "createdAt", updated_at as "updatedAt"
    `, [name, description || null, JSON.stringify(permissions)]);

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

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin only)
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !permissions) {
      return res.status(400).json({
        success: false,
        error: 'Name and permissions are required'
      });
    }

    // Check if role exists
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if role name already exists (excluding current role)
    const duplicateRole = await pool.query(
      'SELECT id FROM roles WHERE name = $1 AND id != $2',
      [name, id]
    );

    if (duplicateRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Role name already exists'
      });
    }

    const result = await pool.query(`
      UPDATE roles 
      SET name = $1, description = $2, permissions = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, permissions, created_at as "createdAt", updated_at as "updatedAt"
    `, [name, description || null, JSON.stringify(permissions), id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating role'
    });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin only)
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if any users are assigned to this role
    const usersWithRole = await pool.query(
      'SELECT id FROM users WHERE role_id = $1',
      [id]
    );

    if (usersWithRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users'
      });
    }

    await pool.query('DELETE FROM roles WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting role'
    });
  }
};
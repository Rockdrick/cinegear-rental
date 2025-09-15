import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// Middleware to check if user has access to a specific project
export const checkProjectAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = req.params.projectId || req.params.id;

    if (!userId || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Project ID are required'
      });
    }

    // Check if user has global project access
    const userRole = await pool.query(`
      SELECT ug.permissions
      FROM users u
      LEFT JOIN user_groups ug ON u.user_group_id = ug.id
      WHERE u.id = $1
    `, [userId]);

    if (userRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const permissions = userRole.rows[0].permissions;

    // If user has global project access, allow
    if (permissions.view_projects) {
      return next();
    }

    // If user has assigned project access, check if they're assigned to this project
    if (permissions.view_assigned_projects) {
      const assignment = await pool.query(`
        SELECT id FROM project_team_members 
        WHERE project_id = $1 AND user_id = $2
      `, [projectId, userId]);

      if (assignment.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not assigned to this project'
        });
      }

      return next();
    }

    // No project access permissions
    return res.status(403).json({
      success: false,
      error: 'Access denied: No project access permissions'
    });

  } catch (error) {
    console.error('Project access check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error checking project access'
    });
  }
};

// Helper function to get user's assigned project IDs
export const getUserAssignedProjectIds = async (userId: number): Promise<number[]> => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT project_id 
      FROM project_team_members 
      WHERE user_id = $1
    `, [userId]);

    return result.rows.map(row => row.project_id);
  } catch (error) {
    console.error('Error getting user assigned project IDs:', error);
    return [];
  }
};

// Helper function to check if user has global access to projects
export const hasGlobalProjectAccess = async (userId: number): Promise<boolean> => {
  try {
    const result = await pool.query(`
      SELECT ug.permissions
      FROM users u
      LEFT JOIN user_groups ug ON u.user_group_id = ug.id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return false;
    }

    const permissions = result.rows[0].permissions;
    return permissions.view_projects === true;
  } catch (error) {
    console.error('Error checking global project access:', error);
    return false;
  }
};

// Helper function to check if user has global access to kits
export const hasGlobalKitAccess = async (userId: number): Promise<boolean> => {
  try {
    const result = await pool.query(`
      SELECT ug.permissions
      FROM users u
      LEFT JOIN user_groups ug ON u.user_group_id = ug.id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return false;
    }

    const permissions = result.rows[0].permissions;
    return permissions.view_kits === true;
  } catch (error) {
    console.error('Error checking global kit access:', error);
    return false;
  }
};

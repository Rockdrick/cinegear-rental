import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get project team members
// @route   GET /api/projects/:projectId/team
// @access  Private
export const getProjectTeamMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(`
      SELECT 
        ptm.id,
        ptm.project_id as "projectId",
        ptm.user_id as "userId",
        ptm.start_date as "startDate",
        ptm.end_date as "endDate",
        ptm.notes,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        pr.id as "roleId",
        pr.name as "roleName",
        pr.description as "roleDescription"
      FROM project_team_members ptm
      JOIN users u ON ptm.user_id = u.id
      JOIN project_roles pr ON ptm.project_role_id = pr.id
      WHERE ptm.project_id = $1
      ORDER BY ptm.start_date, u.first_name, u.last_name
    `, [projectId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get project team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting project team members'
    });
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:projectId/team
// @access  Private
export const addProjectTeamMember = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, projectRoleId, startDate, endDate, notes } = req.body;

    // Validate required fields
    if (!userId || !projectRoleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'User ID, project role ID, start date, and end date are required'
      });
    }

    // Validate date range
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be before start date'
      });
    }

    // Check for overlapping assignments
    const overlappingAssignment = await pool.query(`
      SELECT id FROM project_team_members 
      WHERE project_id = $1 AND user_id = $2 
      AND (
        (start_date <= $3 AND end_date >= $3) OR
        (start_date <= $4 AND end_date >= $4) OR
        (start_date >= $3 AND end_date <= $4)
      )
    `, [projectId, userId, startDate, endDate]);

    if (overlappingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Team member has overlapping assignments for this date range'
      });
    }

    // Add team member to project
    const result = await pool.query(`
      INSERT INTO project_team_members (project_id, user_id, project_role_id, start_date, end_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, project_id, user_id, project_role_id, start_date, end_date, notes
    `, [projectId, userId, projectRoleId, startDate, endDate, notes || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add project team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding team member to project'
    });
  }
};

// @desc    Update project team member
// @route   PUT /api/projects/:projectId/team/:assignmentId
// @access  Private
export const updateProjectTeamMember = async (req: Request, res: Response) => {
  try {
    const { projectId, assignmentId } = req.params;
    const { projectRoleId, startDate, endDate, notes } = req.body;

    // Validate required fields
    if (!projectRoleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Project role ID, start date, and end date are required'
      });
    }

    // Validate date range
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be before start date'
      });
    }

    // Check if assignment exists
    const existingAssignment = await pool.query(
      'SELECT id, user_id FROM project_team_members WHERE id = $1 AND project_id = $2',
      [assignmentId, projectId]
    );

    if (existingAssignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project team member assignment not found'
      });
    }

    const userId = existingAssignment.rows[0].user_id;

    // Check for overlapping assignments (excluding current assignment)
    const overlappingAssignment = await pool.query(`
      SELECT id FROM project_team_members 
      WHERE project_id = $1 AND user_id = $2 AND id != $3
      AND (
        (start_date <= $4 AND end_date >= $4) OR
        (start_date <= $5 AND end_date >= $5) OR
        (start_date >= $4 AND end_date <= $5)
      )
    `, [projectId, userId, assignmentId, startDate, endDate]);

    if (overlappingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Team member has overlapping assignments for this date range'
      });
    }

    // Update team member assignment
    const result = await pool.query(`
      UPDATE project_team_members 
      SET project_role_id = $1, start_date = $2, end_date = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND project_id = $6
      RETURNING id, project_id, user_id, project_role_id, start_date, end_date, notes
    `, [projectRoleId, startDate, endDate, notes || null, assignmentId, projectId]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update project team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating project team member'
    });
  }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:projectId/team/:assignmentId
// @access  Private
export const removeProjectTeamMember = async (req: Request, res: Response) => {
  try {
    const { projectId, assignmentId } = req.params;

    // Check if assignment exists
    const existingAssignment = await pool.query(
      'SELECT id FROM project_team_members WHERE id = $1 AND project_id = $2',
      [assignmentId, projectId]
    );

    if (existingAssignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project team member assignment not found'
      });
    }

    // Remove team member from project
    await pool.query(
      'DELETE FROM project_team_members WHERE id = $1 AND project_id = $2',
      [assignmentId, projectId]
    );

    res.json({
      success: true,
      message: 'Team member removed from project successfully'
    });
  } catch (error) {
    console.error('Remove project team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing team member from project'
    });
  }
};

// @desc    Get all project roles
// @route   GET /api/project-roles
// @access  Private
export const getProjectRoles = async (req: Request, res: Response) => {
  try {
    console.log('Getting project roles...');
    
    // Test database connection first
    const testResult = await pool.query('SELECT 1 as test');
    console.log('Database connection test:', testResult.rows);
    
    const result = await pool.query(`
      SELECT id, name, description, created_at, updated_at
      FROM project_roles
      ORDER BY name
    `);
    console.log('Project roles query result:', result.rows);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get project roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting project roles: ' + (error instanceof Error ? error.message : String(error))
    });
  }
};

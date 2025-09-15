import { Request, Response } from 'express';
import pool from '../config/database';
import { calculateProjectStatus } from '../utils/projectUtils';
import { hasGlobalProjectAccess, getUserAssignedProjectIds } from '../middleware/projectScopedAccess';

// Placeholder controllers for projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    // Check if user has global project access
    const hasGlobalAccess = await hasGlobalProjectAccess(userId);
    
    let query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.contact_person,
        c.email as client_email,
        c.phone_number as client_phone,
        u.first_name as manager_first_name,
        u.last_name as manager_last_name,
        u.email as manager_email,
        ct.name as contact_name,
        ct.email as contact_email,
        ct.phone_number as contact_phone
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.project_manager_user_id = u.id
      LEFT JOIN contacts ct ON p.contact_id = ct.id
    `;
    
    let result;
    let assignedProjectIds: number[] = [];
    
    // If user doesn't have global access, filter by assigned projects
    if (!hasGlobalAccess) {
      assignedProjectIds = await getUserAssignedProjectIds(userId);
      
      if (assignedProjectIds.length === 0) {
        // User has no assigned projects, return empty array
        return res.json([]);
      }
      
      // Add WHERE clause to filter by assigned projects
      query += ` WHERE p.id = ANY($1) ORDER BY p.name`;
      result = await pool.query(query, [assignedProjectIds]);
    } else {
      query += ` ORDER BY p.name`;
      result = await pool.query(query);
    }
    
    const projects = result.rows.map(row => {
      // Calculate actual status based on dates
      const calculatedStatus = calculateProjectStatus(
        row.start_date,
        row.end_date,
        row.status
      );

      return {
        id: row.id,
        name: row.name,
        client: {
          id: row.client_id,
          name: row.client_name,
          contactPerson: row.contact_person,
          email: row.client_email,
          phoneNumber: row.client_phone
        },
        contact: row.contact_name ? {
          id: row.contact_id,
          name: row.contact_name,
          email: row.contact_email,
          phoneNumber: row.contact_phone
        } : null,
        projectManager: row.project_manager_user_id ? {
          id: row.project_manager_user_id,
          firstName: row.manager_first_name,
          lastName: row.manager_last_name,
          email: row.manager_email
        } : null,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        status: calculatedStatus,
        originalStatus: row.status, // Keep original for reference
        location: row.location,
        budget: row.budget,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, error: 'Server error getting projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      status = 'Planning',
      location,
      budget,
      startDate,
      endDate,
      clientId,
      projectManagerId,
      contactId
    } = req.body;

    // Calculate actual status based on dates
    const calculatedStatus = calculateProjectStatus(startDate, endDate, status);

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const query = `
      INSERT INTO projects (
        name, description, status, location, budget, 
        start_date, end_date, client_id, project_manager_user_id, contact_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      name.trim(),
      description?.trim() || null,
      calculatedStatus, // Use calculated status
      location?.trim() || null,
      budget ? parseFloat(budget) : null,
      startDate || null,
      endDate || null,
      clientId || null,
      projectManagerId || null,
      contactId || null
    ];

    const result = await pool.query(query, values);
    const project = result.rows[0];

    res.status(201).json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        location: project.location,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        clientId: project.client_id,
        projectManagerId: project.project_manager_user_id,
        contactId: project.contact_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating project'
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      location,
      budget,
      startDate,
      endDate,
      clientId,
      projectManagerId,
      contactId
    } = req.body;

    // Calculate actual status based on dates
    const calculatedStatus = calculateProjectStatus(startDate, endDate, status);

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const query = `
      UPDATE projects SET
        name = $1,
        description = $2,
        status = $3,
        location = $4,
        budget = $5,
        start_date = $6,
        end_date = $7,
        client_id = $8,
        project_manager_user_id = $9,
        contact_id = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      name.trim(),
      description?.trim() || null,
      calculatedStatus, // Use calculated status
      location?.trim() || null,
      budget ? parseFloat(budget) : null,
      startDate || null,
      endDate || null,
      clientId || null,
      projectManagerId || null,
      contactId || null,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = result.rows[0];

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        location: project.location,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        clientId: project.client_id,
        projectManagerId: project.project_manager_user_id,
        contactId: project.contact_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating project'
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
};

export const getProjectBookings = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
};

export const getProjectItems = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
};

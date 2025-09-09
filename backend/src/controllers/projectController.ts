import { Request, Response } from 'express';
import pool from '../config/database';
import { calculateProjectStatus } from '../utils/projectUtils';

// Placeholder controllers for projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.contact_person,
        c.email as client_email,
        c.phone_number as client_phone,
        u.first_name as manager_first_name,
        u.last_name as manager_last_name,
        u.email as manager_email
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.project_manager_user_id = u.id
      ORDER BY p.name
    `;
    
    const result = await pool.query(query);
    
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
      projectManagerId
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
        start_date, end_date, client_id, project_manager_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      projectManagerId || null
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
      projectManagerId
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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
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

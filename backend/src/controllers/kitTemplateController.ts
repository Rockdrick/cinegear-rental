import { Request, Response } from 'express';
import pool from '../config/database';
import { hasGlobalKitAccess, getUserAssignedProjectIds } from '../middleware/projectScopedAccess';

// Get all kit templates
export const getKitTemplates = async (req: Request, res: Response) => {
  try {
    console.log('Fetching kit templates...');
    const userId = (req as any).user?.id;
    
    // Check if user has global kit access
    const hasGlobalAccess = await hasGlobalKitAccess(userId);
    
    let query = `
      SELECT 
        kt.id,
        kt.name,
        kt.description,
        kt.created_by,
        kt.created_at,
        kt.updated_at,
        kt.is_active,
        kt.source_type,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        COUNT(kti.item_id) as item_count
      FROM kit_templates kt
      LEFT JOIN users u ON kt.created_by = u.id
      LEFT JOIN kit_template_items kti ON kt.id = kti.kit_template_id
      WHERE kt.is_active = true
    `;
    
    let result;
    
    // If user doesn't have global access, filter by assigned projects
    if (!hasGlobalAccess) {
      const assignedProjectIds = await getUserAssignedProjectIds(userId);
      
      if (assignedProjectIds.length === 0) {
        // User has no assigned projects, return empty array
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Add JOIN to filter by projects that use these kits
      query += `
        AND kt.id IN (
          SELECT DISTINCT pk.kit_template_id 
          FROM project_kits pk 
          WHERE pk.project_id = ANY($1)
        )
      `;
      
      query += `
        GROUP BY kt.id, kt.name, kt.description, kt.created_by, kt.created_at, kt.updated_at, kt.is_active, kt.source_type, u.first_name, u.last_name
        ORDER BY kt.created_at DESC
      `;
      
      result = await pool.query(query, [assignedProjectIds]);
    } else {
      query += `
        GROUP BY kt.id, kt.name, kt.description, kt.created_by, kt.created_at, kt.updated_at, kt.is_active, kt.source_type, u.first_name, u.last_name
        ORDER BY kt.created_at DESC
      `;
      
      result = await pool.query(query);
    }
    
    console.log('Query result:', result.rows.length, 'rows');
    const templates = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active,
      sourceType: row.source_type,
      creatorName: `${row.creator_first_name} ${row.creator_last_name}`,
      itemCount: parseInt(row.item_count) || 0
    }));
    
    res.json({ success: true, count: templates.length, templates });
  } catch (error) {
    console.error('Error fetching kit templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch kit templates' });
  }
};

// Get kit template by ID with items
export const getKitTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get template info
    const templateResult = await pool.query(`
      SELECT 
        kt.id,
        kt.name,
        kt.description,
        kt.created_by,
        kt.created_at,
        kt.updated_at,
        kt.is_active,
        kt.source_type,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM kit_templates kt
      LEFT JOIN users u ON kt.created_by = u.id
      WHERE kt.id = $1 AND kt.is_active = true
    `, [id]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kit template not found' });
    }
    
    const template = templateResult.rows[0];
    
    // Get template items
    const itemsResult = await pool.query(`
      SELECT 
        kti.id,
        kti.quantity,
        i.id as item_id,
        i.name,
        i.make,
        i.model,
        i.serial_number,
        c.name as category_name,
        cond.name as condition_name,
        loc.name as location_name
      FROM kit_template_items kti
      JOIN items i ON kti.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN conditions cond ON i.current_condition_id = cond.id
      LEFT JOIN item_locations loc ON i.item_location_id = loc.id
      WHERE kti.kit_template_id = $1
      ORDER BY i.name
    `, [id]);
    
    const items = itemsResult.rows.map((row: any) => ({
      id: row.id,
      quantity: row.quantity,
      item: {
        id: row.item_id,
        name: row.name,
        make: row.make,
        model: row.model,
        serialNumber: row.serial_number,
        category: { name: row.category_name },
        currentCondition: { name: row.condition_name },
        itemLocation: { name: row.location_name }
      }
    }));
    
    const kitTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      isActive: template.is_active,
      sourceType: template.source_type,
      creatorName: `${template.creator_first_name} ${template.creator_last_name}`,
      items: items
    };
    
    res.json({ success: true, kitTemplate });
  } catch (error) {
    console.error('Error fetching kit template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch kit template' });
  }
};

// Create new kit template
export const createKitTemplate = async (req: Request, res: Response) => {
  try {
    const { name, description, items, createdBy } = req.body;
    
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Name and items are required' });
    }
    
    // Start transaction
    await pool.query('BEGIN');
    
    // Create kit template
    const templateResult = await pool.query(`
      INSERT INTO kit_templates (name, description, created_by, source_type)
      VALUES ($1, $2, $3, 'template')
      RETURNING id, name, description, created_by, created_at, updated_at, is_active, source_type
    `, [name, description, createdBy || 1]);
    
    const template = templateResult.rows[0];
    
    // Add items to template
    for (const item of items) {
      await pool.query(`
        INSERT INTO kit_template_items (kit_template_id, item_id, quantity)
        VALUES ($1, $2, $3)
      `, [template.id, item.itemId, item.quantity || 1]);
    }
    
    await pool.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Kit template created successfully',
      kitTemplate: {
        id: template.id,
        name: template.name,
        description: template.description,
        createdBy: template.created_by,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        isActive: template.is_active,
        sourceType: template.source_type
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating kit template:', error);
    res.status(500).json({ success: false, message: 'Failed to create kit template' });
  }
};

// Update kit template
export const updateKitTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, items } = req.body;
    
    // Start transaction
    await pool.query('BEGIN');
    
    // Update template info
    const templateResult = await pool.query(`
      UPDATE kit_templates 
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_active = true
      RETURNING id, name, description, created_by, created_at, updated_at, is_active, source_type
    `, [name, description, id]);
    
    if (templateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Kit template not found' });
    }
    
    // Remove existing items
    await pool.query('DELETE FROM kit_template_items WHERE kit_template_id = $1', [id]);
    
    // Add new items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await pool.query(`
          INSERT INTO kit_template_items (kit_template_id, item_id, quantity)
          VALUES ($1, $2, $3)
        `, [id, item.itemId, item.quantity || 1]);
      }
    }
    
    await pool.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Kit template updated successfully',
      kitTemplate: templateResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating kit template:', error);
    res.status(500).json({ success: false, message: 'Failed to update kit template' });
  }
};

// Delete kit template (soft delete)
export const deleteKitTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE kit_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kit template not found' });
    }
    
    res.json({
      success: true,
      message: 'Kit template deleted successfully',
      kitTemplate: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting kit template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete kit template' });
  }
};

import { Request, Response } from 'express';
import pool from '../config/database';

// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getItems = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.description as category_description,
        cond.name as condition_name,
        cond.description as condition_description,
        il.name as location_name,
        il.description as location_description
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN conditions cond ON i.current_condition_id = cond.id
      LEFT JOIN item_locations il ON i.item_location_id = il.id
      ORDER BY i.name
    `;
    
    const result = await pool.query(query);
    
    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      make: row.make,
      model: row.model,
      serialNumber: row.serial_number,
      category: {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description
      },
      currentCondition: {
        id: row.current_condition_id,
        name: row.condition_name,
        description: row.condition_description
      },
      itemLocation: row.item_location_id ? {
        id: row.item_location_id,
        name: row.location_name,
        description: row.location_description
      } : null,
      notes: row.notes,
      acquisitionDate: row.acquisition_date,
      purchasePrice: row.purchase_price,
      isRentable: row.is_rentable,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting items'
    });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Get item by ID endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting item'
    });
  }
};

// @desc    Get item history
// @route   GET /api/items/:id/history
// @access  Private
export const getItemHistory = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Get item history endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Get item history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting item history'
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
export const createItem = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Create item endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating item'
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      make,
      model,
      serialNumber,
      categoryId,
      conditionId,
      locationId,
      notes,
      acquisitionDate,
      purchasePrice,
      isRentable,
      isActive
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const query = `
      UPDATE items 
      SET 
        name = $1,
        make = $2,
        model = $3,
        serial_number = $4,
        category_id = $5,
        current_condition_id = $6,
        item_location_id = $7,
        notes = $8,
        acquisition_date = $9,
        purchase_price = $10,
        is_rentable = $11,
        is_active = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      name,
      make || null,
      model || null,
      serialNumber || null,
      categoryId || null,
      conditionId || null,
      locationId || null,
      notes || null,
      acquisitionDate || null,
      purchasePrice || 0,
      isRentable !== undefined ? isRentable : true,
      isActive !== undefined ? isActive : true,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Get the updated item with all relations
    const getItemQuery = `
      SELECT 
        i.*,
        c.name as category_name,
        c.description as category_description,
        cond.name as condition_name,
        cond.description as condition_description,
        il.name as location_name,
        il.description as location_description
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN conditions cond ON i.current_condition_id = cond.id
      LEFT JOIN item_locations il ON i.item_location_id = il.id
      WHERE i.id = $1
    `;

    const itemResult = await pool.query(getItemQuery, [id]);
    const item = itemResult.rows[0];

    const updatedItem = {
      id: item.id,
      name: item.name,
      make: item.make,
      model: item.model,
      serialNumber: item.serial_number,
      category: item.category_id ? {
        id: item.category_id,
        name: item.category_name,
        description: item.category_description
      } : null,
      currentCondition: item.current_condition_id ? {
        id: item.current_condition_id,
        name: item.condition_name,
        description: item.condition_description
      } : null,
      itemLocation: item.item_location_id ? {
        id: item.item_location_id,
        name: item.location_name,
        description: item.location_description
      } : null,
      notes: item.notes,
      acquisitionDate: item.acquisition_date,
      purchasePrice: item.purchase_price,
      isRentable: item.is_rentable,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };

    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating item'
    });
  }
};

// @desc    Update item condition
// @route   PUT /api/items/:id/condition
// @access  Private
export const updateItemCondition = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Update item condition endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Update item condition error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating item condition'
    });
  }
};

// @desc    Update item location
// @route   PUT /api/items/:id/location
// @access  Private
export const updateItemLocation = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Update item location endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Update item location error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating item location'
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      error: 'Delete item endpoint not implemented yet'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting item'
    });
  }
};

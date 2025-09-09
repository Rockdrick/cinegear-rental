import { Request, Response } from 'express';
import pool from '../config/database';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get all conditions
export const getConditions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM conditions ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
};

// Get all item locations
export const getLocations = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM item_locations ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

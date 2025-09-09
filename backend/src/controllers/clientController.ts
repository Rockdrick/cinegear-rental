import { Request, Response } from 'express';
import pool from '../config/database';

export const getClients = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        contact_person,
        email,
        phone_number,
        address,
        notes,
        created_at,
        updated_at
      FROM clients
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    const clients = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phoneNumber: row.phone_number,
      address: row.address,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, error: 'Server error getting clients' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        contact_person,
        email,
        phone_number,
        address,
        notes,
        created_at,
        updated_at
      FROM clients
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const client = result.rows[0];

    res.json({
      id: client.id,
      name: client.name,
      contactPerson: client.contact_person,
      email: client.email,
      phoneNumber: client.phone_number,
      address: client.address,
      notes: client.notes,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting client'
    });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phoneNumber,
      address,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Client name is required'
      });
    }

    const query = `
      INSERT INTO clients (
        name, contact_person, email, phone_number, address, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      name.trim(),
      contactPerson?.trim() || null,
      email?.trim() || null,
      phoneNumber?.trim() || null,
      address?.trim() || null,
      notes?.trim() || null
    ];

    const result = await pool.query(query, values);
    const client = result.rows[0];

    res.status(201).json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        contactPerson: client.contact_person,
        email: client.email,
        phoneNumber: client.phone_number,
        address: client.address,
        notes: client.notes,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating client'
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      email,
      phoneNumber,
      address,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Client name is required'
      });
    }

    const query = `
      UPDATE clients SET
        name = $1,
        contact_person = $2,
        email = $3,
        phone_number = $4,
        address = $5,
        notes = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      name.trim(),
      contactPerson?.trim() || null,
      email?.trim() || null,
      phoneNumber?.trim() || null,
      address?.trim() || null,
      notes?.trim() || null,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const client = result.rows[0];

    res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        contactPerson: client.contact_person,
        email: client.email,
        phoneNumber: client.phone_number,
        address: client.address,
        notes: client.notes,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating client'
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM clients WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting client'
    });
  }
};

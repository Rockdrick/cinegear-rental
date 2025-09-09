import { Request, Response } from 'express';
import pool from '../config/database';

// Get all contacts for a specific client
export const getClientContacts = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    const query = `
      SELECT 
        id,
        client_id,
        name,
        email,
        phone_number,
        position,
        department,
        is_primary,
        notes,
        created_at,
        updated_at
      FROM client_contacts
      WHERE client_id = $1
      ORDER BY is_primary DESC, name
    `;
    
    const result = await pool.query(query, [clientId]);
    
    const contacts = result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phone_number,
      position: row.position,
      department: row.department,
      isPrimary: row.is_primary,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(contacts);
  } catch (error) {
    console.error('Get client contacts error:', error);
    res.status(500).json({ success: false, error: 'Server error getting client contacts' });
  }
};

// Get a specific contact
export const getClientContactById = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    
    const query = `
      SELECT 
        id,
        client_id,
        name,
        email,
        phone_number,
        position,
        department,
        is_primary,
        notes,
        created_at,
        updated_at
      FROM client_contacts
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [contactId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    
    const contact = result.rows[0];
    
    res.json({
      id: contact.id,
      clientId: contact.client_id,
      name: contact.name,
      email: contact.email,
      phoneNumber: contact.phone_number,
      position: contact.position,
      department: contact.department,
      isPrimary: contact.is_primary,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    });
  } catch (error) {
    console.error('Get client contact error:', error);
    res.status(500).json({ success: false, error: 'Server error getting client contact' });
  }
};

// Create a new contact for a client
export const createClientContact = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      position,
      department,
      isPrimary = false,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }

    // If this is being set as primary, unset other primary contacts for this client
    if (isPrimary) {
      await pool.query(
        'UPDATE client_contacts SET is_primary = FALSE WHERE client_id = $1',
        [clientId]
      );
    }

    const query = `
      INSERT INTO client_contacts (
        client_id, name, email, phone_number, position, department, is_primary, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      clientId,
      name.trim(),
      email?.trim() || null,
      phoneNumber?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      isPrimary,
      notes?.trim() || null
    ];

    const result = await pool.query(query, values);
    const contact = result.rows[0];

    res.status(201).json({
      success: true,
      contact: {
        id: contact.id,
        clientId: contact.client_id,
        name: contact.name,
        email: contact.email,
        phoneNumber: contact.phone_number,
        position: contact.position,
        department: contact.department,
        isPrimary: contact.is_primary,
        notes: contact.notes,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });
  } catch (error) {
    console.error('Create client contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating client contact'
    });
  }
};

// Update a client contact
export const updateClientContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      position,
      department,
      isPrimary,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }

    // Get the current contact to check client_id
    const currentContact = await pool.query(
      'SELECT client_id FROM client_contacts WHERE id = $1',
      [contactId]
    );

    if (currentContact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    const clientId = currentContact.rows[0].client_id;

    // If this is being set as primary, unset other primary contacts for this client
    if (isPrimary) {
      await pool.query(
        'UPDATE client_contacts SET is_primary = FALSE WHERE client_id = $1 AND id != $2',
        [clientId, contactId]
      );
    }

    const query = `
      UPDATE client_contacts SET
        name = $1,
        email = $2,
        phone_number = $3,
        position = $4,
        department = $5,
        is_primary = $6,
        notes = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      name.trim(),
      email?.trim() || null,
      phoneNumber?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      isPrimary,
      notes?.trim() || null,
      contactId
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    const contact = result.rows[0];

    res.json({
      success: true,
      contact: {
        id: contact.id,
        clientId: contact.client_id,
        name: contact.name,
        email: contact.email,
        phoneNumber: contact.phone_number,
        position: contact.position,
        department: contact.department,
        isPrimary: contact.is_primary,
        notes: contact.notes,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });
  } catch (error) {
    console.error('Update client contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating client contact'
    });
  }
};

// Delete a client contact
export const deleteClientContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    const query = 'DELETE FROM client_contacts WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [contactId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete client contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting client contact'
    });
  }
};

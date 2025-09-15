import { Request, Response } from 'express';
import pool from '../config/database';

// Get all contacts (independent of clients)
export const getContacts = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.client_id,
        c.name,
        c.email,
        c.phone_number,
        c.position,
        c.department,
        c.is_primary,
        c.notes,
        c.specialties,
        c.website,
        c.created_at,
        c.updated_at,
        cl.name as client_name
      FROM contacts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.name
    `;
    
    const result = await pool.query(query);
    
    const contacts = result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      name: row.name,
      email: row.email,
      phoneNumber: row.phone_number,
      position: row.position,
      department: row.department,
      isPrimary: row.is_primary,
      notes: row.notes,
      specialties: row.specialties,
      website: row.website,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: 'Server error getting contacts' });
  }
};

// Get contacts for a specific client (backward compatibility)
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
        specialties,
        website,
        created_at,
        updated_at
      FROM contacts
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
      specialties: row.specialties,
      website: row.website,
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
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    
    const query = `
      SELECT 
        c.id,
        c.client_id,
        c.name,
        c.email,
        c.phone_number,
        c.position,
        c.department,
        c.is_primary,
        c.notes,
        c.specialties,
        c.website,
        c.created_at,
        c.updated_at,
        cl.name as client_name
      FROM contacts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [contactId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    
    const contact = result.rows[0];
    
    res.json({
      success: true,
      contact: {
        id: contact.id,
        clientId: contact.client_id,
        clientName: contact.client_name,
        name: contact.name,
        email: contact.email,
        phoneNumber: contact.phone_number,
        position: contact.position,
        department: contact.department,
        isPrimary: contact.is_primary,
        notes: contact.notes,
        specialties: contact.specialties,
        website: contact.website,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ success: false, error: 'Server error getting contact' });
  }
};

// Create a new contact (can be independent or linked to a client)
export const createContact = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      position,
      department,
      isPrimary = false,
      notes,
      specialties,
      website,
      clientId // Optional - can be null for independent contacts
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }

    // If this is being set as primary for a client, unset other primary contacts for that client
    if (isPrimary && clientId) {
      await pool.query(
        'UPDATE contacts SET is_primary = FALSE WHERE client_id = $1',
        [clientId]
      );
    }

    const query = `
      INSERT INTO contacts (
        client_id, name, email, phone_number, position, department, is_primary, notes, specialties, website
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      clientId || null,
      name.trim(),
      email?.trim() || null,
      phoneNumber?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      isPrimary,
      notes?.trim() || null,
      specialties?.trim() || null,
      website?.trim() || null
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
        specialties: contact.specialties,
        website: contact.website,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating contact'
    });
  }
};

// Update a contact
export const updateContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      position,
      department,
      isPrimary,
      notes,
      specialties,
      website,
      clientId
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
      'SELECT client_id FROM contacts WHERE id = $1',
      [contactId]
    );

    if (currentContact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // If this is being set as primary for a client, unset other primary contacts for that client
    if (isPrimary && clientId) {
      await pool.query(
        'UPDATE contacts SET is_primary = FALSE WHERE client_id = $1 AND id != $2',
        [clientId, contactId]
      );
    }

    const query = `
      UPDATE contacts SET
        client_id = $1,
        name = $2,
        email = $3,
        phone_number = $4,
        position = $5,
        department = $6,
        is_primary = $7,
        notes = $8,
        specialties = $9,
        website = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      clientId || null,
      name.trim(),
      email?.trim() || null,
      phoneNumber?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      isPrimary,
      notes?.trim() || null,
      specialties?.trim() || null,
      website?.trim() || null,
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
        specialties: contact.specialties,
        website: contact.website,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating contact'
    });
  }
};

// Delete a contact
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    const query = 'DELETE FROM contacts WHERE id = $1 RETURNING id';
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
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting contact'
    });
  }
};
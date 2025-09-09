import express from 'express';
import {
  getClientContacts,
  getClientContactById,
  createClientContact,
  updateClientContact,
  deleteClientContact
} from '../controllers/clientContactController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/client-contacts/:clientId - Get all contacts for a client
router.get('/:clientId', authorize('View Team'), getClientContacts);

// GET /api/client-contacts/contact/:contactId - Get a specific contact
router.get('/contact/:contactId', authorize('View Team'), getClientContactById);

// POST /api/client-contacts/:clientId - Create a new contact for a client
router.post('/:clientId', authorize('Edit Team'), createClientContact);

// PUT /api/client-contacts/contact/:contactId - Update a contact
router.put('/contact/:contactId', authorize('Edit Team'), updateClientContact);

// DELETE /api/client-contacts/contact/:contactId - Delete a contact
router.delete('/contact/:contactId', authorize('Edit Team'), deleteClientContact);

export default router;

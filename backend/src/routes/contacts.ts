import express from 'express';
import { protect } from '../middleware/auth';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getClientContacts
} from '../controllers/contactController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Independent contacts routes
router.get('/', getContacts);
router.get('/:contactId', getContactById);
router.post('/', createContact);
router.put('/:contactId', updateContact);
router.delete('/:contactId', deleteContact);

// Backward compatibility route for client-specific contacts
router.get('/client/:clientId', getClientContacts);

export default router;
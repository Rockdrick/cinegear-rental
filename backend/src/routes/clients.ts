import express from 'express';
import { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient
} from '../controllers/clientController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', getClients);

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', getClientById);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', createClient);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', deleteClient);

export default router;

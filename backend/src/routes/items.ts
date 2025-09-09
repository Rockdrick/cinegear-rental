import express from 'express';
import { 
  getItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem,
  getItemHistory,
  updateItemCondition,
  updateItemLocation
} from '../controllers/itemController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/items
// @desc    Get all items
// @access  Private
router.get('/', getItems);

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Private
router.get('/:id', getItemById);

// @route   GET /api/items/:id/history
// @desc    Get item history
// @access  Private
router.get('/:id/history', getItemHistory);

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', createItem);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', updateItem);

// @route   PUT /api/items/:id/condition
// @desc    Update item condition
// @access  Private
router.put('/:id/condition', updateItemCondition);

// @route   PUT /api/items/:id/location
// @desc    Update item location
// @access  Private
router.put('/:id/location', updateItemLocation);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', deleteItem);

export default router;

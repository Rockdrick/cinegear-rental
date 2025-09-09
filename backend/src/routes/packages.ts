import express from 'express';
import { 
  getPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  deletePackage,
  addItemToPackage,
  removeItemFromPackage,
  bookPackage,
  getPackageAvailability
} from '../controllers/packageController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/packages
// @desc    Get all packages
// @access  Private
router.get('/', getPackages);

// @route   GET /api/packages/:id
// @desc    Get package by ID
// @access  Private
router.get('/:id', getPackageById);

// @route   GET /api/packages/:id/availability
// @desc    Check package availability
// @access  Private
router.get('/:id/availability', getPackageAvailability);

// @route   POST /api/packages
// @desc    Create new package
// @access  Private
router.post('/', createPackage);

// @route   POST /api/packages/:id/items
// @desc    Add item to package
// @access  Private
router.post('/:id/items', addItemToPackage);

// @route   POST /api/packages/:id/book
// @desc    Book entire package
// @access  Private
router.post('/:id/book', bookPackage);

// @route   PUT /api/packages/:id
// @desc    Update package
// @access  Private
router.put('/:id', updatePackage);

// @route   DELETE /api/packages/:id
// @desc    Delete package
// @access  Private
router.delete('/:id', deletePackage);

// @route   DELETE /api/packages/:id/items/:itemId
// @desc    Remove item from package
// @access  Private
router.delete('/:id/items/:itemId', removeItemFromPackage);

export default router;

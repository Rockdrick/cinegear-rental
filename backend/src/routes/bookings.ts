import express from 'express';
import { 
  getBookings, 
  getBookingById, 
  createBooking, 
  updateBooking, 
  deleteBooking,
  checkOutBooking,
  returnBooking,
  getBookingsByDateRange,
  getAvailableItems
} from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private
router.get('/', getBookings);

// @route   GET /api/bookings/available
// @desc    Get available items for date range
// @access  Private
router.get('/available', getAvailableItems);

// @route   GET /api/bookings/range
// @desc    Get bookings by date range
// @access  Private
router.get('/range', getBookingsByDateRange);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', getBookingById);

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', createBooking);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', updateBooking);

// @route   PUT /api/bookings/:id/checkout
// @desc    Check out booking
// @access  Private
router.put('/:id/checkout', checkOutBooking);

// @route   PUT /api/bookings/:id/return
// @desc    Return booking
// @access  Private
router.put('/:id/return', returnBooking);

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', deleteBooking);

export default router;

const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { bookingValidation } = require('../middleware/validation');
const { body } = require('express-validator');

// Static sub-paths MUST come before /:id to avoid Express treating them as params

// GET /bookings/availability/check - Check facility availability
router.get('/availability/check', bookingValidation.availability, BookingController.checkAvailability);

// GET /bookings/user/history - Get bookings for a specific user
router.get('/user/history', bookingValidation.userBookings, BookingController.getUserBookings);

// GET /bookings - Retrieve all bookings
router.get('/', BookingController.getAllBookings);

// GET /bookings/:id - Retrieve a specific booking
router.get('/:id', bookingValidation.getById, BookingController.getBookingById);

// POST /bookings - Create a booking
router.post('/', bookingValidation.create, BookingController.createBooking);

// PUT /bookings/:id - Full update of a booking
router.put('/:id', bookingValidation.update, BookingController.updateBooking);

// PATCH /bookings/:id/status - Status-only update (approve / reject / cancel)
router.patch('/:id/status', [
    body('status').isIn(['confirmed', 'cancelled', 'pending']).withMessage('Status must be confirmed, cancelled, or pending')
], BookingController.patchBookingStatus);

// DELETE /bookings/:id - Cancel a booking (sets status to cancelled)
router.delete('/:id', bookingValidation.getById, BookingController.cancelBooking);

// DELETE /bookings/:id/permanent - Permanently delete a booking
router.delete('/:id/permanent', bookingValidation.getById, BookingController.deleteBooking);

module.exports = router;


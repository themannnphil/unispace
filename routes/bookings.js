const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { bookingValidation } = require('../middleware/validation');

// GET /bookings - Retrieve all bookings
router.get('/', BookingController.getAllBookings);

// GET /bookings/:id - Retrieve a specific booking
router.get('/:id', bookingValidation.getById, BookingController.getBookingById);

// POST /bookings - Create a booking
router.post('/', bookingValidation.create, BookingController.createBooking);

// PUT /bookings/:id - Update a booking
router.put('/:id', bookingValidation.update, BookingController.updateBooking);

// DELETE /bookings/:id - Cancel a booking
router.delete('/:id', bookingValidation.getById, BookingController.cancelBooking);

// Alternative DELETE endpoint for permanent deletion
router.delete('/:id/permanent', bookingValidation.getById, BookingController.deleteBooking);

// GET /availability - Check facility availability by date and time
router.get('/availability/check', bookingValidation.availability, BookingController.checkAvailability);

// GET /bookings/user/:user_id - Get bookings for a specific user
router.get('/user/history', bookingValidation.userBookings, BookingController.getUserBookings);

module.exports = router;

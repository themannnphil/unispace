const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const moment = require('moment');

class BookingController {
    static async getAllBookings(req, res) {
        try {
            const bookings = await Booking.getAll();
            res.json({
                success: true,
                data: bookings,
                message: 'Bookings retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving bookings',
                error: error.message
            });
        }
    }

    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.getById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking,
                message: 'Booking retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving booking',
                error: error.message
            });
        }
    }

    static async createBooking(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const booking = await Booking.create(req.body);
            res.status(201).json({
                success: true,
                data: booking,
                message: 'Booking created successfully'
            });
        } catch (error) {
            if (error.message.includes('Booking conflict')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error creating booking',
                error: error.message
            });
        }
    }

    static async updateBooking(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const booking = await Booking.update(id, req.body);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking,
                message: 'Booking updated successfully'
            });
        } catch (error) {
            if (error.message.includes('Booking conflict')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error updating booking',
                error: error.message
            });
        }
    }

    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.updateStatus(id, 'cancelled');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking,
                message: 'Booking cancelled successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error cancelling booking',
                error: error.message
            });
        }
    }

    static async deleteBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.delete(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking,
                message: 'Booking deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting booking',
                error: error.message
            });
        }
    }

    static async checkAvailability(req, res) {
        try {
            const { facility_id, date } = req.query;

            if (!facility_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'facility_id and date are required'
                });
            }

            const bookedSlots = await Booking.getAvailability(facility_id, date);

            // Generate available 30-minute slots from 8:00 AM to 10:00 PM
            const availableSlots = [];
            const startTime = moment().hour(8).minute(0);
            const endTime = moment().hour(22).minute(0);

            let currentSlot = startTime.clone();
            while (currentSlot.isBefore(endTime)) {
                const slotEnd = currentSlot.clone().add(30, 'minutes');
                const isBooked = bookedSlots.some(booked => {
                    const bookedStart = moment(booked.start_time, 'HH:mm:ss');
                    const bookedEnd = moment(booked.end_time, 'HH:mm:ss');
                    return (
                        (currentSlot.isBetween(bookedStart, bookedEnd, null, '[)')) ||
                        (slotEnd.isBetween(bookedStart, bookedEnd, null, '(]')) ||
                        (bookedStart.isBetween(currentSlot, slotEnd, null, '[)')) ||
                        (bookedEnd.isBetween(currentSlot, slotEnd, null, '(]'))
                    );
                });

                if (!isBooked) {
                    availableSlots.push({
                        start_time: currentSlot.format('HH:mm'),
                        end_time: slotEnd.format('HH:mm')
                    });
                }

                currentSlot = slotEnd;
            }

            res.json({
                success: true,
                data: {
                    facility_id,
                    date,
                    available_slots: availableSlots,
                    booked_slots: bookedSlots
                },
                message: 'Availability retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error checking availability',
                error: error.message
            });
        }
    }

    static async getUserBookings(req, res) {
        try {
            const { user_id } = req.query;

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id is required'
                });
            }

            const bookings = await Booking.getByUser(user_id);
            res.json({
                success: true,
                data: bookings,
                message: 'User bookings retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving user bookings',
                error: error.message
            });
        }
    }

    static async patchBookingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['confirmed', 'cancelled', 'pending'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }

            const booking = await Booking.updateStatus(id, status);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking,
                message: `Booking ${status} successfully`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating booking status',
                error: error.message
            });
        }
    }
}

module.exports = BookingController;

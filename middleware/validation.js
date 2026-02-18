const { body, param, query } = require('express-validator');

const facilityValidation = {
    create: [
        body('name').notEmpty().withMessage('Facility name is required'),
        body('location').notEmpty().withMessage('Location is required'),
        body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
    ],
    update: [
        param('id').isInt().withMessage('Facility ID must be an integer'),
        body('name').optional().notEmpty().withMessage('Facility name cannot be empty'),
        body('location').optional().notEmpty().withMessage('Location cannot be empty'),
        body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
    ],
    getById: [
        param('id').isInt().withMessage('Facility ID must be an integer')
    ]
};

const bookingValidation = {
    create: [
        body('facility_id').isInt({ min: 1 }).withMessage('Facility ID must be a positive integer'),
        body('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
        body('date').isISO8601().withMessage('Date must be a valid date'),
        body('start_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
        body('end_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
        body('status').optional().isIn(['confirmed', 'cancelled', 'pending']).withMessage('Status must be confirmed, cancelled, or pending')
    ],
    update: [
        param('id').isInt().withMessage('Booking ID must be an integer'),
        body('facility_id').optional().isInt({ min: 1 }).withMessage('Facility ID must be a positive integer'),
        body('user_id').optional().isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
        body('date').optional().isISO8601().withMessage('Date must be a valid date'),
        body('start_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
        body('end_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
        body('status').optional().isIn(['confirmed', 'cancelled', 'pending']).withMessage('Status must be confirmed, cancelled, or pending')
    ],
    getById: [
        param('id').isInt().withMessage('Booking ID must be an integer')
    ],
    availability: [
        query('facility_id').isInt({ min: 1 }).withMessage('Facility ID must be a positive integer'),
        query('date').isISO8601().withMessage('Date must be a valid date')
    ],
    userBookings: [
        query('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    ]
};

module.exports = {
    facilityValidation,
    bookingValidation
};

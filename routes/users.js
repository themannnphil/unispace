const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const UserController = require('../controllers/userController');
const { body } = require('express-validator');

// Authentication routes (MUST come before /:id)
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], AuthController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], AuthController.login);

// User management routes (admin only)
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], UserController.createUser);

module.exports = router;

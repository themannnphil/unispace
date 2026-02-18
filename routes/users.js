const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { body } = require('express-validator');

// POST /users/authenticate - Authenticate or create user
router.post('/authenticate', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], UserController.authenticateUser);

// GET /users - Get all users (admin only)
router.get('/', UserController.getAllUsers);

// GET /users/:id - Get specific user
router.get('/:id', UserController.getUserById);

// POST /users - Create new user (admin only)
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], UserController.createUser);

module.exports = router;

const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await User.getAll();
            res.json({
                success: true,
                data: users,
                message: 'Users retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving users',
                error: error.message
            });
        }
    }

    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user,
                message: 'User retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving user',
                error: error.message
            });
        }
    }

    static async createUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { name, email, role = 'user' } = req.body;

            // Check if user already exists
            const existingUser = await User.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            const user = await User.create({ name, email, role });
            res.status(201).json({
                success: true,
                data: user,
                message: 'User created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: error.message
            });
        }
    }

    static async authenticateUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { email, password, role = 'user' } = req.body;

            // For demo purposes, we'll accept any password and create/get user
            // In production, you'd verify password against hashed password
            let user = await User.getByEmail(email);

            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({ 
                    name: email.split('@')[0], 
                    email, 
                    role 
                });
            }

            res.json({
                success: true,
                data: user,
                message: 'Authentication successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Authentication error',
                error: error.message
            });
        }
    }
}

module.exports = UserController;

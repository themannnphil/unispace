const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
    // Register new user with proper password hashing
    static async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { name, email, password, role = 'user' } = req.body;

            // Check if user already exists
            const existingUser = await User.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash the password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user with hashed password
            const user = await User.createWithPassword({ 
                name, 
                email, 
                role, 
                password: hashedPassword 
            });

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json({
                success: true,
                data: userWithoutPassword,
                message: 'User registered successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    }

    // Login with proper password verification
    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user by email
            const user = await User.getByEmailWithPassword(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.json({
                success: true,
                data: userWithoutPassword,
                message: 'Login successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;

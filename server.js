const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes first
const facilitiesRouter = require('./routes/facilities');
const bookingsRouter = require('./routes/bookings');
const usersRouter = require('./routes/users');

app.use('/api/facilities', facilitiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);

// Serve the authenticated version as default (before static files)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index-with-auth.html');
});

// Serve static files
app.use(express.static('public'));

// Fallback to original version if needed
app.get('/original', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API Information
app.get('/api', (req, res) => {
    res.json({
        message: 'UniSpace API - University Facility Booking System',
        version: '1.0.0',
        endpoints: {
            facilities: '/api/facilities',
            bookings: '/api/bookings',
            users: '/api/users'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database setup endpoint for Render
app.post('/api/setup', async (req, res) => {
    try {
        const cleanSetupDatabase = require('./database/clean-setup');
        await cleanSetupDatabase();
        res.json({
            success: true,
            message: 'Database setup completed successfully on Render'
        });
    } catch (error) {
        console.error('Database setup failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database setup failed',
            error: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;

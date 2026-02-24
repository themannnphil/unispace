const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function cleanSetupDatabase() {
    try {
        console.log('Setting up fresh database...');
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Clear existing data first
        await pool.query('DELETE FROM bookings');
        await pool.query('DELETE FROM facilities');
        await pool.query('DELETE FROM users');
        console.log('Cleared existing data');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('Database schema created successfully!');
        
        // Insert only admin account for initial setup
        const adminPassword = await bcrypt.hash('admin123', 12);
        
        await pool.query(`
            INSERT INTO users (name, email, password, role) VALUES
                ('Admin User', 'admin@unispace.local', $1, 'admin')
            ON CONFLICT (email) DO NOTHING
        `, [adminPassword]);

        await pool.query(`
            INSERT INTO facilities (name, location, capacity) VALUES
                ('Computer Lab 101', 'Building A, Floor 1', 30),
                ('Study Room 202', 'Library, Floor 2', 15),
                ('Conference Hall 301', 'Building B, Floor 3', 50),
                ('Lecture Hall 401', 'Building C, Floor 1', 100),
                ('Science Lab 501', 'Science Building, Floor 2', 25),
                ('Art Studio 601', 'Arts Building, Floor 1', 20)
        `);

        console.log('\n=== Initial Setup Complete ===');
        console.log('Admin: admin@unispace.local (password: admin123)');
        console.log('\nNote: Use register tab to create new user accounts');
        console.log('Registration is now open for all users');
        
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    cleanSetupDatabase();
}

module.exports = cleanSetupDatabase;

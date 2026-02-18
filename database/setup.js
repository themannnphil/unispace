const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function setupDatabase() {
    try {
        console.log('Setting up database...');
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('Database setup completed successfully!');
        console.log('Tables created and sample data inserted.');
        
        // Test the setup
        const facilities = await pool.query('SELECT COUNT(*) as count FROM facilities');
        const users = await pool.query('SELECT COUNT(*) as count FROM users');
        const bookings = await pool.query('SELECT COUNT(*) as count FROM bookings');
        
        console.log(`Facilities: ${facilities.rows[0].count}`);
        console.log(`Users: ${users.rows[0].count}`);
        console.log(`Bookings: ${bookings.rows[0].count}`);
        
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;

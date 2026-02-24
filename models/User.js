const pool = require('../config/database');

class User {
    static async getAll() {
        const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async create(userData) {
        const { name, email, role = 'user' } = userData;
        const result = await pool.query(
            'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role',
            [name, email, role]
        );
        return result.rows[0];
    }

    static async createWithPassword(userData) {
        const { name, email, role = 'user', password } = userData;
        
        const result = await pool.query(`
            INSERT INTO users (name, email, role, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name, email, role
        `, [name, email, role, password]);
        
        return result.rows[0];
    }

    static async getByEmailWithPassword(email) {
        const result = await pool.query(`
            SELECT * FROM users WHERE email = $1
        `, [email]);
        return result.rows[0];
    }

    static async update(id, userData) {
        const { name, email, role } = userData;
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role',
            [name, email, role, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = User;

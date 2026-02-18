const pool = require('../config/database');

class Facility {
    static async getAll() {
        const result = await pool.query('SELECT * FROM facilities ORDER BY name');
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query('SELECT * FROM facilities WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(facilityData) {
        const { name, location, capacity } = facilityData;
        const result = await pool.query(
            'INSERT INTO facilities (name, location, capacity) VALUES ($1, $2, $3) RETURNING *',
            [name, location, capacity]
        );
        return result.rows[0];
    }

    static async update(id, facilityData) {
        const { name, location, capacity } = facilityData;
        const result = await pool.query(
            'UPDATE facilities SET name = $1, location = $2, capacity = $3 WHERE id = $4 RETURNING *',
            [name, location, capacity, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = Facility;

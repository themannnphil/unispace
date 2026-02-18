const pool = require('../config/database');
const moment = require('moment');

class Booking {
    static async getAll() {
        const result = await pool.query(`
            SELECT b.*, f.name as facility_name, u.name as user_name, u.email as user_email
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.date, b.start_time
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT b.*, f.name as facility_name, u.name as user_name, u.email as user_email
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async create(bookingData) {
        const { facility_id, user_id, date, start_time, end_time, status = 'confirmed' } = bookingData;
        
        // Check for booking conflicts
        const conflictCheck = await pool.query(`
            SELECT id FROM bookings 
            WHERE facility_id = $1 AND date = $2 
            AND ((start_time <= $3 AND end_time > $3) OR (start_time < $4 AND end_time >= $4) OR (start_time >= $3 AND end_time <= $4))
            AND status != 'cancelled'
        `, [facility_id, date, start_time, end_time]);

        if (conflictCheck.rows.length > 0) {
            throw new Error('Booking conflict: Facility is already booked for this time slot');
        }

        const result = await pool.query(`
            INSERT INTO bookings (facility_id, user_id, date, start_time, end_time, status) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `, [facility_id, user_id, date, start_time, end_time, status]);

        // Return booking with user and facility details
        const bookingWithDetails = await pool.query(`
            SELECT b.*, f.name as facility_name, u.name as user_name, u.email as user_email
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = $1
        `, [result.rows[0].id]);

        return bookingWithDetails.rows[0];
    }

    static async update(id, bookingData) {
        const { facility_id, user_id, date, start_time, end_time, status } = bookingData;
        
        // Check for booking conflicts (excluding current booking)
        const conflictCheck = await pool.query(`
            SELECT id FROM bookings 
            WHERE facility_id = $1 AND date = $2 AND id != $6
            AND ((start_time <= $3 AND end_time > $3) OR (start_time < $4 AND end_time >= $4) OR (start_time >= $3 AND end_time <= $4))
            AND status != 'cancelled'
        `, [facility_id, date, start_time, end_time, id]);

        if (conflictCheck.rows.length > 0) {
            throw new Error('Booking conflict: Facility is already booked for this time slot');
        }

        const result = await pool.query(`
            UPDATE bookings 
            SET facility_id = $1, user_id = $2, date = $3, start_time = $4, end_time = $5, status = $6 
            WHERE id = $7 
            RETURNING *
        `, [facility_id, user_id, date, start_time, end_time, status, id]);

        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getAvailability(facilityId, date) {
        const result = await pool.query(`
            SELECT start_time, end_time 
            FROM bookings 
            WHERE facility_id = $1 AND date = $2 AND status != 'cancelled'
            ORDER BY start_time
        `, [facilityId, date]);

        return result.rows;
    }

    static async getByUser(userId) {
        const result = await pool.query(`
            SELECT b.*, f.name as facility_name 
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.id
            WHERE b.user_id = $1
            ORDER BY b.date DESC, b.start_time DESC
        `, [userId]);
        return result.rows;
    }
}

module.exports = Booking;

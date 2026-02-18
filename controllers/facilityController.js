const Facility = require('../models/Facility');
const { validationResult } = require('express-validator');

class FacilityController {
    static async getAllFacilities(req, res) {
        try {
            const facilities = await Facility.getAll();
            res.json({
                success: true,
                data: facilities,
                message: 'Facilities retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving facilities',
                error: error.message
            });
        }
    }

    static async getFacilityById(req, res) {
        try {
            const { id } = req.params;
            const facility = await Facility.getById(id);

            if (!facility) {
                return res.status(404).json({
                    success: false,
                    message: 'Facility not found'
                });
            }

            res.json({
                success: true,
                data: facility,
                message: 'Facility retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving facility',
                error: error.message
            });
        }
    }

    static async createFacility(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const facility = await Facility.create(req.body);
            res.status(201).json({
                success: true,
                data: facility,
                message: 'Facility created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating facility',
                error: error.message
            });
        }
    }

    static async updateFacility(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const facility = await Facility.update(id, req.body);

            if (!facility) {
                return res.status(404).json({
                    success: false,
                    message: 'Facility not found'
                });
            }

            res.json({
                success: true,
                data: facility,
                message: 'Facility updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating facility',
                error: error.message
            });
        }
    }

    static async deleteFacility(req, res) {
        try {
            const { id } = req.params;
            const facility = await Facility.delete(id);

            if (!facility) {
                return res.status(404).json({
                    success: false,
                    message: 'Facility not found'
                });
            }

            res.json({
                success: true,
                data: facility,
                message: 'Facility deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting facility',
                error: error.message
            });
        }
    }
}

module.exports = FacilityController;

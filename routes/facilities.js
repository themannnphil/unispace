const express = require('express');
const router = express.Router();
const FacilityController = require('../controllers/facilityController');
const { facilityValidation } = require('../middleware/validation');

// GET /facilities - Retrieve all facilities
router.get('/', FacilityController.getAllFacilities);

// GET /facilities/:id - Retrieve a specific facility
router.get('/:id', facilityValidation.getById, FacilityController.getFacilityById);

// POST /facilities - Create a facility (admin functionality)
router.post('/', facilityValidation.create, FacilityController.createFacility);

// PUT /facilities/:id - Update a facility (admin functionality)
router.put('/:id', facilityValidation.update, FacilityController.updateFacility);

// DELETE /facilities/:id - Delete a facility (admin functionality)
router.delete('/:id', facilityValidation.getById, FacilityController.deleteFacility);

module.exports = router;

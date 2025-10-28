const express = require('express');
const router = express.Router();
const seatController = require('../../controllers/seatController');
const { auth, adminMiddleware } = require('../../middleware/auth');

// Get all seats
router.get('/seats', auth, adminMiddleware, (req, res) => seatController.list(req, res));

// Create a seat
router.post('/seat/create', auth, adminMiddleware, (req, res) => seatController.create(req, res));

// Update a seat
router.put('/seat/update/:id', auth, adminMiddleware, (req, res) => seatController.update(req, res));

// Delete (soft) a seat
router.delete('/seat/delete/:id', auth, adminMiddleware, (req, res) => seatController.remove(req, res));

// Get deleted seats
router.get('/seats/deleted', auth, adminMiddleware, (req, res) => seatController.listDeleted(req, res));

// Restore a deleted seat
router.put('/seat/restore/:id', auth, adminMiddleware, (req, res) => seatController.restore(req, res));

// Admin seat status by showtime (and optional theater)
router.get('/seat/showtime/:showtimeId', auth, adminMiddleware, (req, res) => seatController.adminSeatStatus(req, res));

module.exports = router;



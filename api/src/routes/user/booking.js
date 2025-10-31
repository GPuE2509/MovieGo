const express = require('express');
const router = express.Router();
const controller = require('../../controllers/bookingUserController');
const { auth } = require('../../middleware/auth');

// Base: /api/v1/user/bookings
router.post('/', auth, (req, res) => controller.createBooking(req, res));
router.post('/apply-coupon/:bookingId', auth, (req, res) => controller.applyCoupon(req, res));
router.get('/getAllHistoryAward', auth, (req, res) => controller.getAllHistoryAward(req, res));
router.get('/:id', auth, (req, res) => controller.getBookingById(req, res));
router.get('/my-bookings/list', auth, (req, res) => controller.getMyBookings(req, res));
router.post('/reserve/:showtimeId', auth, (req, res) => controller.reserveSeats(req, res));
router.post('/pay/:bookingId', auth, (req, res) => controller.createPayment(req, res));

module.exports = router;



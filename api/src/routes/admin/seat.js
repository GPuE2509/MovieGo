const express = require('express');
const router = express.Router();
const seatController = require('../../controllers/seatController');

/**
 * @swagger
 * tags:
 *   name: AdminSeat
 *   description: Quản lý ghế (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/seats:
 *   get:
 *     summary: Lấy danh sách ghế
 *     tags: [AdminSeat]
 *     responses:
 *       200:
 *         description: Danh sách ghế
 */

/**
 * @swagger
 * /api/v1/admin/seat/create:
 *   post:
 *     summary: Tạo ghế mới
 *     tags: [AdminSeat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo ghế thành công
 */

/**
 * @swagger
 * /api/v1/admin/seat/update/{id}:
 *   put:
 *     summary: Cập nhật ghế
 *     tags: [AdminSeat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật ghế thành công
 */

/**
 * @swagger
 * /api/v1/admin/seat/delete/{id}:
 *   delete:
 *     summary: Xóa ghế
 *     tags: [AdminSeat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa ghế thành công
 *       404:
 *         description: Không tìm thấy ghế
 */

/**
 * @swagger
 * /api/v1/admin/seats/deleted:
 *   get:
 *     summary: Lấy danh sách ghế đã xóa
 *     tags: [AdminSeat]
 *     responses:
 *       200:
 *         description: Danh sách ghế đã xóa
 */

/**
 * @swagger
 * /api/v1/admin/seat/restore/{id}:
 *   put:
 *     summary: Khôi phục ghế đã xóa
 *     tags: [AdminSeat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Khôi phục ghế thành công
 */

/**
 * @swagger
 * /api/v1/admin/seat/showtime/{showtimeId}:
 *   get:
 *     summary: Lấy trạng thái ghế theo suất chiếu
 *     tags: [AdminSeat]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái ghế
 */
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



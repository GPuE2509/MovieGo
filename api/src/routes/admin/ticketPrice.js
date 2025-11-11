const express = require('express');
const router = express.Router();
const ticketPriceController = require('../../controllers/ticketPriceController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { createTicketPriceValidation, updateTicketPriceValidation, ticketPriceQueryValidation } = require('../../dto/request/ticketPriceDto');

/**
 * @swagger
 * tags:
 *   name: AdminTicketPrice
 *   description: Quản lý giá vé (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/ticket-prices:
 *   get:
 *     summary: Lấy danh sách giá vé
 *     tags: [AdminTicketPrice]
 *     responses:
 *       200:
 *         description: Danh sách giá vé
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/{id}:
 *   get:
 *     summary: Lấy thông tin giá vé theo ID
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin giá vé
 *       404:
 *         description: Không tìm thấy giá vé
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/create:
 *   post:
 *     summary: Tạo giá vé mới
 *     tags: [AdminTicketPrice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo giá vé thành công
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/update/{id}:
 *   put:
 *     summary: Cập nhật giá vé
 *     tags: [AdminTicketPrice]
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
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật giá vé thành công
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/delete/{id}:
 *   delete:
 *     summary: Xóa giá vé
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa giá vé thành công
 *       404:
 *         description: Không tìm thấy giá vé
 */

router.get('/ticket-prices', auth, adminMiddleware, ticketPriceQueryValidation, ticketPriceController.getAll);
router.get('/ticket-price/:id', auth, adminMiddleware,ticketPriceQueryValidation, ticketPriceController.getById);
router.post('/ticket-price/create', auth, adminMiddleware, createTicketPriceValidation, ticketPriceController.create);
router.put('/ticket-price/update/:id', auth, adminMiddleware, updateTicketPriceValidation, ticketPriceController.update);
router.delete('/ticket-price/delete/:id', auth, adminMiddleware, ticketPriceController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentManagementController = require('../../controllers/paymentManagementController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { 
  addPaymentMethodValidation, 
  updatePaymentMethodValidation, 
  paymentMethodQueryValidation 
} = require('../../dto/request/paymentManagementDto');

/**
 * @swagger
 * tags:
 *   name: AdminPaymentManagement
 *   description: Quản lý phương thức thanh toán (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/add-payment-method:
 *   post:
 *     summary: Thêm phương thức thanh toán mới
 *     tags: [AdminPaymentManagement]
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
 *         description: Thêm phương thức thanh toán thành công
 */

/**
 * @swagger
 * /api/v1/admin/get-all-payment-method:
 *   get:
 *     summary: Lấy danh sách phương thức thanh toán
 *     tags: [AdminPaymentManagement]
 *     responses:
 *       200:
 *         description: Danh sách phương thức thanh toán
 */

/**
 * @swagger
 * /api/v1/admin/delete-payment-method/{id}:
 *   delete:
 *     summary: Xóa phương thức thanh toán
 *     tags: [AdminPaymentManagement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa phương thức thanh toán thành công
 *       404:
 *         description: Không tìm thấy phương thức thanh toán
 */

// POST /api/v1/admin/add-payment-method
router.post('/add-payment-method', 
  auth, 
  adminMiddleware, 
  addPaymentMethodValidation, 
  paymentManagementController.addPaymentMethod
);

// GET /api/v1/admin/get-all-payment-method
router.get('/get-all-payment-method', 
  auth, 
  adminMiddleware, 
  paymentMethodQueryValidation, 
  paymentManagementController.getAllPaymentMethods
);

// DELETE /api/v1/admin/delete-payment-method/:id
router.delete('/delete-payment-method/:id', 
  auth, 
  adminMiddleware, 
  paymentManagementController.deletePaymentMethod
);

module.exports = router;

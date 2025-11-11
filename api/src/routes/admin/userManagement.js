const express = require("express");
const router = express.Router();
const userManagementController = require("../../controllers/userManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  userQueryValidation,
  updateUserStatusValidation,
  userIdValidation,
} = require("../../dto/request/userDto");
const authController = require('../../controllers/authController');
const {banUserValidation} = require('../../dto/request/authDto');

/**
 * @swagger
 * tags:
 *   name: UserManagement
 *   description: Quản lý người dùng (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [UserManagement]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên/email
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *       401:
 *         description: Không có quyền truy cập
 */

// Get all users (admin) - with pagination, search and filters
router.get(
  "/",
  auth,
  adminMiddleware,
  userQueryValidation,
  userManagementController.getAllUsers
);

// Get user by ID (admin)

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [UserManagement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get(
  "/:id",
  auth,
  adminMiddleware,
  userIdValidation,
  userManagementController.getUserById
);

// Update user status (admin)

/**
 * @swagger
 * /api/v1/admin/users/update/status/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái người dùng
 *     tags: [UserManagement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Trạng thái người dùng đã được cập nhật
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.patch(
  "/update/status/:id",
  auth,
  adminMiddleware,
  updateUserStatusValidation,
  userManagementController.updateUserStatus
);

/**
 * @swagger
 * /api/v1/admin/users/ban:
 *   post:
 *     summary: Ban tài khoản người dùng
 *     tags: [UserManagement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ban tài khoản thành công
 */
router.post('/ban', auth, adminMiddleware, banUserValidation, authController.banUser);

module.exports = router;

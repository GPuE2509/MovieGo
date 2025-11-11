const express = require("express");
const router = express.Router();
const screenManagementController = require("../../controllers/screenManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  screenQueryValidation,
  createScreenValidation,
  updateScreenValidation,
  screenIdValidation,
} = require("../../dto/request/screenDto");

/**
 * @swagger
 * tags:
 *   name: AdminScreen
 *   description: Quản lý màn hình chiếu (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/screens:
 *   get:
 *     summary: Lấy danh sách màn hình chiếu
 *     tags: [AdminScreen]
 *     responses:
 *       200:
 *         description: Danh sách màn hình chiếu
 */

/**
 * @swagger
 * /api/v1/admin/screen/{id}:
 *   get:
 *     summary: Lấy thông tin màn hình chiếu theo ID
 *     tags: [AdminScreen]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin màn hình chiếu
 *       404:
 *         description: Không tìm thấy màn hình chiếu
 */

/**
 * @swagger
 * /api/v1/admin/screens/by-theater/{id}:
 *   get:
 *     summary: Lấy danh sách màn hình chiếu theo rạp
 *     tags: [AdminScreen]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách màn hình chiếu theo rạp
 */

/**
 * @swagger
 * /api/v1/admin/screen/create:
 *   post:
 *     summary: Tạo màn hình chiếu mới
 *     tags: [AdminScreen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               theaterId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo màn hình chiếu thành công
 */

/**
 * @swagger
 * /api/v1/admin/screen/update/{id}:
 *   put:
 *     summary: Cập nhật màn hình chiếu
 *     tags: [AdminScreen]
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
 *     responses:
 *       200:
 *         description: Cập nhật màn hình chiếu thành công
 */

/**
 * @swagger
 * /api/v1/admin/screen/delete/{id}:
 *   delete:
 *     summary: Xóa màn hình chiếu
 *     tags: [AdminScreen]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa màn hình chiếu thành công
 *       404:
 *         description: Không tìm thấy màn hình chiếu
 */

/**
 * @swagger
 * /api/v1/admin/screens/suggest-columns:
 *   get:
 *     summary: Gợi ý số cột tối đa
 *     tags: [AdminScreen]
 *     responses:
 *       200:
 *         description: Số cột tối đa
 */

/**
 * @swagger
 * /api/v1/admin/screens/suggest-rows:
 *   get:
 *     summary: Gợi ý số hàng tối đa
 *     tags: [AdminScreen]
 *     responses:
 *       200:
 *         description: Số hàng tối đa
 */

// Get all screens (admin) - with pagination and search
router.get(
  "/screens",
  auth,
  adminMiddleware,
  screenQueryValidation,
  screenManagementController.getAllScreens
);

// Get screen by ID (admin)
router.get(
  "/screen/:id",
  auth,
  adminMiddleware,
  screenIdValidation,
  screenManagementController.getScreenById
);

// Get screens by Theater ID (admin)
router.get(
  "/screens/by-theater/:id",
  auth,
  adminMiddleware,
  screenIdValidation, // Re-using screenIdValidation as it checks for a valid MongoID in params
  screenManagementController.getScreenByTheaterId
);

// Create new screen (admin)
router.post(
  "/screen/create",
  auth,
  adminMiddleware,
  createScreenValidation,
  screenManagementController.createScreen
);

// Update screen (admin)
router.put(
  "/screen/update/:id",
  auth,
  adminMiddleware,
  updateScreenValidation,
  screenManagementController.updateScreen
);

// Delete screen (admin)
router.delete(
  "/screen/delete/:id",
  auth,
  adminMiddleware,
  screenIdValidation,
  screenManagementController.deleteScreen
);

// Suggest max columns
router.get(
  "/screens/suggest-columns",
  auth,
  adminMiddleware,
  screenManagementController.suggestColumns
);

// Suggest max rows
router.get(
  "/screens/suggest-rows",
  auth,
  adminMiddleware,
  screenManagementController.suggestRows
);

module.exports = router;



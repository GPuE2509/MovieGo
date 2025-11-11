const express = require("express");
const router = express.Router();
const festivalController = require("../../controllers/festivalController");
const upload = require("../../middleware/upload");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  festivalQueryValidation,
  createFestivalValidation,
  updateFestivalValidation,
  festivalIdValidation,
} = require("../../dto/request/festivalDto");

/**
 * @swagger
 * tags:
 *   name: AdminFestival
 *   description: Quản lý lễ hội (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/festivals:
 *   get:
 *     summary: Lấy danh sách lễ hội
 *     tags: [AdminFestival]
 *     responses:
 *       200:
 *         description: Danh sách lễ hội
 */

/**
 * @swagger
 * /api/v1/admin/festival/create:
 *   post:
 *     summary: Tạo lễ hội mới
 *     tags: [AdminFestival]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo lễ hội thành công
 */

/**
 * @swagger
 * /api/v1/admin/festival/update/{id}:
 *   put:
 *     summary: Cập nhật lễ hội
 *     tags: [AdminFestival]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật lễ hội thành công
 */

/**
 * @swagger
 * /api/v1/admin/festival/delete/{id}:
 *   delete:
 *     summary: Xóa lễ hội
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa lễ hội thành công
 *       404:
 *         description: Không tìm thấy lễ hội
 */

// Get all festivals (admin) - with pagination and search
router.get(
  "/festivals",
  auth,
  adminMiddleware,
  festivalQueryValidation,
  festivalController.getAllFestivals
);

// Get festival by ID (admin)
router.get(
  "/festival/:id",
  auth,
  adminMiddleware,
  festivalIdValidation,
  festivalController.getFestivalDetail
);

// Create festival (admin) - multipart/form-data
router.post(
  "/festival/create",
  auth,
  adminMiddleware,
  upload.single("image"),
  createFestivalValidation,
  festivalController.createFestival
);

// Update festival (admin)
router.put(
  "/festival/update/:id",
  auth,
  adminMiddleware,
  // Accept multipart/form-data without files
  upload.single("image"),
  updateFestivalValidation,
  festivalController.updateFestival
);

// Update festival image (admin) - multipart/form-data (use PUT)
router.put(
  "/user/update-festival-image/:id",
  auth,
  adminMiddleware,
  upload.single("image"),
  festivalIdValidation,
  festivalController.updateImageFestival
);

// Delete festival (admin)
router.delete(
  "/festival/delete/:id",
  auth,
  adminMiddleware,
  festivalIdValidation,
  festivalController.deleteFestival
);

// Get top festivals (admin)
router.get(
  "/festivals/top",
  auth,
  adminMiddleware,
  festivalController.getTopFestivals
);

module.exports = router;

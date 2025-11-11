const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/profileController");
const upload = require("../../middleware/upload");
const { auth, userMiddleware } = require("../../middleware/auth");
const {
  updateProfileValidation,
  updateAvatarValidation,
  changePasswordValidation,
  userIdValidation,
} = require("../../dto/request/profileDto");

/**
 * @swagger
 * tags:
 *   name: UserProfile
 *   description: Quản lý thông tin cá nhân người dùng
 */

/**
 * @swagger
 * /api/v1/user/get-profile-user/{id}:
 *   get:
 *     summary: Lấy thông tin cá nhân người dùng
 *     tags: [UserProfile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thông tin cá nhân người dùng
 *       404:
 *         description: Không tìm thấy người dùng
 */

// Get user profile
router.get(
  "/get-profile-user/:id",
  auth,
  userMiddleware,
  userIdValidation,
  profileController.getProfileUser
);

// Update user profile

/**
 * @swagger
 * /api/v1/user/update-profile-user/{id}:
 *   put:
 *     summary: Cập nhật thông tin cá nhân người dùng
 *     tags: [UserProfile]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thông tin cá nhân đã được cập nhật
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.put(
  "/update-profile-user/:id",
  auth,
  userMiddleware,
  upload.none(),
  updateProfileValidation,
  profileController.updateProfileUser
);

// Update user avatar

/**
 * @swagger
 * /api/v1/user/update-avatar-user/{id}:
 *   put:
 *     summary: Cập nhật avatar người dùng
 *     tags: [UserProfile]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar đã được cập nhật
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.put(
  "/update-avatar-user/:id",
  auth,
  userMiddleware,
  upload.single("avatar"),
  updateAvatarValidation,
  profileController.updateAvatarUser
);

// Change user password

/**
 * @swagger
 * /api/v1/user/change-password/{id}:
 *   put:
 *     summary: Đổi mật khẩu người dùng
 *     tags: [UserProfile]
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
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.put(
  "/change-password/:id",
  auth,
  userMiddleware,
  changePasswordValidation,
  profileController.changePassword
);

module.exports = router;

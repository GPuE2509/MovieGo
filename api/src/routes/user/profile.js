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
 *   description: Quản lý thông tin cá nhân người dùng - Hệ thống MovieGo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           maxLength: 100
 *           description: Tên người dùng
 *         lastName:
 *           type: string
 *           maxLength: 100
 *           description: Họ người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email đăng ký (không thể thay đổi)
 *         avatar:
 *           type: string
 *           description: URL avatar từ Cloudinary
 *         phone:
 *           type: string
 *           pattern: '^(03|05|07|08|09)[0-9]{8}$'
 *           description: Số điện thoại Việt Nam (10 chữ số)
 *         address:
 *           type: string
 *           description: Địa chỉ cư trú
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         status:
 *           type: number
 *           example: 200
 *         code:
 *           type: number
 *           example: 200
 *         data:
 *           $ref: '#/components/schemas/UserProfile'
 *     AvatarUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         status:
 *           type: number
 *           example: 200
 *         code:
 *           type: number
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             avatar:
 *               type: string
 *               description: URL avatar mới
 *     PasswordChangeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         status:
 *           type: number
 *           example: 200
 *         code:
 *           type: number
 *           example: 200
 *         data:
 *           type: string
 *           example: "Password changed successfully"
 *     ProfileErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/v1/user/get-profile-user/{id}:
 *   get:
 *     summary: Lấy thông tin cá nhân người dùng
 *     description: |
 *       Lấy thông tin chi tiết của người dùng bao gồm tên, email, avatar, số điện thoại và địa chỉ.
 *
 *       **Lưu ý bảo mật:**
 *       - Chỉ có thể xem thông tin của chính mình
 *       - Cần đăng nhập và có role USER
 *       - ID trong path phải trùng với ID của user đang đăng nhập
 *     tags: [UserProfile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của người dùng
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy thông tin cá nhân thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 firstName: "Nguyễn Văn"
 *                 lastName: "An"
 *                 email: "nguyenvanan@example.com"
 *                 avatar: "https://res.cloudinary.com/moviego/users/507f1f77bcf86cd799439011/avatar.jpg"
 *                 phone: "0901234567"
 *                 address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
 *       400:
 *         description: ID người dùng không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - type: "field"
 *                   value: "invalid_id"
 *                   msg: "Invalid user ID"
 *                   path: "id"
 *                   location: "params"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền truy cập thông tin người dùng khác
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         description: Lỗi server
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
 *     description: |
 *       Cập nhật thông tin cá nhân bao gồm tên, họ, số điện thoại và địa chỉ.
 *
 *       **Quy tắc validation:**
 *       - `firstName`, `lastName`: Bắt buộc, 1-100 ký tự
 *       - `phone`: Tùy chọn, định dạng số điện thoại VN (03|05|07|08|09 + 8 số)
 *       - `address`: Bắt buộc, chuỗi không rỗng
 *       - `email`: Không thể thay đổi thông qua API này
 *     tags: [UserProfile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của người dùng
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Tên người dùng
 *                 example: "Nguyễn Văn"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Họ người dùng
 *                 example: "An"
 *               phone:
 *                 type: string
 *                 pattern: '^(03|05|07|08|09)[0-9]{8}$'
 *                 description: Số điện thoại Việt Nam (tùy chọn)
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 description: Địa chỉ cư trú
 *                 example: "123 Đường Lê Lợi, Quận 1, TP.HCM"
 *           examples:
 *             update_full_info:
 *               summary: Cập nhật đầy đủ thông tin
 *               value:
 *                 firstName: "Trần Thị"
 *                 lastName: "Bình"
 *                 phone: "0987654321"
 *                 address: "456 Nguyễn Huệ, Quận 1, TP.HCM"
 *             update_without_phone:
 *               summary: Cập nhật không có số điện thoại
 *               value:
 *                 firstName: "Lê Văn"
 *                 lastName: "Cường"
 *                 address: "789 Đồng Khởi, Quận 1, TP.HCM"
 *     responses:
 *       200:
 *         description: Cập nhật thông tin cá nhân thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 firstName: "Trần Thị"
 *                 lastName: "Bình"
 *                 email: "tranthib@example.com"
 *                 avatar: "https://res.cloudinary.com/moviego/users/avatar.jpg"
 *                 phone: "0987654321"
 *                 address: "456 Nguyễn Huệ, Quận 1, TP.HCM"
 *       400:
 *         description: Lỗi validation dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Lỗi validation
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       value: ""
 *                       msg: "First name is required"
 *                       path: "firstName"
 *                       location: "body"
 *                     - type: "field"
 *                       value: "123456789"
 *                       msg: "Invalid phone number format"
 *                       path: "phone"
 *                       location: "body"
 *               business_logic_error:
 *                 summary: Lỗi logic nghiệp vụ
 *                 value:
 *                   success: false
 *                   message: "Failed to update user profile: Address is required"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền cập nhật thông tin người dùng khác
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
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
 *     description: |
 *       Upload và cập nhật ảnh đại diện cho người dùng. Ảnh sẽ được lưu trữ trên Cloudinary.
 *
 *       **Yêu cầu file:**
 *       - Format: JPG, PNG, GIF
 *       - Kích thước: Tối đa 5MB (được xử lý bởi Multer middleware)
 *       - File sẽ được upload vào folder `users/{userId}` trên Cloudinary
 *
 *       **Quy trình xử lý:**
 *       1. Validate user ID và quyền truy cập
 *       2. Upload ảnh lên Cloudinary
 *       3. Cập nhật URL avatar trong database
 *       4. Trả về URL avatar mới
 *     tags: [UserProfile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của người dùng
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh đại diện (JPG, PNG, GIF)
 *           encoding:
 *             avatar:
 *               contentType: image/jpeg, image/png, image/gif
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarUpdateResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 avatar: "https://res.cloudinary.com/moviego/users/507f1f77bcf86cd799439011/avatar_new.jpg"
 *       400:
 *         description: Lỗi validation hoặc upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             examples:
 *               no_file:
 *                 summary: Không có file được upload
 *                 value:
 *                   success: false
 *                   message: "Avatar file cannot be empty"
 *               invalid_user_id:
 *                 summary: ID không hợp lệ
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       value: "invalid_id"
 *                       msg: "Invalid user ID"
 *                       path: "id"
 *                       location: "params"
 *               upload_failed:
 *                 summary: Lỗi upload Cloudinary
 *                 value:
 *                   success: false
 *                   message: "Failed to upload avatar: Cloudinary error"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền cập nhật avatar của người dùng khác
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         description: Lỗi server hoặc Cloudinary
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
 *     description: |
 *       Thay đổi mật khẩu của người dùng với xác thực mật khẩu cũ.
 *
 *       **Quy trình bảo mật:**
 *       1. Xác thực mật khẩu cũ bằng bcrypt
 *       2. Kiểm tra mật khẩu mới và xác nhận khớp nhau
 *       3. Hash mật khẩu mới với bcrypt (salt rounds = 10)
 *       4. Cập nhật trong database
 *
 *       **Yêu cầu mật khẩu:**
 *       - Độ dài: 6-255 ký tự
 *       - Mật khẩu mới phải khác mật khẩu cũ
 *       - confirmNewPassword phải trùng với newPassword
 *     tags: [UserProfile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của người dùng
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Mật khẩu hiện tại
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 255
 *                 description: Mật khẩu mới (6-255 ký tự)
 *                 example: "newpassword456"
 *               confirmNewPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 255
 *                 description: Xác nhận mật khẩu mới (phải trùng với newPassword)
 *                 example: "newpassword456"
 *           examples:
 *             valid_password_change:
 *               summary: Đổi mật khẩu hợp lệ
 *               value:
 *                 oldPassword: "myoldpassword123"
 *                 newPassword: "mynewpassword456"
 *                 confirmNewPassword: "mynewpassword456"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordChangeResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data: "Password changed successfully"
 *       400:
 *         description: Lỗi validation hoặc mật khẩu không khớp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Lỗi validation
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       value: "123"
 *                       msg: "Password must be between 6 and 255 characters"
 *                       path: "newPassword"
 *                       location: "body"
 *               password_mismatch:
 *                 summary: Mật khẩu xác nhận không khớp
 *                 value:
 *                   success: false
 *                   message: "New password and confirm password do not match"
 *       401:
 *         description: Mật khẩu cũ không đúng hoặc chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: Chưa đăng nhập
 *                 value:
 *                   success: false
 *                   message: "Access denied. No token provided"
 *               wrong_old_password:
 *                 summary: Mật khẩu cũ sai
 *                 value:
 *                   success: false
 *                   message: "Old password is incorrect"
 *       403:
 *         description: Không có quyền đổi mật khẩu của người dùng khác
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         description: Lỗi server
 */
router.put(
  "/change-password/:id",
  auth,
  userMiddleware,
  changePasswordValidation,
  profileController.changePassword
);

module.exports = router;

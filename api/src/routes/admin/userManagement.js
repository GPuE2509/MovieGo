const express = require("express");
const router = express.Router();
const userManagementController = require("../../controllers/userManagementController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  userQueryValidation,
  updateUserStatusValidation,
  userIdValidation,
} = require("../../dto/request/userDto");
const authController = require("../../controllers/authController");
const { banUserValidation } = require("../../dto/request/authDto");

/**
 * @swagger
 * tags:
 *   name: AdminUserManagement
 *   description: Quản lý người dùng cho Admin - Hệ thống MovieGo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID của người dùng
 *         firstName:
 *           type: string
 *           maxLength: 100
 *           description: Tên
 *         lastName:
 *           type: string
 *           maxLength: 100
 *           description: Họ
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email đăng ký
 *         avatar:
 *           type: string
 *           description: URL avatar (Cloudinary)
 *         phone:
 *           type: string
 *           pattern: '^(03|05|07|08|09)[0-9]{8}$'
 *           maxLength: 11
 *           description: Số điện thoại Việt Nam
 *         address:
 *           type: string
 *           description: Địa chỉ
 *         status:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *           description: Trạng thái tài khoản
 *         points:
 *           type: number
 *           minimum: 0
 *           description: Điểm tích lũy
 *         banUntil:
 *           type: string
 *           format: date-time
 *           description: Thời gian hết hạn ban (nếu bị ban)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo tài khoản
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách vai trò của người dùng
 *     UserPaginationResponse:
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
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             totalElements:
 *               type: number
 *               description: Tổng số người dùng
 *             totalPages:
 *               type: number
 *               description: Tổng số trang
 *             size:
 *               type: number
 *               description: Kích thước trang
 *             number:
 *               type: number
 *               description: Số trang hiện tại
 *             first:
 *               type: boolean
 *               description: Có phải trang đầu tiên không
 *             last:
 *               type: boolean
 *               description: Có phải trang cuối cùng không
 *             hasNext:
 *               type: boolean
 *               description: Có trang tiếp theo không
 *             hasPrevious:
 *               type: boolean
 *               description: Có trang trước đó không
 *             numberOfElements:
 *               type: number
 *               description: Số phần tử trong trang hiện tại
 *     UserResponse:
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
 *           $ref: '#/components/schemas/User'
 *     UserErrorResponse:
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
 * /api/v1/admin/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     description: Lấy danh sách người dùng với phân trang, tìm kiếm và lọc theo trạng thái. Chỉ dành cho Admin. Hệ thống tự động cập nhật trạng thái cho các user hết hạn ban.
 *     tags: [AdminUserManagement]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Số trang (bắt đầu từ 0)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng người dùng trên mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tên, họ hoặc email
 *         example: "john@example.com"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *         description: Lọc theo trạng thái tài khoản
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, first_name, last_name, email, point]
 *           default: created_at
 *         description: Trường để sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPaginationResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 content:
 *                   - id: "507f1f77bcf86cd799439011"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     email: "john@example.com"
 *                     avatar: "https://res.cloudinary.com/moviego/users/john_avatar.jpg"
 *                     phone: "0901234567"
 *                     address: "123 Nguyễn Văn Linh, Hà Nội"
 *                     status: "ACTIVE"
 *                     points: 1500
 *                     banUntil: null
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     updatedAt: "2024-01-20T14:25:00Z"
 *                     roles: ["USER"]
 *                 totalElements: 150
 *                 totalPages: 15
 *                 size: 10
 *                 number: 0
 *                 first: true
 *                 last: false
 *                 hasNext: true
 *                 hasPrevious: false
 *                 numberOfElements: 10
 *       400:
 *         description: Lỗi validation tham số
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
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
 *     summary: Lấy thông tin chi tiết người dùng theo ID
 *     description: Lấy thông tin đầy đủ của một người dùng theo ID. Hệ thống tự động kiểm tra và cập nhật trạng thái nếu hết hạn ban.
 *     tags: [AdminUserManagement]
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
 *         description: Lấy thông tin người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 id: "507f1f77bcf86cd799439011"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 avatar: "https://res.cloudinary.com/moviego/users/john_avatar.jpg"
 *                 phone: "0901234567"
 *                 address: "123 Nguyễn Văn Linh, Hà Nội"
 *                 status: "ACTIVE"
 *                 points: 1500
 *                 banUntil: null
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-20T14:25:00Z"
 *                 roles: ["USER"]
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         description: Lỗi server
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
 *     description: |
 *       Cập nhật trạng thái tài khoản người dùng. Có thể kích hoạt hoặc chặn tài khoản.
 *
 *       Các trạng thái hợp lệ:
 *       - ACTIVE: Tài khoản hoạt động bình thường
 *       - BLOCKED: Tài khoản bị chặn (có thể set thời gian ban)
 *
 *       Khi chặn tài khoản có thể set `ban_until` để tự động mở khóa sau thời gian nhất định.
 *     tags: [AdminUserManagement]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *                 description: Trạng thái mới của tài khoản
 *                 example: "BLOCKED"
 *               ban_until:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian hết hạn ban (chỉ áp dụng khi status = BLOCKED)
 *                 example: "2025-12-31T23:59:59.000Z"
 *           examples:
 *             block_permanently:
 *               summary: Chặn vĩnh viễn
 *               value:
 *                 status: "BLOCKED"
 *             block_temporary:
 *               summary: Chặn có thời hạn
 *               value:
 *                 status: "BLOCKED"
 *                 ban_until: "2025-12-31T23:59:59.000Z"
 *             activate:
 *               summary: Kích hoạt lại tài khoản
 *               value:
 *                 status: "ACTIVE"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 id: "507f1f77bcf86cd799439011"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 status: "BLOCKED"
 *                 banUntil: "2025-12-31T23:59:59.000Z"
 *                 updatedAt: "2024-01-20T14:25:00Z"
 *       400:
 *         description: Lỗi validation hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - type: "field"
 *                   value: "INVALID_STATUS"
 *                   msg: "Status must be ACTIVE or BLOCKED"
 *                   path: "status"
 *                   location: "body"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
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
 *     summary: Ban tài khoản người dùng theo email
 *     description: |
 *       Chặn (ban) tài khoản người dùng thông qua email. Endpoint này cho phép Admin nhanh chóng chặn một tài khoản
 *       mà không cần biết ID của người dùng, chỉ cần email.
 *
 *       Tài khoản sẽ được chuyển sang trạng thái BLOCKED và không thể đăng nhập cho đến khi được mở khóa.
 *     tags: [AdminUserManagement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email của tài khoản cần ban
 *                 example: "user@example.com"
 *               ban_until:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian hết hạn ban (tùy chọn). Nếu không có, ban vĩnh viễn
 *                 example: "2025-12-31T23:59:59.000Z"
 *               reason:
 *                 type: string
 *                 description: Lý do ban tài khoản (tùy chọn)
 *                 example: "Vi phạm điều khoản sử dụng"
 *           examples:
 *             permanent_ban:
 *               summary: Ban vĩnh viễn
 *               value:
 *                 email: "violator@example.com"
 *                 reason: "Vi phạm nghiêm trọng điều khoản"
 *             temporary_ban:
 *               summary: Ban có thời hạn
 *               value:
 *                 email: "spammer@example.com"
 *                 ban_until: "2025-12-31T23:59:59.000Z"
 *                 reason: "Spam nhiều lần"
 *     responses:
 *       200:
 *         description: Ban tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User banned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     status:
 *                       type: string
 *                       example: "BLOCKED"
 *                     banUntil:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-31T23:59:59.000Z"
 *       400:
 *         description: Lỗi validation hoặc email không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - type: "field"
 *                   value: "invalid-email"
 *                   msg: "Must be a valid email"
 *                   path: "email"
 *                   location: "body"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy người dùng với email này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found with this email"
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/ban",
  auth,
  adminMiddleware,
  banUserValidation,
  authController.banUser
);

module.exports = router;

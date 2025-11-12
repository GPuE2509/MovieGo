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
 *   description: Quản lý lễ hội cho Admin - Hệ thống MovieGo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Festival:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID của lễ hội
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Tiêu đề lễ hội
 *         image:
 *           type: string
 *           description: URL hình ảnh lễ hội (Cloudinary)
 *         location:
 *           type: string
 *           maxLength: 255
 *           description: Địa điểm tổ chức
 *         description:
 *           type: string
 *           description: Mô tả chi tiết lễ hội
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Thời gian bắt đầu (phải từ hiện tại trở đi)
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Thời gian kết thúc (phải sau thời gian bắt đầu)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *     FestivalPaginationResponse:
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
 *                 $ref: '#/components/schemas/Festival'
 *             totalElements:
 *               type: number
 *               description: Tổng số phần tử
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
 *             numberOfElements:
 *               type: number
 *               description: Số phần tử trong trang hiện tại
 *     FestivalResponse:
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
 *           oneOf:
 *             - $ref: '#/components/schemas/Festival'
 *             - type: string
 *         message:
 *           type: string
 *     FestivalErrorResponse:
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
 * /api/v1/admin/festivals:
 *   get:
 *     summary: Lấy danh sách tất cả lễ hội
 *     description: Lấy danh sách lễ hội với phân trang, tìm kiếm và sắp xếp. Chỉ dành cho Admin.
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Số trang (bắt đầu từ 0)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng lễ hội trên mỗi trang
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           enum: [title, start_time, end_time, created_at]
 *           default: title
 *         description: Trường để sắp xếp
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tiêu đề lễ hội
 *         example: "Tết Nguyên Đán"
 *     responses:
 *       200:
 *         description: Lấy danh sách lễ hội thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalPaginationResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 content:
 *                   - id: "507f1f77bcf86cd799439011"
 *                     title: "Lễ hội Tết Nguyên Đán 2025"
 *                     image: "https://res.cloudinary.com/moviego/festivals/tet2025.jpg"
 *                     location: "Hà Nội"
 *                     description: "Lễ hội truyền thống đón Tết Nguyên Đán"
 *                     startTime: "2025-01-28T00:00:00Z"
 *                     endTime: "2025-02-05T23:59:59Z"
 *                 totalElements: 25
 *                 totalPages: 3
 *                 size: 10
 *                 number: 0
 *                 first: true
 *                 last: false
 *                 numberOfElements: 10
 *       400:
 *         description: Lỗi validation tham số
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/festival/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết lễ hội theo ID
 *     description: Lấy thông tin đầy đủ của một lễ hội theo ID
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của lễ hội
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy thông tin lễ hội thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Festival'
 *             example:
 *               success: true
 *               data:
 *                 id: "507f1f77bcf86cd799439011"
 *                 title: "Lễ hội Tết Nguyên Đán 2025"
 *                 image: "https://res.cloudinary.com/moviego/festivals/tet2025.jpg"
 *                 location: "Hà Nội"
 *                 description: "Lễ hội truyền thống đón Tết Nguyên Đán"
 *                 startTime: "2025-01-28T00:00:00Z"
 *                 endTime: "2025-02-05T23:59:59Z"
 *       404:
 *         description: Không tìm thấy lễ hội
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/festival/create:
 *   post:
 *     summary: Tạo lễ hội mới
 *     description: Tạo lễ hội mới với thông tin và hình ảnh. Hỗ trợ upload file hình ảnh lên Cloudinary.
 *     tags: [AdminFestival]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start_time
 *               - end_time
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Tiêu đề lễ hội
 *                 example: "Lễ hội Tết Nguyên Đán 2025"
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết lễ hội
 *                 example: "Lễ hội truyền thống đón Tết Nguyên Đán với nhiều hoạt động văn hóa"
 *               location:
 *                 type: string
 *                 maxLength: 255
 *                 description: Địa điểm tổ chức
 *                 example: "Hà Nội"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian bắt đầu (phải từ hiện tại trở đi)
 *                 example: "2025-01-28T00:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian kết thúc (phải sau thời gian bắt đầu)
 *                 example: "2025-02-05T23:59:59Z"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh lễ hội (JPG, PNG, GIF). Tùy chọn - nếu không upload file, hệ thống sẽ dùng ảnh mặc định.
 *                 x-mimetype: "image/jpeg,image/png,image/gif"
 *     responses:
 *       201:
 *         description: Tạo lễ hội thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalResponse'
 *             example:
 *               success: true
 *               status: 201
 *               code: 201
 *               data: "Festival created successfully"
 *       400:
 *         description: Lỗi validation hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error: The end time must not be less than the start time."
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi upload hình ảnh hoặc lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/festival/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin lễ hội
 *     description: Cập nhật thông tin lễ hội. Hỗ trợ cập nhật cả hình ảnh thông qua multipart/form-data.
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của lễ hội
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Tiêu đề lễ hội (tùy chọn)
 *                 example: "Lễ hội Tết Nguyên Đán 2025 - Cập nhật"
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết lễ hội (tùy chọn)
 *                 example: "Lễ hội truyền thống đón Tết với nhiều hoạt động mới"
 *               location:
 *                 type: string
 *                 maxLength: 255
 *                 description: Địa điểm tổ chức (tùy chọn)
 *                 example: "TP. Hồ Chí Minh"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian bắt đầu (tùy chọn)
 *                 example: "2025-01-28T00:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian kết thúc (tùy chọn)
 *                 example: "2025-02-10T23:59:59Z"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh mới (tùy chọn). Chỉ cập nhật nếu có chọn file mới.
 *                 x-mimetype: "image/jpeg,image/png,image/gif"
 *     responses:
 *       200:
 *         description: Cập nhật lễ hội thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalResponse'
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data: "Festival updated successfully"
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy lễ hội
 *       500:
 *         description: Lỗi upload hình ảnh hoặc lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/user/update-festival-image/{id}:
 *   put:
 *     summary: Cập nhật hình ảnh lễ hội
 *     description: Cập nhật chỉ hình ảnh cho lễ hội. Yêu cầu file hình ảnh bắt buộc.
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của lễ hội
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh mới (JPG, PNG, GIF)
 *                 x-mimetype: "image/jpeg,image/png,image/gif"
 *     responses:
 *       200:
 *         description: Cập nhật hình ảnh thành công
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: URL hình ảnh mới
 *             example:
 *               success: true
 *               status: 200
 *               code: 200
 *               data:
 *                 image: "https://res.cloudinary.com/moviego/festivals/507f1f77bcf86cd799439011/new_image.jpg"
 *       400:
 *         description: Thiếu file hình ảnh hoặc lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy lễ hội
 *       500:
 *         description: Lỗi upload hình ảnh
 */

/**
 * @swagger
 * /api/v1/admin/festival/delete/{id}:
 *   delete:
 *     summary: Xóa lễ hội
 *     description: Xóa lễ hội khỏi hệ thống. Thao tác này không thể hoàn tác.
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của lễ hội
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Xóa lễ hội thành công
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
 *                   example: "Festival deleted successfully"
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy lễ hội
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FestivalErrorResponse'
 *             example:
 *               success: false
 *               message: "Festival not found"
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/festivals/top:
 *   get:
 *     summary: Lấy danh sách lễ hội nổi bật
 *     description: Lấy danh sách các lễ hội mới nhất (theo thời gian tạo) để hiển thị nổi bật
 *     tags: [AdminFestival]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Số lượng lễ hội muốn lấy
 *     responses:
 *       200:
 *         description: Lấy danh sách lễ hội nổi bật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Festival'
 *             example:
 *               success: true
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   title: "Lễ hội Tết Nguyên Đán 2025"
 *                   image: "https://res.cloudinary.com/moviego/festivals/tet2025.jpg"
 *                   location: "Hà Nội"
 *                   description: "Lễ hội truyền thống đón Tết"
 *                   startTime: "2025-01-28T00:00:00Z"
 *                   endTime: "2025-02-05T23:59:59Z"
 *                 - id: "507f1f77bcf86cd799439012"
 *                   title: "Lễ hội Hoa Anh Đào"
 *                   image: "https://res.cloudinary.com/moviego/festivals/cherry.jpg"
 *                   location: "Đà Lạt"
 *                   description: "Lễ hội hoa anh đào mùa xuân"
 *                   startTime: "2025-02-15T00:00:00Z"
 *                   endTime: "2025-02-28T23:59:59Z"
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
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

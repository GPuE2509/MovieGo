const express = require("express");
const router = express.Router();
const ticketPriceController = require("../../controllers/ticketPriceController");
const { auth, adminMiddleware } = require("../../middleware/auth");
const {
  createTicketPriceValidation,
  updateTicketPriceValidation,
  ticketPriceQueryValidation,
} = require("../../dto/request/ticketPriceDto");

/**
 * @swagger
 * tags:
 *   name: AdminTicketPrice
 *   description: Quản lý giá vé cho Admin - Hệ thống MovieGo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TicketPrice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của bảng giá vé
 *         seat_type:
 *           type: string
 *           enum: [STANDARD, VIP, SWEETBOX]
 *           description: Loại ghế ngồi
 *         movie_type:
 *           type: string
 *           enum: [2D, 3D, 4DX, IMAX]
 *           description: Loại phim/công nghệ chiếu
 *         day_type:
 *           type: boolean
 *           description: Loại ngày (true = cuối tuần/lễ, false = ngày thường)
 *         start_time:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *           description: Thời gian bắt đầu áp dụng giá (HH:MM:SS)
 *         end_time:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *           description: Thời gian kết thúc áp dụng giá (HH:MM:SS)
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Giá vé (VND)
 *         is_active:
 *           type: boolean
 *           description: Trạng thái hoạt động của bảng giá
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *     TicketPricePaginationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketPrice'
 *             totalElements:
 *               type: number
 *               description: Tổng số bảng giá
 *             totalPages:
 *               type: number
 *               description: Tổng số trang
 *             size:
 *               type: number
 *               description: Kích thước trang
 *             number:
 *               type: number
 *               description: Số trang hiện tại
 *     TicketPriceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/TicketPrice'
 *     TicketPriceErrorResponse:
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
 * /api/v1/admin/ticket-prices:
 *   get:
 *     summary: Lấy danh sách tất cả bảng giá vé
 *     description: |
 *       Lấy danh sách bảng giá vé với phân trang và lọc theo loại ghế/phim.
 *
 *       Hệ thống giá vé MovieGo hoạt động theo cơ chế:
 *       - **Loại ghế**: STANDARD (thường), VIP (VIP), SWEETBOX (ghế đôi)
 *       - **Loại phim**: 2D, 3D, 4DX, IMAX
 *       - **Loại ngày**: Ngày thường (false) vs Cuối tuần/lễ (true)
 *       - **Khung giờ**: Từ start_time đến end_time trong ngày
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: query
 *         name: typeSeat
 *         schema:
 *           type: string
 *           enum: [STANDARD, VIP, SWEETBOX]
 *         description: Lọc theo loại ghế
 *       - in: query
 *         name: typeMovie
 *         schema:
 *           type: string
 *           enum: [2D, 3D, 4DX, IMAX]
 *         description: Lọc theo loại phim/công nghệ
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, seat_type, movie_type, start_time]
 *           default: created_at
 *         description: Trường để sắp xếp
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
 *         description: Số lượng bảng giá trên mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách bảng giá vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPricePaginationResponse'
 *             example:
 *               success: true
 *               data:
 *                 content:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     seat_type: "VIP"
 *                     movie_type: "3D"
 *                     day_type: true
 *                     start_time: "18:00:00"
 *                     end_time: "23:59:59"
 *                     price: 150000
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-20T14:25:00Z"
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     seat_type: "STANDARD"
 *                     movie_type: "2D"
 *                     day_type: false
 *                     start_time: "06:00:00"
 *                     end_time: "17:59:59"
 *                     price: 80000
 *                     is_active: true
 *                 totalElements: 45
 *                 totalPages: 5
 *                 size: 10
 *                 number: 0
 *       400:
 *         description: Lỗi validation tham số
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết bảng giá vé theo ID
 *     description: Lấy thông tin đầy đủ của một bảng giá vé theo ID
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của bảng giá vé
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy thông tin bảng giá vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 seat_type: "VIP"
 *                 movie_type: "3D"
 *                 day_type: true
 *                 start_time: "18:00:00"
 *                 end_time: "23:59:59"
 *                 price: 150000
 *                 is_active: true
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-20T14:25:00Z"
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy bảng giá vé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *             example:
 *               success: false
 *               message: "Ticket price not found"
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/create:
 *   post:
 *     summary: Tạo bảng giá vé mới
 *     description: |
 *       Tạo bảng giá vé mới với các thông tin về loại ghế, loại phim, khung giờ và giá tiền.
 *
 *       **Lưu ý quan trọng:**
 *       - Mỗi bảng giá áp dụng cho một tổ hợp: loại ghế + loại phim + loại ngày + khung giờ
 *       - Khung giờ có thể qua đêm (ví dụ: 22:00:00 - 02:00:00)
 *       - Giá vé tính bằng VND, không âm
 *       - day_type: false = ngày thường, true = cuối tuần/lễ
 *     tags: [AdminTicketPrice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seat_type
 *               - movie_type
 *               - day_type
 *               - start_time
 *               - end_time
 *               - price
 *             properties:
 *               seat_type:
 *                 type: string
 *                 enum: [STANDARD, VIP, SWEETBOX]
 *                 description: Loại ghế ngồi
 *                 example: "VIP"
 *               movie_type:
 *                 type: string
 *                 enum: [2D, 3D, 4DX, IMAX]
 *                 description: Loại phim/công nghệ chiếu
 *                 example: "3D"
 *               day_type:
 *                 type: boolean
 *                 description: Loại ngày (false = ngày thường, true = cuối tuần/lễ)
 *                 example: true
 *               start_time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *                 description: Thời gian bắt đầu áp dụng giá (HH:MM:SS)
 *                 example: "18:00:00"
 *               end_time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *                 description: Thời gian kết thúc áp dụng giá (HH:MM:SS)
 *                 example: "23:59:59"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá vé (VND)
 *                 example: 150000
 *               is_active:
 *                 type: boolean
 *                 description: Trạng thái hoạt động (mặc định true)
 *                 default: true
 *                 example: true
 *           examples:
 *             vip_3d_weekend:
 *               summary: VIP 3D cuối tuần tối
 *               value:
 *                 seat_type: "VIP"
 *                 movie_type: "3D"
 *                 day_type: true
 *                 start_time: "18:00:00"
 *                 end_time: "23:59:59"
 *                 price: 150000
 *                 is_active: true
 *             standard_2d_weekday:
 *               summary: Standard 2D ngày thường sáng
 *               value:
 *                 seat_type: "STANDARD"
 *                 movie_type: "2D"
 *                 day_type: false
 *                 start_time: "06:00:00"
 *                 end_time: "11:59:59"
 *                 price: 65000
 *             sweetbox_imax_premium:
 *               summary: SweetBox IMAX khung giờ vàng
 *               value:
 *                 seat_type: "SWEETBOX"
 *                 movie_type: "IMAX"
 *                 day_type: true
 *                 start_time: "19:30:00"
 *                 end_time: "22:30:00"
 *                 price: 400000
 *     responses:
 *       201:
 *         description: Tạo bảng giá vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439013"
 *                 seat_type: "VIP"
 *                 movie_type: "3D"
 *                 day_type: true
 *                 start_time: "18:00:00"
 *                 end_time: "23:59:59"
 *                 price: 150000
 *                 is_active: true
 *                 created_at: "2024-01-25T09:15:00Z"
 *                 updated_at: "2024-01-25T09:15:00Z"
 *       400:
 *         description: Lỗi validation hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - type: "field"
 *                   value: "INVALID_SEAT"
 *                   msg: "seat_type must be STANDARD, VIP, or SWEETBOX"
 *                   path: "seat_type"
 *                   location: "body"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/update/{id}:
 *   put:
 *     summary: Cập nhật bảng giá vé
 *     description: Cập nhật thông tin bảng giá vé. Có thể cập nhật một phần hoặc toàn bộ thông tin.
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của bảng giá vé
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seat_type:
 *                 type: string
 *                 enum: [STANDARD, VIP, SWEETBOX]
 *                 description: Loại ghế ngồi
 *               movie_type:
 *                 type: string
 *                 enum: [2D, 3D, 4DX, IMAX]
 *                 description: Loại phim/công nghệ chiếu
 *               day_type:
 *                 type: boolean
 *                 description: Loại ngày (false = ngày thường, true = cuối tuần/lễ)
 *               start_time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *                 description: Thời gian bắt đầu áp dụng giá (HH:MM:SS)
 *               end_time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
 *                 description: Thời gian kết thúc áp dụng giá (HH:MM:SS)
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá vé (VND)
 *               is_active:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *           examples:
 *             update_price_only:
 *               summary: Chỉ cập nhật giá
 *               value:
 *                 price: 160000
 *             deactivate_price:
 *               summary: Vô hiệu hóa bảng giá
 *               value:
 *                 is_active: false
 *             update_time_range:
 *               summary: Cập nhật khung giờ
 *               value:
 *                 start_time: "19:00:00"
 *                 end_time: "23:30:00"
 *                 price: 175000
 *     responses:
 *       200:
 *         description: Cập nhật bảng giá vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 seat_type: "VIP"
 *                 movie_type: "3D"
 *                 day_type: true
 *                 start_time: "19:00:00"
 *                 end_time: "23:30:00"
 *                 price: 175000
 *                 is_active: true
 *                 updated_at: "2024-01-25T14:20:00Z"
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy bảng giá vé
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/v1/admin/ticket-price/delete/{id}:
 *   delete:
 *     summary: Xóa bảng giá vé
 *     description: |
 *       Xóa bảng giá vé khỏi hệ thống. Thao tác này không thể hoàn tác.
 *
 *       **Lưu ý:** Nên cân nhắc việc set `is_active: false` thay vì xóa hoàn toàn
 *       để giữ lại dữ liệu lịch sử cho các booking đã tồn tại.
 *     tags: [AdminTicketPrice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId của bảng giá vé
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Xóa bảng giá vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ticket price deleted successfully"
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập)
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy bảng giá vé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketPriceErrorResponse'
 *             example:
 *               success: false
 *               message: "Ticket price not found"
 *       500:
 *         description: Lỗi server
 */

router.get(
  "/ticket-prices",
  auth,
  adminMiddleware,
  ticketPriceQueryValidation,
  ticketPriceController.getAll
);
router.get(
  "/ticket-price/:id",
  auth,
  adminMiddleware,
  ticketPriceQueryValidation,
  ticketPriceController.getById
);
router.post(
  "/ticket-price/create",
  auth,
  adminMiddleware,
  createTicketPriceValidation,
  ticketPriceController.create
);
router.put(
  "/ticket-price/update/:id",
  auth,
  adminMiddleware,
  updateTicketPriceValidation,
  ticketPriceController.update
);
router.delete(
  "/ticket-price/delete/:id",
  auth,
  adminMiddleware,
  ticketPriceController.delete
);

module.exports = router;

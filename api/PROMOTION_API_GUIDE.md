# Promotion Management API Guide

## Tổng quan
API quản lý Promotion cho admin với đầy đủ chức năng CRUD và các tính năng nâng cao.

## Base URL
```
http://localhost:3000/api/v1/admin/promotions
```

## Authentication
Tất cả API admin đều yêu cầu:
- Header: `Authorization: Bearer <token>`
- Role: ADMIN

## API Endpoints

### 1. Lấy danh sách Promotion (Admin)
```
GET /api/v1/admin/promotions
```

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Số lượng item mỗi trang (default: 10, max: 100)
- `search` (optional): Tìm kiếm theo title hoặc description
- `status` (optional): Lọc theo trạng thái (ACTIVE/INACTIVE)
- `sortBy` (optional): Sắp xếp theo field (created_at, updated_at, title, start_date, end_date)

**Response:**
```json
{
  "success": true,
  "status": 200,
  "code": 200,
  "data": {
    "content": [...],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false,
    "hasNext": true,
    "hasPrevious": false,
    "numberOfElements": 10
  }
}
```

### 2. Lấy Promotion theo ID (Admin)
```
GET /api/v1/admin/promotions/:id
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "code": 200,
  "data": {
    "id": "1",
    "title": "Summer Sale",
    "description": "Giảm giá mùa hè",
    "discountPercentage": 20,
    "discountAmount": null,
    "minOrderAmount": 100000,
    "maxDiscountAmount": 50000,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "isActive": true,
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Tạo Promotion mới (Admin)
```
POST /api/v1/admin/promotions
```

**Request Body:**
```json
{
  "title": "Summer Sale 2024",
  "description": "Giảm giá mùa hè cho tất cả vé xem phim",
  "discount_percentage": 20,
  "min_order_amount": 100000,
  "max_discount_amount": 50000,
  "start_date": "2024-06-01T00:00:00.000Z",
  "end_date": "2024-08-31T23:59:59.000Z",
  "is_active": true,
  "image": "https://example.com/promotion.jpg"
}
```

**Validation Rules:**
- `title`: Bắt buộc, 1-200 ký tự
- `description`: Tùy chọn, tối đa 1000 ký tự
- `discount_percentage`: 0-100 (không được cùng lúc với discount_amount)
- `discount_amount`: Số dương (không được cùng lúc với discount_percentage)
- `min_order_amount`: Số dương
- `max_discount_amount`: Số dương
- `start_date`: Bắt buộc, định dạng ISO 8601
- `end_date`: Bắt buộc, phải sau start_date
- `is_active`: Boolean
- `image`: URL hợp lệ

### 4. Cập nhật Promotion (Admin)
```
PUT /api/v1/admin/promotions/:id
```

**Request Body:** (Tương tự như tạo mới, tất cả fields đều optional)

### 5. Cập nhật trạng thái Promotion (Admin)
```
PATCH /api/v1/admin/promotions/status/:id
```

**Request Body:**
```json
{
  "is_active": false
}
```

### 6. Xóa Promotion (Admin)
```
DELETE /api/v1/admin/promotions/:id
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "code": 200,
  "data": {
    "message": "Promotion deleted successfully",
    "id": "promotion_id"
  }
}
```

### 7. Lấy danh sách Promotion đang hoạt động (Public)
```
GET /api/v1/admin/promotions/active
```

**Response:** Danh sách các promotion đang active và trong thời gian hiệu lực

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Promotion not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to get promotions: Database connection error"
}
```

## Testing với Postman

### 1. Setup Environment
- Base URL: `http://localhost:3000`
- Authorization: Bearer token từ login admin

### 2. Collection Examples

**Get All Promotions:**
```
GET {{base_url}}/api/v1/admin/promotions?page=0&size=10&search=summer&status=ACTIVE
```

**Create Promotion:**
```
POST {{base_url}}/api/v1/admin/promotions
Content-Type: application/json
Authorization: Bearer {{admin_token}}

{
  "title": "New Year Promotion",
  "description": "Khuyến mãi năm mới",
  "discount_percentage": 15,
  "min_order_amount": 50000,
  "max_discount_amount": 30000,
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-01-31T23:59:59.000Z",
  "is_active": true
}
```

## Swagger Documentation

Để sử dụng Swagger, truy cập:
```
http://localhost:3000/api-docs
```

## Chạy Backend từ IntelliJ

1. Mở project trong IntelliJ IDEA
2. Mở file `api/app.js`
3. Click chuột phải → Run 'app.js'
4. Hoặc sử dụng terminal: `npm start` trong thư mục `api/`

## Notes

- Tất cả API đều có validation đầy đủ
- Hỗ trợ pagination và search
- Có endpoint public để lấy promotion active
- Validation nghiêm ngặt cho discount types (không được cùng lúc có percentage và amount)
- Tự động validate date range

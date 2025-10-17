# Test Guide - Coupon Feature APIs

## 🎯 Overview
Hướng dẫn test chức năng **Coupon Feature** đã được chuyển đổi từ Spring Boot sang Node.js.

## 📋 Prerequisites
1. **Node.js Backend đang chạy** trên port 8080
2. **Database MySQL** đã được setup và kết nối
3. **Users** data đã có trong database
4. **Coupons** data đã có trong database (hoặc tạo mới qua API)

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd BE
npm install
npm run dev
```

### 2. Test APIs với Postman/Thunder Client

#### 📝 Test Cases

##### **GET All Coupons (Admin)**
```http
GET http://localhost:8080/api/v1/admin/coupons
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": {
    "total": 5,
    "page": 0,
    "size": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false,
    "data": [
      {
        "id": 1,
        "name": "Voucher Giảm 50k",
        "code": "50KQUAGIANGSINH",
        "value": 50000,
        "exchange_point": 100,
        "canExchange": false
      }
    ]
  }
}
```

##### **GET All Coupons with Pagination**
```http
GET http://localhost:8080/api/v1/admin/coupons?page=0&pageSize=5
```

##### **GET All Coupons with Search**
```http
GET http://localhost:8080/api/v1/admin/coupons?search=50k
```

##### **GET All Coupons with Sorting**
```http
GET http://localhost:8080/api/v1/admin/coupons?sortField=value&sortOrder=desc
```

##### **POST Create Coupon (Admin)**
```http
POST http://localhost:8080/api/v1/admin/coupon/create
Content-Type: application/json

{
  "name": "Voucher Giảm 50k",
  "code": "50KQUAGIANGSINH",
  "value": 50000,
  "exchange_point": 100
}
```

**Expected Response:**
```json
{
  "status": 201,
  "code": 201,
  "data": "Coupon created successfully"
}
```

##### **PUT Update Coupon (Admin)**
```http
PUT http://localhost:8080/api/v1/admin/coupon/update/1
Content-Type: application/json

{
  "name": "Voucher Giảm 50k Updated",
  "code": "50KQUAGIANGSINH_UPDATED",
  "value": 60000,
  "exchange_point": 120
}
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": "Coupon updated successfully"
}
```

##### **DELETE Coupon (Admin)**
```http
DELETE http://localhost:8080/api/v1/admin/coupon/delete/1
```

**Expected Response:**
```json
{
  "status": 204,
  "code": 204,
  "data": "Coupon deleted successfully"
}
```

##### **GET Available Coupons for User**
```http
GET http://localhost:8080/api/v1/user/available-coupons/1
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Voucher Giảm 50k",
      "code": "50KQUAGIANGSINH",
      "value": 50000,
      "exchange_point": 100,
      "canExchange": true
    }
  ]
}
```

##### **GET User's Coupons**
```http
GET http://localhost:8080/api/v1/user/my-coupons/1
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Voucher Giảm 50k",
      "code": "50KQUAGIANGSINH",
      "value": 50000,
      "exchange_point": 100,
      "canExchange": false
    }
  ]
}
```

##### **POST Exchange Coupon**
```http
POST http://localhost:8080/api/v1/user/exchange/1/1
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": "Coupon exchanged successfully!"
}
```

##### **GET Can Exchange Coupon**
```http
GET http://localhost:8080/api/v1/user/can-exchange/1/1
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": true
}
```

### 3. Test với Script tự động

```bash
# Chạy test script
node test-coupon-apis.js
```

## 🧪 Validation Tests

### Test Error Cases

#### **Invalid Coupon Data**
```http
POST http://localhost:8080/api/v1/admin/coupon/create
Content-Type: application/json

{
  "name": "",
  "code": "",
  "value": -1,
  "exchange_point": -1
}
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "Validation Error",
  "details": [
    {
      "field": "name",
      "message": "Name coupon cannot be empty"
    },
    {
      "field": "code",
      "message": "Code cannot be empty"
    },
    {
      "field": "value",
      "message": "Value must be >= 0"
    },
    {
      "field": "exchange_point",
      "message": "Exchange point must be >= 0"
    }
  ]
}
```

#### **Invalid Pagination**
```http
GET http://localhost:8080/api/v1/admin/coupons?page=-1&pageSize=200
```

#### **Invalid Sort Field**
```http
GET http://localhost:8080/api/v1/admin/coupons?sortField=invalid&sortOrder=invalid
```

#### **Invalid User ID**
```http
GET http://localhost:8080/api/v1/user/available-coupons/invalid
```

#### **Invalid Coupon ID**
```http
GET http://localhost:8080/api/v1/user/can-exchange/invalid/1
```

#### **Non-existent Coupon**
```http
GET http://localhost:8080/api/v1/user/can-exchange/999999/1
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "Coupon not found"
}
```

#### **Non-existent User**
```http
GET http://localhost:8080/api/v1/user/available-coupons/999999
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "User not found"
}
```

#### **Duplicate Coupon Code**
```http
POST http://localhost:8080/api/v1/admin/coupon/create
Content-Type: application/json

{
  "name": "Duplicate Test",
  "code": "EXISTING_CODE",
  "value": 10000,
  "exchange_point": 50
}
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "Coupon code already exists"
}
```

#### **Insufficient Points**
```http
POST http://localhost:8080/api/v1/user/exchange/1/1
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "Insufficient points to exchange this coupon"
}
```

#### **Already Have Coupon**
```http
POST http://localhost:8080/api/v1/user/exchange/1/1
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "You already have this coupon"
}
```

## 🔍 Database Verification

### Check Database Directly
```sql
-- Xem tất cả coupons
SELECT * FROM coupons ORDER BY created_at DESC;

-- Xem user-coupon associations
SELECT u.id as user_id, u.first_name, u.last_name, c.name as coupon_name, c.code, uc.created_at
FROM users u
JOIN user_coupons uc ON u.id = uc.user_id
JOIN coupons c ON uc.coupon_id = c.id
ORDER BY u.id, uc.created_at;

-- Xem user points
SELECT id, first_name, last_name, point FROM users ORDER BY point DESC;

-- Đếm coupons per user
SELECT u.id, u.first_name, u.last_name, COUNT(uc.coupon_id) as coupon_count
FROM users u
LEFT JOIN user_coupons uc ON u.id = uc.user_id
GROUP BY u.id, u.first_name, u.last_name
ORDER BY coupon_count DESC;

-- Xem available coupons cho user (coupons user chưa có)
SELECT c.*
FROM coupons c
LEFT JOIN user_coupons uc ON c.id = uc.coupon_id AND uc.user_id = 1
WHERE uc.coupon_id IS NULL;
```

## 📊 Performance Tests

### Load Testing với Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > coupon-load-test.yml << EOF
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Coupon API Load Test"
    requests:
      - get:
          url: "/api/v1/admin/coupons"
      - get:
          url: "/api/v1/user/available-coupons/1"
      - get:
          url: "/api/v1/user/my-coupons/1"
      - get:
          url: "/api/v1/user/can-exchange/1/1"
EOF

# Run load test
artillery run coupon-load-test.yml
```

## 🐛 Troubleshooting

### Common Issues

#### **1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Kiểm tra MySQL service đang chạy và config database đúng.

#### **2. No Coupons Found**
```
Empty data array in response
```
**Solution:** 
- Kiểm tra có coupons trong database không
- Tạo coupons mới qua API
- Kiểm tra associations giữa users và coupons

#### **3. User Not Found**
```
User not found error
```
**Solution:** 
- Kiểm tra có users trong database không
- Đảm bảo user ID hợp lệ
- Tạo users mới nếu cần

#### **4. Insufficient Points**
```
Insufficient points to exchange this coupon
```
**Solution:** 
- Kiểm tra user có đủ points không
- Cập nhật user points trong database
- Hoặc tạo coupon với exchange_point thấp hơn

#### **5. Duplicate Coupon Code**
```
Coupon code already exists
```
**Solution:** 
- Sử dụng coupon code khác
- Hoặc xóa coupon cũ trước khi tạo mới

#### **6. Association Errors**
```
Error: User.coupons is not a function
```
**Solution:** Kiểm tra associations trong models/index.js đã được setup đúng.

#### **7. Validation Errors**
```
Validation Error: Name coupon cannot be empty
```
**Solution:** Đảm bảo request body có đầy đủ và đúng format.

## 📈 Success Criteria

✅ **All APIs return correct status codes**
✅ **Pagination works properly**
✅ **Search functionality works**
✅ **Sorting works**
✅ **CRUD operations work**
✅ **User-coupon associations work**
✅ **Point deduction works**
✅ **Duplicate prevention works**
✅ **Validation works properly**
✅ **Database operations successful**
✅ **Error handling works**
✅ **Response format matches Spring Boot**
✅ **Performance acceptable (< 200ms response time)**

## 🔄 Comparison với Spring Boot

| Feature | Spring Boot | Node.js | Status |
|---------|-------------|---------|---------|
| GET /admin/coupons | ✅ | ✅ | ✅ |
| POST /admin/coupon/create | ✅ | ✅ | ✅ |
| PUT /admin/coupon/update/{id} | ✅ | ✅ | ✅ |
| DELETE /admin/coupon/delete/{id} | ✅ | ✅ | ✅ |
| GET /user/available-coupons/{userId} | ✅ | ✅ | ✅ |
| GET /user/my-coupons/{userId} | ✅ | ✅ | ✅ |
| POST /user/exchange/{couponId}/{userId} | ✅ | ✅ | ✅ |
| GET /user/can-exchange/{couponId}/{userId} | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Sorting | ✅ | ✅ | ✅ |
| Validation | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Response Format | ✅ | ✅ | ✅ |

## 📝 Notes

- **API Endpoints** giữ nguyên format như Spring Boot
- **Response Structure** tương thích 100% với frontend
- **Pagination** được implement đầy đủ
- **Search** hoạt động trên name và code
- **Sorting** hỗ trợ nhiều fields
- **User-Coupon associations** được quản lý qua UserCoupon table
- **Point deduction** hoạt động chính xác
- **Duplicate prevention** được implement đầy đủ
- **Validation Rules** được implement đầy đủ
- **Error Messages** giống với Spring Boot
- **Database Schema** không thay đổi

## 🎉 Next Steps

Sau khi test thành công Coupon Feature, có thể tiếp tục chuyển đổi:
1. **Screen Management**
2. **Seat Management**
3. **Showtime Management**
4. **User Management**
5. **Booking Management**
6. **Promotion Management**
7. **Festival Management**
8. **Ticket Price Management**
9. **Payment Management**

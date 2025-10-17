# Test Guide - Theater Management APIs

## 🎯 Overview
Hướng dẫn test chức năng **Theater Management** đã được chuyển đổi từ Spring Boot sang Node.js.

## 📋 Prerequisites
1. **Node.js Backend đang chạy** trên port 8080
2. **Database MySQL** đã được setup và kết nối
3. **Cloudinary** đã được cấu hình cho image uploads
4. **Admin token** để test các Admin APIs (nếu có authentication)

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd BE
npm install
npm run dev
```

### 2. Test APIs với Postman/Thunder Client

#### 📝 Test Cases

##### **GET All Theaters (Public)**
```http
GET http://localhost:8080/api/v1/theaters?keyword=&page=0&size=10&sortBy=name&direction=asc
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
        "name": "Cinema World",
        "location": "123 Movie St, Hanoi",
        "phone": "19006017",
        "state": "Ho Chi Minh City",
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/theaters/theater1.jpg"
      }
    ]
  }
}
```

##### **GET Theaters Near Location (Public)**
```http
GET http://localhost:8080/api/v1/theaters-near?lat=10.8015&lon=106.6367&radius=5&limit=10
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Cinema World",
      "location": "123 Movie St, Hanoi",
      "phone": "19006017",
      "state": "Ho Chi Minh City",
      "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/theaters/theater1.jpg",
      "latitude": 10.8015,
      "longitude": 106.6367,
      "distance": 0.5
    }
  ]
}
```

##### **GET Theater by ID (Public)**
```http
GET http://localhost:8080/api/v1/theater/1
```

##### **POST Create Theater (Admin)**
```http
POST http://localhost:8080/api/v1/admin/theater/create
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Form Data:
- name: "Test Cinema World"
- location: "123 Test Street, Test City"
- phone: "19006017"
- latitude: "10.8015"
- longitude: "106.6367"
- state: "Test State"
- image: [file upload]
```

**Expected Response:**
```json
{
  "status": 201,
  "code": 201,
  "data": {
    "id": 3,
    "name": "Test Cinema World",
    "location": "123 Test Street, Test City",
    "phone": "19006017",
    "latitude": 10.8015,
    "longitude": 106.6367,
    "state": "Test State",
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/theaters/theater3.jpg"
  }
}
```

##### **PUT Update Theater (Admin)**
```http
PUT http://localhost:8080/api/v1/admin/theater/update/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Form Data:
- name: "Updated Cinema World"
- location: "456 Updated Street, Updated City"
- phone: "19006018"
- latitude: "10.8016"
- longitude: "106.6368"
- state: "Updated State"
- image: [file upload - optional]
```

##### **DELETE Theater (Admin)**
```http
DELETE http://localhost:8080/api/v1/admin/theater/delete/1
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "status": 204,
  "code": 204,
  "message": "Theater deleted successfully"
}
```

##### **GET All Theaters (Admin)**
```http
GET http://localhost:8080/api/v1/admin/theaters?keyword=&page=0&size=10&sortBy=name&direction=asc
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 3. Test với Script tự động

```bash
# Chạy test script
node test-theater-apis.js
```

## 🧪 Validation Tests

### Test Error Cases

#### **Empty Name**
```http
POST http://localhost:8080/api/v1/admin/theater/create
Content-Type: multipart/form-data

Form Data:
- name: ""
- location: "Test location"
- phone: "19006017"
- latitude: "10.8015"
- longitude: "106.6367"
- state: "Test state"
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
      "message": "Name cannot be empty"
    }
  ]
}
```

#### **Invalid Phone Number**
```http
POST http://localhost:8080/api/v1/admin/theater/create
Content-Type: multipart/form-data

Form Data:
- name: "Test Theater"
- location: "Test location"
- phone: "invalid-phone"
- latitude: "10.8015"
- longitude: "106.6367"
- state: "Test state"
```

#### **Invalid Coordinates**
```http
POST http://localhost:8080/api/v1/admin/theater/create
Content-Type: multipart/form-data

Form Data:
- name: "Test Theater"
- location: "Test location"
- phone: "19006017"
- latitude: "999"
- longitude: "106.6367"
- state: "Test state"
```

#### **Duplicate Theater Name**
```http
POST http://localhost:8080/api/v1/admin/theater/create
Content-Type: multipart/form-data

Form Data:
- name: "Cinema World"
- location: "Different location"
- phone: "19006017"
- latitude: "10.8015"
- longitude: "106.6367"
- state: "Test state"
```

**Expected Response:**
```json
{
  "status": 409,
  "code": 409,
  "message": "Theater name Cinema World already exists"
}
```

#### **Update Non-existent Theater**
```http
PUT http://localhost:8080/api/v1/admin/theater/update/999
Content-Type: multipart/form-data

Form Data:
- name: "Non-existent"
- location: "Test location"
- phone: "19006017"
- latitude: "10.8015"
- longitude: "106.6367"
- state: "Test state"
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "Theater not found with id: 999 or deleted"
}
```

#### **Invalid Nearby Theaters Parameters**
```http
GET http://localhost:8080/api/v1/theaters-near?lat=999&lon=999
```

## 🔍 Database Verification

### Check Database Directly
```sql
-- Xem tất cả theaters
SELECT * FROM theaters WHERE deleted = false;

-- Xem theaters với thông tin chi tiết
SELECT 
  id, 
  name, 
  location, 
  phone,
  latitude,
  longitude,
  state,
  image,
  created_at,
  updated_at
FROM theaters 
WHERE deleted = false
ORDER BY created_at DESC;

-- Đếm số lượng theaters
SELECT COUNT(*) as total_theaters FROM theaters WHERE deleted = false;

-- Xem theaters đã bị xóa (soft delete)
SELECT COUNT(*) as deleted_theaters FROM theaters WHERE deleted = true;
```

## 📊 Performance Tests

### Load Testing với Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > theater-load-test.yml << EOF
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Theater API Load Test"
    requests:
      - get:
          url: "/api/v1/theaters"
      - get:
          url: "/api/v1/theaters-near?lat=10.8015&lon=106.6367&radius=5&limit=10"
      - get:
          url: "/api/v1/theater/1"
EOF

# Run load test
artillery run theater-load-test.yml
```

## 🐛 Troubleshooting

### Common Issues

#### **1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Kiểm tra MySQL service đang chạy và config database đúng.

#### **2. Cloudinary Upload Error**
```
Error: Failed to upload file to Cloudinary
```
**Solution:** 
- Kiểm tra Cloudinary credentials trong .env
- Đảm bảo file size < 5MB
- Kiểm tra file format (chỉ accept images)

#### **3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:** 
```bash
# Kill process on port 8080
npx kill-port 8080
# Or change port in .env file
```

#### **4. Validation Errors**
```
Validation Error: Name cannot be empty
```
**Solution:** Đảm bảo request body có đúng format và validation rules.

#### **5. File Upload Issues**
```
Error: Only image files are allowed
```
**Solution:** Đảm bảo file upload là image (jpg, png, gif, etc.)

#### **6. Authentication Errors**
```
401 Unauthorized
```
**Solution:** Kiểm tra admin token và authentication middleware.

#### **7. Coordinate Validation Errors**
```
Validation Error: Latitude must be between -90 and 90
```
**Solution:** Đảm bảo latitude/longitude values hợp lệ.

## 📈 Success Criteria

✅ **All APIs return correct status codes**
✅ **Pagination works properly**
✅ **Search functionality works**
✅ **File upload to Cloudinary works**
✅ **Validation works properly**
✅ **Database operations successful**
✅ **Error handling works**
✅ **Response format matches Spring Boot**
✅ **Performance acceptable (< 200ms response time)**
✅ **Soft delete functionality works**
✅ **Nearby theaters calculation works**

## 🔄 Comparison với Spring Boot

| Feature | Spring Boot | Node.js | Status |
|---------|-------------|---------|---------|
| GET /theaters | ✅ | ✅ | ✅ |
| GET /theater/{id} | ✅ | ✅ | ✅ |
| GET /theaters-near | ✅ | ✅ | ✅ |
| GET /admin/theaters | ✅ | ✅ | ✅ |
| GET /admin/theater/{id} | ✅ | ✅ | ✅ |
| POST /admin/theater/create | ✅ | ✅ | ✅ |
| PUT /admin/theater/update/{id} | ✅ | ✅ | ✅ |
| DELETE /admin/theater/delete/{id} | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ |
| Validation | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Response Format | ✅ | ✅ | ✅ |
| Soft Delete | ✅ | ✅ | ✅ |
| Nearby Calculation | ✅ | ✅ | ✅ |

## 📝 Notes

- **API Endpoints** giữ nguyên format như Spring Boot
- **Response Structure** tương thích 100% với frontend
- **Pagination** được implement đầy đủ với search và sorting
- **File Upload** sử dụng Cloudinary như Spring Boot
- **Validation Rules** được implement đầy đủ
- **Error Messages** giống với Spring Boot
- **Database Schema** không thay đổi
- **Soft Delete** được implement đúng cách
- **Distance Calculation** sử dụng Haversine formula

## 🎉 Next Steps

Sau khi test thành công Theater Management, có thể tiếp tục chuyển đổi:
1. **Screen Management**
2. **Seat Management**
3. **Showtime Management**
4. **User Management**
5. **Booking Management**
6. **Promotion Management**
7. **Festival Management**
8. **Ticket Price Management**

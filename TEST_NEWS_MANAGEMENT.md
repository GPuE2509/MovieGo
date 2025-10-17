# Test Guide - News Management APIs

## 🎯 Overview
Hướng dẫn test chức năng **News Management** đã được chuyển đổi từ Spring Boot sang Node.js.

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

##### **GET All News (Public)**
```http
GET http://localhost:8080/api/v1/get-all-news?page=0&pageSize=10&sortField=title&sortOrder=asc&search=
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
        "title": "New Movie Release",
        "content": "Details about the new release...",
        "createdAt": "2025-01-28T10:00:00.000Z",
        "updatedAt": "2025-01-28T11:00:00.000Z",
        "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/news/news1.jpg"
      }
    ]
  }
}
```

##### **GET News for Carousel (Public)**
```http
GET http://localhost:8080/api/v1/news/carousel
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "Latest News",
      "content": "News content...",
      "createdAt": "2025-01-28T10:00:00.000Z",
      "updatedAt": null,
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/news/news1.jpg"
    }
  ]
}
```

##### **GET News by ID (Public)**
```http
GET http://localhost:8080/api/v1/get-new-by-id/1
```

##### **POST Create News (Admin)**
```http
POST http://localhost:8080/api/v1/admin/news/create
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Form Data:
- title: "Test News Title"
- content: "This is test news content"
- image: [file upload]
```

**Expected Response:**
```json
{
  "status": 201,
  "code": 201,
  "data": "News created successfully"
}
```

##### **PUT Update News (Admin)**
```http
PUT http://localhost:8080/api/v1/admin/news/update/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Form Data:
- title: "Updated News Title"
- content: "Updated content"
- image: [file upload - optional]
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": "News updated successfully"
}
```

##### **DELETE News (Admin)**
```http
DELETE http://localhost:8080/api/v1/admin/news/delete/1
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "status": 204,
  "code": 204,
  "message": "News deleted successfully"
}
```

##### **GET All News (Admin)**
```http
GET http://localhost:8080/api/v1/admin/news?page=0&pageSize=10&sortField=title&sortOrder=asc&search=
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 3. Test với Script tự động

```bash
# Chạy test script
node test-news-apis.js
```

## 🧪 Validation Tests

### Test Error Cases

#### **Empty Title**
```http
POST http://localhost:8080/api/v1/admin/news/create
Content-Type: multipart/form-data

Form Data:
- title: ""
- content: "Test content"
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "Validation Error",
  "details": [
    {
      "field": "title",
      "message": "Title cannot be empty"
    }
  ]
}
```

#### **Long Title**
```http
POST http://localhost:8080/api/v1/admin/news/create
Content-Type: multipart/form-data

Form Data:
- title: "A very long title that exceeds the maximum allowed length of 255 characters and should trigger validation error because it's too long for the database field and will cause issues with the application"
- content: "Test content"
```

#### **Missing Title**
```http
POST http://localhost:8080/api/v1/admin/news/create
Content-Type: multipart/form-data

Form Data:
- content: "Test content"
```

#### **Invalid Pagination Parameters**
```http
GET http://localhost:8080/api/v1/get-all-news?page=-1&pageSize=200&sortField=invalid&sortOrder=invalid
```

#### **Update Non-existent News**
```http
PUT http://localhost:8080/api/v1/admin/news/update/999
Content-Type: multipart/form-data

Form Data:
- title: "Non-existent"
- content: "Test content"
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "News not found"
}
```

## 🔍 Database Verification

### Check Database Directly
```sql
-- Xem tất cả news
SELECT * FROM news;

-- Xem news với thông tin chi tiết
SELECT 
  id, 
  title, 
  SUBSTRING(content, 1, 100) as content_preview,
  image,
  created_at,
  updated_at
FROM news 
ORDER BY created_at DESC;

-- Đếm số lượng news
SELECT COUNT(*) as total_news FROM news;
```

## 📊 Performance Tests

### Load Testing với Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > news-load-test.yml << EOF
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "News API Load Test"
    requests:
      - get:
          url: "/api/v1/get-all-news"
      - get:
          url: "/api/v1/news/carousel"
      - get:
          url: "/api/v1/get-new-by-id/1"
EOF

# Run load test
artillery run news-load-test.yml
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
Validation Error: Title cannot be empty
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

## 🔄 Comparison với Spring Boot

| Feature | Spring Boot | Node.js | Status |
|---------|-------------|---------|---------|
| GET /get-all-news | ✅ | ✅ | ✅ |
| GET /news/carousel | ✅ | ✅ | ✅ |
| GET /get-new-by-id/{id} | ✅ | ✅ | ✅ |
| GET /admin/news | ✅ | ✅ | ✅ |
| POST /admin/news/create | ✅ | ✅ | ✅ |
| PUT /admin/news/update/{id} | ✅ | ✅ | ✅ |
| DELETE /admin/news/delete/{id} | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ |
| Validation | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Response Format | ✅ | ✅ | ✅ |

## 📝 Notes

- **API Endpoints** giữ nguyên format như Spring Boot
- **Response Structure** tương thích 100% với frontend
- **Pagination** được implement đầy đủ với search và sorting
- **File Upload** sử dụng Cloudinary như Spring Boot
- **Validation Rules** được implement đầy đủ
- **Error Messages** giống với Spring Boot
- **Database Schema** không thay đổi

## 🎉 Next Steps

Sau khi test thành công News Management, có thể tiếp tục chuyển đổi:
1. **Theater Management**
2. **Screen Management** 
3. **Seat Management**
4. **Showtime Management**
5. **User Management**
6. **Booking Management**
7. **Promotion Management**
8. **Festival Management**

# Test Guide - Genre Management APIs

## 🎯 Overview
Hướng dẫn test chức năng **Genre Management** đã được chuyển đổi từ Spring Boot sang Node.js.

## 📋 Prerequisites
1. **Node.js Backend đang chạy** trên port 8080
2. **Database MySQL** đã được setup và kết nối
3. **Admin token** để test các API (nếu có authentication)

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd BE
npm install
npm run dev
```

### 2. Test APIs với Postman/Thunder Client

#### 📝 Test Cases

##### **GET All Genres**
```http
GET http://localhost:8080/api/v1/admin/genres
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "genreName": "Action"
    },
    {
      "id": 2,
      "genreName": "Comedy"
    }
  ]
}
```

##### **POST Create Genre**
```http
POST http://localhost:8080/api/v1/admin/genre/create
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "genreName": "Test Action"
}
```

**Expected Response:**
```json
{
  "status": 201,
  "code": 201,
  "data": {
    "id": 3,
    "genreName": "Test Action"
  }
}
```

##### **PUT Update Genre**
```http
PUT http://localhost:8080/api/v1/admin/genre/update/3
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "genreName": "Updated Action"
}
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": {
    "id": 3,
    "genreName": "Updated Action"
  }
}
```

##### **DELETE Genre**
```http
DELETE http://localhost:8080/api/v1/admin/genre/delete/3
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "status": 204,
  "code": 204,
  "message": "Genre deleted successfully"
}
```

### 3. Test với Script tự động

```bash
# Chạy test script
node test-genre-apis.js
```

## 🧪 Validation Tests

### Test Error Cases

#### **Empty Genre Name**
```http
POST http://localhost:8080/api/v1/admin/genre/create
Content-Type: application/json

{
  "genreName": ""
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
      "field": "genreName",
      "message": "Genre name cannot be empty"
    }
  ]
}
```

#### **Long Genre Name**
```http
POST http://localhost:8080/api/v1/admin/genre/create
Content-Type: application/json

{
  "genreName": "A very long genre name that exceeds the maximum allowed length of 100 characters and should trigger validation error"
}
```

#### **Duplicate Genre Name**
```http
POST http://localhost:8080/api/v1/admin/genre/create
Content-Type: application/json

{
  "genreName": "Action"
}
```

**Expected Response:**
```json
{
  "status": 409,
  "code": 409,
  "message": "Genre with name Action already exists"
}
```

#### **Update Non-existent Genre**
```http
PUT http://localhost:8080/api/v1/admin/genre/update/999
Content-Type: application/json

{
  "genreName": "Non-existent"
}
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "Genre not found"
}
```

## 🔍 Database Verification

### Check Database Directly
```sql
-- Xem tất cả genres
SELECT * FROM genres;

-- Xem genres với movies
SELECT g.id, g.genre_name, COUNT(mg.movie_id) as movie_count
FROM genres g
LEFT JOIN movie_genres mg ON g.id = mg.genre_id
GROUP BY g.id, g.genre_name;
```

## 📊 Performance Tests

### Load Testing với Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > genre-load-test.yml << EOF
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Genre API Load Test"
    requests:
      - get:
          url: "/api/v1/admin/genres"
          headers:
            Authorization: "Bearer YOUR_ADMIN_TOKEN"
EOF

# Run load test
artillery run genre-load-test.yml
```

## 🐛 Troubleshooting

### Common Issues

#### **1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Kiểm tra MySQL service đang chạy và config database đúng.

#### **2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:** 
```bash
# Kill process on port 8080
npx kill-port 8080
# Or change port in .env file
```

#### **3. Validation Errors**
```
Validation Error: Genre name cannot be empty
```
**Solution:** Đảm bảo request body có đúng format và validation rules.

#### **4. Authentication Errors**
```
401 Unauthorized
```
**Solution:** Kiểm tra admin token và authentication middleware.

## 📈 Success Criteria

✅ **All APIs return correct status codes**
✅ **Validation works properly**
✅ **Database operations successful**
✅ **Error handling works**
✅ **Response format matches Spring Boot**
✅ **Performance acceptable (< 200ms response time)**

## 🔄 Comparison với Spring Boot

| Feature | Spring Boot | Node.js | Status |
|---------|-------------|---------|---------|
| GET /genres | ✅ | ✅ | ✅ |
| POST /genre/create | ✅ | ✅ | ✅ |
| PUT /genre/update/{id} | ✅ | ✅ | ✅ |
| DELETE /genre/delete/{id} | ✅ | ✅ | ✅ |
| Validation | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Response Format | ✅ | ✅ | ✅ |

## 📝 Notes

- **API Endpoints** giữ nguyên format như Spring Boot
- **Response Structure** tương thích 100% với frontend
- **Validation Rules** được implement đầy đủ
- **Error Messages** giống với Spring Boot
- **Database Schema** không thay đổi

## 🎉 Next Steps

Sau khi test thành công Genre Management, có thể tiếp tục chuyển đổi:
1. **Theater Management**
2. **Screen Management** 
3. **Seat Management**
4. **Showtime Management**
5. **User Management**
6. **Booking Management**

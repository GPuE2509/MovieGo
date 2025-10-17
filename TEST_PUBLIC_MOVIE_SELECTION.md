# Test Guide - Public Movie Selection APIs

## 🎯 Overview
Hướng dẫn test chức năng **Public Movie Selection** đã được chuyển đổi từ Spring Boot sang Node.js.

## 📋 Prerequisites
1. **Node.js Backend đang chạy** trên port 8080
2. **Database MySQL** đã được setup và kết nối
3. **Movies, Theaters, Screens, Showtimes** data đã có trong database
4. **Genres** đã được setup và liên kết với movies

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd BE
npm install
npm run dev
```

### 2. Test APIs với Postman/Thunder Client

#### 📝 Test Cases

##### **GET Movies with Active Showtimes (Basic)**
```http
GET http://localhost:8080/api/v1/movies
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
        "title": "Avengers: Endgame",
        "description": "After the devastating events of Infinity War...",
        "author": "Anthony Russo",
        "actors": "Robert Downey Jr., Chris Evans",
        "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/movies/avengers.jpg",
        "trailer": "https://www.youtube.com/watch?v=example",
        "type": "ACTION",
        "duration": 181,
        "nations": "USA",
        "releaseDate": "2023-04-26T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "genreNames": ["Action", "Adventure", "Drama"]
      }
    ]
  }
}
```

##### **GET Movies with Date Filter**
```http
GET http://localhost:8080/api/v1/movies?date=2025-01-30T00:00:00.000Z
```

##### **GET Movies with Theater Filter**
```http
GET http://localhost:8080/api/v1/movies?theaterId=1
```

##### **GET Movies with Pagination**
```http
GET http://localhost:8080/api/v1/movies?page=0&size=5
```

##### **GET Movie Details**
```http
GET http://localhost:8080/api/v1/movies/1
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": {
    "id": 1,
    "title": "Avengers: Endgame",
    "description": "After the devastating events of Infinity War...",
    "author": "Anthony Russo",
    "actors": "Robert Downey Jr., Chris Evans, Mark Ruffalo",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/movies/avengers.jpg",
    "trailer": "https://www.youtube.com/watch?v=example",
    "type": "ACTION",
    "duration": 181,
    "nations": "USA",
    "releaseDate": "2023-04-26T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "genreNames": ["Action", "Adventure", "Drama"]
  }
}
```

##### **GET Movies Currently Showing**
```http
GET http://localhost:8080/api/v1/movies/showing
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "Avengers: Endgame",
      "description": "After the devastating events of Infinity War...",
      "author": "Anthony Russo",
      "actors": "Robert Downey Jr., Chris Evans",
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sdn302/movies/avengers.jpg",
      "trailer": "https://www.youtube.com/watch?v=example",
      "type": "ACTION",
      "duration": 181,
      "nations": "USA",
      "releaseDate": "2023-04-26T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "genreNames": ["Action", "Adventure", "Drama"]
    }
  ]
}
```

##### **GET Movies Coming Soon**
```http
GET http://localhost:8080/api/v1/movies/coming
```

##### **GET Movie Trailer**
```http
GET http://localhost:8080/api/v1/movies/1/trailer
```

**Expected Response:**
```json
{
  "status": 200,
  "code": 200,
  "data": "https://www.youtube.com/watch?v=example"
}
```

##### **GET Movies with Complex Filters**
```http
GET http://localhost:8080/api/v1/movies?date=2025-01-30T00:00:00.000Z&theaterId=1&page=0&size=3
```

### 3. Test với Script tự động

```bash
# Chạy test script
node test-public-movie-apis.js
```

## 🧪 Validation Tests

### Test Error Cases

#### **Invalid Page Number**
```http
GET http://localhost:8080/api/v1/movies?page=-1
```

**Expected Response:**
```json
{
  "status": 400,
  "code": 400,
  "message": "Validation Error",
  "details": [
    {
      "field": "page",
      "message": "Page must be a non-negative number"
    }
  ]
}
```

#### **Invalid Size**
```http
GET http://localhost:8080/api/v1/movies?size=200
```

#### **Invalid Date Format**
```http
GET http://localhost:8080/api/v1/movies?date=invalid-date
```

#### **Invalid Theater ID**
```http
GET http://localhost:8080/api/v1/movies?theaterId=invalid
```

#### **Invalid Movie ID**
```http
GET http://localhost:8080/api/v1/movies/invalid
```

#### **Non-existent Movie**
```http
GET http://localhost:8080/api/v1/movies/999999
```

**Expected Response:**
```json
{
  "status": 404,
  "code": 404,
  "message": "Movie not found"
}
```

#### **Non-existent Trailer**
```http
GET http://localhost:8080/api/v1/movies/999999/trailer
```

## 🔍 Database Verification

### Check Database Directly
```sql
-- Xem movies với showtimes
SELECT DISTINCT m.id, m.title, m.release_date, s.start_time, s.end_time
FROM movies m
JOIN showtimes s ON m.id = s.movie_id
WHERE s.start_time >= NOW() AND s.end_time > NOW()
ORDER BY m.title;

-- Xem movies với genres
SELECT m.id, m.title, GROUP_CONCAT(g.genre_name) as genres
FROM movies m
LEFT JOIN movie_genre mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
GROUP BY m.id, m.title;

-- Xem showtimes theo theater
SELECT t.name as theater, s.name as screen, m.title, st.start_time, st.end_time
FROM theaters t
JOIN screens s ON t.id = s.theater_id
JOIN showtimes st ON s.id = st.screen_id
JOIN movies m ON st.movie_id = m.id
WHERE st.start_time >= NOW()
ORDER BY t.name, s.name, st.start_time;

-- Đếm movies với active showtimes
SELECT COUNT(DISTINCT m.id) as movies_with_showtimes
FROM movies m
JOIN showtimes s ON m.id = s.movie_id
WHERE s.start_time >= NOW() AND s.end_time > NOW();
```

## 📊 Performance Tests

### Load Testing với Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > public-movie-load-test.yml << EOF
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 20
scenarios:
  - name: "Public Movie API Load Test"
    requests:
      - get:
          url: "/api/v1/movies"
      - get:
          url: "/api/v1/movies/1"
      - get:
          url: "/api/v1/movies/showing"
      - get:
          url: "/api/v1/movies/coming"
      - get:
          url: "/api/v1/movies/1/trailer"
EOF

# Run load test
artillery run public-movie-load-test.yml
```

## 🐛 Troubleshooting

### Common Issues

#### **1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Kiểm tra MySQL service đang chạy và config database đúng.

#### **2. No Movies Found**
```
Empty data array in response
```
**Solution:** 
- Kiểm tra có movies trong database không
- Kiểm tra có showtimes active không
- Kiểm tra associations giữa movies và showtimes

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
Validation Error: Page must be a non-negative number
```
**Solution:** Đảm bảo request parameters hợp lệ.

#### **5. Association Errors**
```
Error: Movie.genres is not a function
```
**Solution:** Kiểm tra associations trong models/index.js đã được setup đúng.

#### **6. Date Format Issues**
```
Error: Invalid date format
```
**Solution:** Sử dụng ISO date format (YYYY-MM-DDTHH:mm:ss.sssZ).

## 📈 Success Criteria

✅ **All APIs return correct status codes**
✅ **Pagination works properly**
✅ **Date filtering works**
✅ **Theater filtering works**
✅ **Movie details include all fields**
✅ **Genre associations work**
✅ **Showtime filtering works**
✅ **Validation works properly**
✅ **Database operations successful**
✅ **Error handling works**
✅ **Response format matches Spring Boot**
✅ **Performance acceptable (< 200ms response time)**

## 🔄 Comparison với Spring Boot

| Feature | Spring Boot | Node.js | Status |
|---------|-------------|---------|---------|
| GET /movies | ✅ | ✅ | ✅ |
| GET /movies/{id} | ✅ | ✅ | ✅ |
| GET /movies/showing | ✅ | ✅ | ✅ |
| GET /movies/coming | ✅ | ✅ | ✅ |
| GET /movies/{id}/trailer | ✅ | ✅ | ✅ |
| Date Filtering | ✅ | ✅ | ✅ |
| Theater Filtering | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Genre Associations | ✅ | ✅ | ✅ |
| Showtime Filtering | ✅ | ✅ | ✅ |
| Validation | ✅ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ |
| Response Format | ✅ | ✅ | ✅ |

## 📝 Notes

- **API Endpoints** giữ nguyên format như Spring Boot
- **Response Structure** tương thích 100% với frontend
- **Pagination** được implement đầy đủ
- **Date/Time filtering** hoạt động chính xác
- **Theater filtering** qua showtimes và screens
- **Genre associations** được load đúng cách
- **Showtime filtering** chỉ lấy active showtimes
- **Validation Rules** được implement đầy đủ
- **Error Messages** giống với Spring Boot
- **Database Schema** không thay đổi

## 🎉 Next Steps

Sau khi test thành công Public Movie Selection, có thể tiếp tục chuyển đổi:
1. **Screen Management**
2. **Seat Management**
3. **Showtime Management**
4. **User Management**
5. **Booking Management**
6. **Promotion Management**
7. **Festival Management**
8. **Ticket Price Management**
9. **Payment Management**

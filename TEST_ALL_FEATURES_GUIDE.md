# Hướng dẫn Test Tổng Hợp - Các Chức Năng Đã Chuyển Đổi

## 🎯 Overview
Hướng dẫn test tất cả các chức năng đã được chuyển đổi từ Spring Boot sang Node.js:
1. **Movie Management** (Admin)
2. **Home API** (Public)
3. **Genre Management** (Admin)
4. **News Management** (Admin + Public)
5. **Theater Management** (Admin + Public)
6. **Public Movie Selection** (Public)
7. **Coupon Feature** (Admin + User)

## 📋 Prerequisites & Setup

### 1. Database Setup
```sql
-- Kiểm tra các tables cần thiết
SHOW TABLES;

-- Các tables cần có:
-- movies, genres, movie_genre, news, theaters, screens, showtimes
-- users, coupons, user_coupons, festivals, promotions, ticket_prices, banners
```

### 2. Environment Variables
Tạo file `.env` trong thư mục `BE/`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sdn302
DB_USER=root
DB_PASSWORD=your_password

# Server
PORT=8080
NODE_ENV=development

# Cloudinary (cho image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Dependencies
```bash
cd BE
npm install
```

### 4. Start Server
```bash
npm run dev
```

## 🚀 Test Sequence

### Phase 1: Basic Connectivity Test
```bash
# Test server health
curl http://localhost:8080/api/v1/health

# Expected: {"status": 200, "message": "Server is running", ...}
```

### Phase 2: Database Connection Test
```bash
# Test database connection bằng cách gọi API đơn giản
curl http://localhost:8080/api/v1/genres

# Expected: {"status": 200, "code": 200, "data": [...]}
```

### Phase 3: Individual Feature Tests

#### **Test 1: Genre Management**
```bash
# Test script
node test-genre-apis.js

# Manual test
curl http://localhost:8080/api/v1/admin/genres
curl -X POST http://localhost:8080/api/v1/admin/genre/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Genre"}'
```

#### **Test 2: Movie Management**
```bash
# Test script
node test-movie-apis.js

# Manual test
curl http://localhost:8080/api/v1/admin/movies
curl http://localhost:8080/api/v1/movies
```

#### **Test 3: News Management**
```bash
# Test script
node test-news-apis.js

# Manual test
curl http://localhost:8080/api/v1/admin/news
curl http://localhost:8080/api/v1/news
```

#### **Test 4: Theater Management**
```bash
# Test script
node test-theater-apis.js

# Manual test
curl http://localhost:8080/api/v1/admin/theaters
curl http://localhost:8080/api/v1/theaters
```

#### **Test 5: Public Movie Selection**
```bash
# Test script
node test-public-movie-apis.js

# Manual test
curl http://localhost:8080/api/v1/movies
curl http://localhost:8080/api/v1/movies/showing
curl http://localhost:8080/api/v1/movies/coming
```

#### **Test 6: Coupon Feature**
```bash
# Test script
node test-coupon-apis.js

# Manual test
curl http://localhost:8080/api/v1/admin/coupons
curl http://localhost:8080/api/v1/user/available-coupons/1
```

#### **Test 7: Home API**
```bash
# Manual test
curl http://localhost:8080/api/v1/genres
curl http://localhost:8080/api/v1/theaters-near?lat=21.0285&lng=105.8542&radius=10
curl http://localhost:8080/api/v1/movies-showing
curl http://localhost:8080/api/v1/movies-coming
curl http://localhost:8080/api/v1/news
curl http://localhost:8080/api/v1/festivals
curl http://localhost:8080/api/v1/promotions
curl http://localhost:8080/api/v1/ticket-prices
```

## 🔧 Common Issues & Solutions

### Issue 1: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Kiểm tra MySQL service đang chạy:
```bash
# Windows
net start mysql

# Linux/Mac
sudo systemctl start mysql
# hoặc
brew services start mysql
```

2. Kiểm tra config database trong `BE/src/config/database.js`:
```javascript
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'sdn302',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);
```

3. Test connection:
```bash
mysql -u root -p -h localhost -P 3306
```

### Issue 2: Missing Tables
```
Error: Table 'sdn302.movies' doesn't exist
```

**Solutions:**
1. Kiểm tra database có tồn tại không:
```sql
SHOW DATABASES;
USE sdn302;
SHOW TABLES;
```

2. Nếu thiếu tables, tạo từ Spring Boot schema hoặc chạy migration:
```sql
-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS sdn302;
USE sdn302;

-- Tạo các tables cần thiết (copy từ Spring Boot)
-- movies, genres, movie_genre, news, theaters, screens, showtimes
-- users, coupons, user_coupons, festivals, promotions, ticket_prices, banners
```

### Issue 3: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solutions:**
1. Kill process trên port 8080:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

2. Hoặc đổi port trong `.env`:
```env
PORT=8081
```

### Issue 4: Missing Dependencies
```
Error: Cannot find module 'sequelize'
```

**Solutions:**
```bash
cd BE
npm install
```

### Issue 5: Cloudinary Configuration Error
```
Error: Cloudinary configuration missing
```

**Solutions:**
1. Kiểm tra `.env` file có đầy đủ Cloudinary config:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. Hoặc comment out Cloudinary trong code nếu không cần:
```javascript
// Trong BE/src/config/cloudinary.js
export const uploadToCloudinary = async (file) => {
  // return null; // Disable Cloudinary temporarily
  // ... existing code
};
```

### Issue 6: Association Errors
```
Error: Movie.genres is not a function
```

**Solutions:**
1. Kiểm tra associations trong `BE/src/models/index.js`:
```javascript
// Đảm bảo có đầy đủ associations
Movie.belongsToMany(Genre, {
  through: MovieGenre,
  foreignKey: 'movieId',
  otherKey: 'genreId',
  as: 'genres'
});
```

2. Restart server sau khi sửa models:
```bash
npm run dev
```

### Issue 7: Validation Errors
```
Validation Error: Name cannot be empty
```

**Solutions:**
1. Kiểm tra request body format:
```json
{
  "name": "Valid Name",
  "code": "VALID_CODE",
  "value": 1000,
  "exchange_point": 50
}
```

2. Kiểm tra Content-Type header:
```bash
curl -H "Content-Type: application/json" ...
```

## 📊 Database Verification

### Check All Tables Exist
```sql
USE sdn302;
SHOW TABLES;

-- Expected tables:
-- movies, genres, movie_genre, news, theaters, screens, showtimes
-- users, coupons, user_coupons, festivals, promotions, ticket_prices, banners
```

### Check Data Integrity
```sql
-- Check movies
SELECT COUNT(*) FROM movies;
SELECT * FROM movies LIMIT 5;

-- Check genres
SELECT COUNT(*) FROM genres;
SELECT * FROM genres LIMIT 5;

-- Check movie-genre associations
SELECT m.title, g.genre_name 
FROM movies m
JOIN movie_genre mg ON m.id = mg.movie_id
JOIN genres g ON mg.genre_id = g.id
LIMIT 10;

-- Check theaters
SELECT COUNT(*) FROM theaters;
SELECT * FROM theaters LIMIT 5;

-- Check users
SELECT COUNT(*) FROM users;
SELECT id, first_name, last_name, point FROM users LIMIT 5;

-- Check coupons
SELECT COUNT(*) FROM coupons;
SELECT * FROM coupons LIMIT 5;
```

### Check Associations
```sql
-- Check movie-genre associations
SELECT COUNT(*) FROM movie_genre;

-- Check user-coupon associations
SELECT COUNT(*) FROM user_coupons;

-- Check showtime associations
SELECT COUNT(*) FROM showtimes;
```

## 🧪 Comprehensive Test Script

Tạo file `test-all-features.js`:
```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

const testAllFeatures = async () => {
  console.log('🚀 Testing All Converted Features');
  console.log('==================================');
  
  const tests = [
    { name: 'Health Check', url: '/health' },
    { name: 'Genres', url: '/genres' },
    { name: 'Movies', url: '/movies' },
    { name: 'News', url: '/news' },
    { name: 'Theaters', url: '/theaters' },
    { name: 'Coupons', url: '/admin/coupons' },
    { name: 'Movies Showing', url: '/movies/showing' },
    { name: 'Movies Coming', url: '/movies/coming' }
  ];
  
  for (const test of tests) {
    try {
      const response = await axios.get(`${BASE_URL}${test.url}`);
      console.log(`✅ ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || error.message}`);
    }
  }
};

testAllFeatures();
```

## 📈 Success Criteria

### ✅ All Features Working:
- ✅ Server starts without errors
- ✅ Database connection successful
- ✅ All API endpoints respond correctly
- ✅ CRUD operations work
- ✅ Pagination works
- ✅ Search/Filter works
- ✅ Validation works
- ✅ Error handling works
- ✅ Response format matches Spring Boot

### ✅ Performance:
- ✅ Response time < 500ms
- ✅ No memory leaks
- ✅ Database queries optimized
- ✅ Proper error handling

## 🎯 Next Steps

Sau khi test thành công tất cả features:

1. **Deploy to Production** (nếu cần)
2. **Continue converting remaining features**:
   - Screen Management
   - Seat Management
   - Showtime Management
   - User Management
   - Booking Management
   - Payment Management

3. **Frontend Integration**:
   - Update API base URL
   - Test frontend với Node.js backend
   - Fix any compatibility issues

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trong terminal
2. Check database connection
3. Check environment variables
4. Check file permissions
5. Restart server và database

**Chúc bạn test thành công!** 🎉

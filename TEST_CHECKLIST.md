# Checklist - Setup & Test Node.js Backend

## ✅ Pre-Test Checklist

### 1. Database Setup
- [ ] **MySQL service đang chạy**
  ```bash
  # Windows
  net start mysql
  
  # Linux/Mac
  sudo systemctl start mysql
  # hoặc
  brew services start mysql
  ```

- [ ] **Database `sdn302` tồn tại**
  ```sql
  SHOW DATABASES;
  USE sdn302;
  ```

- [ ] **Các tables cần thiết tồn tại**
  ```sql
  SHOW TABLES;
  -- Cần có: movies, genres, movie_genre, news, theaters, screens, showtimes
  -- users, coupons, user_coupons, festivals, promotions, ticket_prices, banners
  ```

- [ ] **Có dữ liệu mẫu trong database**
  ```sql
  SELECT COUNT(*) FROM movies;
  SELECT COUNT(*) FROM genres;
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM theaters;
  ```

### 2. Environment Setup
- [ ] **File `.env` đã tạo trong thư mục `BE/`**
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=sdn302
  DB_USER=root
  DB_PASSWORD=your_password
  PORT=8080
  NODE_ENV=development
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

- [ ] **Dependencies đã install**
  ```bash
  cd BE
  npm install
  ```

- [ ] **Port 8080 không bị chiếm**
  ```bash
  # Windows
  netstat -ano | findstr :8080
  
  # Linux/Mac
  lsof -i :8080
  ```

### 3. Code Setup
- [ ] **Tất cả files đã được tạo**
  - [ ] `BE/src/models/` - Tất cả model files
  - [ ] `BE/src/services/` - Tất cả service files
  - [ ] `BE/src/controllers/` - Tất cả controller files
  - [ ] `BE/src/routes/` - Tất cả route files
  - [ ] `BE/src/validators/` - Tất cả validator files
  - [ ] `BE/src/middleware/` - Error handling middleware
  - [ ] `BE/src/config/` - Database và Cloudinary config

- [ ] **File `BE/src/app.js` đã được cập nhật**
  - [ ] Import tất cả routes
  - [ ] Mount tất cả routes
  - [ ] Error handling middleware

- [ ] **File `BE/src/models/index.js` đã được cập nhật**
  - [ ] Import tất cả models
  - [ ] Setup tất cả associations
  - [ ] Export tất cả models

## 🚀 Test Execution

### Phase 1: Basic Tests
- [ ] **Start server**
  ```bash
  cd BE
  npm run dev
  ```

- [ ] **Test server health**
  ```bash
  curl http://localhost:8080/api/v1/health
  ```

- [ ] **Test database connection**
  ```bash
  curl http://localhost:8080/api/v1/genres
  ```

### Phase 2: Individual Feature Tests
- [ ] **Test Genre Management**
  ```bash
  node test-genre-apis.js
  ```

- [ ] **Test Movie Management**
  ```bash
  node test-movie-apis.js
  ```

- [ ] **Test News Management**
  ```bash
  node test-news-apis.js
  ```

- [ ] **Test Theater Management**
  ```bash
  node test-theater-apis.js
  ```

- [ ] **Test Public Movie Selection**
  ```bash
  node test-public-movie-apis.js
  ```

- [ ] **Test Coupon Feature**
  ```bash
  node test-coupon-apis.js
  ```

### Phase 3: Comprehensive Test
- [ ] **Run comprehensive test**
  ```bash
  node test-all-features.js
  ```

### Phase 4: Manual API Tests
- [ ] **Test với Postman/Thunder Client**
  - [ ] GET endpoints
  - [ ] POST endpoints
  - [ ] PUT endpoints
  - [ ] DELETE endpoints
  - [ ] Pagination
  - [ ] Search/Filter
  - [ ] Validation errors

## 🔧 Common Issues & Solutions

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- [ ] Check MySQL service running
- [ ] Check database credentials in `.env`
- [ ] Check database exists

### Issue: Missing Tables
```
Error: Table 'sdn302.movies' doesn't exist
```
**Solution:**
- [ ] Check database schema
- [ ] Create missing tables
- [ ] Import data from Spring Boot

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:**
- [ ] Kill process on port 8080
- [ ] Change port in `.env`

### Issue: Missing Dependencies
```
Error: Cannot find module 'sequelize'
```
**Solution:**
- [ ] Run `npm install`
- [ ] Check `package.json`

### Issue: Association Errors
```
Error: Movie.genres is not a function
```
**Solution:**
- [ ] Check `models/index.js` associations
- [ ] Restart server

### Issue: Validation Errors
```
Validation Error: Name cannot be empty
```
**Solution:**
- [ ] Check request body format
- [ ] Check Content-Type header

## 📊 Success Criteria

### ✅ All Tests Pass:
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All API endpoints respond correctly
- [ ] CRUD operations work
- [ ] Pagination works
- [ ] Search/Filter works
- [ ] Validation works
- [ ] Error handling works
- [ ] Response format matches Spring Boot

### ✅ Performance:
- [ ] Response time < 500ms
- [ ] No memory leaks
- [ ] Database queries optimized

## 🎯 Next Steps

After successful testing:
- [ ] **Deploy to production** (if needed)
- [ ] **Continue converting remaining features**
- [ ] **Frontend integration**
- [ ] **Performance optimization**

## 📞 Support

If you encounter issues:
1. Check server logs
2. Check database connection
3. Check environment variables
4. Check file permissions
5. Restart server and database

**Good luck with your testing!** 🎉

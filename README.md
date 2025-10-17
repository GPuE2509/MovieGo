# Movie Theater Backend API

A comprehensive Spring Boot backend application for a movie ticket booking system with advanced security, payment integration, and admin management features.

## 🚀 Features

### Core Functionality
- **Movie Management**: CRUD operations for movies, genres, and showtimes
- **Theater Management**: Multi-theater support with screen and seat management
- **Booking System**: Advanced booking with seat selection and payment processing
- **User Management**: Authentication, authorization, and profile management
- **Admin Dashboard**: Comprehensive admin panel for theater management
- **Payment Integration**: Multiple payment gateways (VNPay, PayPal, MoMo)
- **Email Services**: Automated email notifications and OTP verification
- **File Management**: Cloudinary integration for image uploads
- **Statistics & Analytics**: Comprehensive reporting and analytics

### Security Features
- **JWT Authentication**: Stateless authentication with token-based security
- **Role-Based Access Control**: Fine-grained authorization (USER, ADMIN)
- **Password Security**: BCrypt encryption with account lockout protection
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive request validation and sanitization
- **Token Blacklisting**: Secure logout with token invalidation

## 🛠️ Technology Stack

### Core Framework
- **Spring Boot 3.3.4** - Main application framework
- **Java 17** - Programming language
- **Gradle** - Build tool and dependency management

### Database & ORM
- **MySQL 8.0** - Primary database
- **Spring Data JPA** - Object-relational mapping
- **Hibernate** - JPA implementation

### Security
- **Spring Security 6** - Security framework
- **JWT (JSON Web Tokens)** - Stateless authentication
- **BCrypt** - Password encryption

### External Integrations
- **Cloudinary** - Cloud image management
- **Gmail SMTP** - Email services
- **VNPay** - Vietnamese payment gateway
- **PayPal** - International payment processing
- **MoMo** - Mobile money payment
- **Exchange Rate API** - Currency conversion

### Development Tools
- **Lombok** - Code generation and boilerplate reduction
- **SpringDoc OpenAPI** - API documentation
- **Spring Boot DevTools** - Development utilities
- **JUnit 5** - Unit testing framework

## 📁 Project Structure

```
src/main/java/com/ra/base_spring_boot/
├── advice/                    # Global exception handling
├── config/                    # Configuration classes
├── controller/                # REST API controllers
│   ├── AuthController.java    # Authentication endpoints
│   ├── HomeController.java    # Public home page data
│   ├── MovieController.java   # Movie management (Admin)
│   ├── BookingController.java # User booking operations
│   ├── TheaterController.java # Theater management
│   ├── UserController.java    # User management (Admin)
│   ├── PaymentController.java # Payment management
│   └── ...
├── dto/                       # Data Transfer Objects
│   ├── req/                   # Request DTOs
│   └── resp/                  # Response DTOs
├── exception/                 # Custom exception classes
├── model/                     # Entity classes
│   ├── base/                  # Base entity classes
│   ├── constants/             # Enum constants
│   ├── User.java             # User entity
│   ├── Movie.java            # Movie entity
│   ├── Theater.java          # Theater entity
│   ├── Booking.java          # Booking entity
│   └── ...
├── repository/                # Data access layer
├── security/                  # Security configuration
│   ├── jwt/                   # JWT implementation
│   ├── principle/             # User details service
│   └── exception/             # Security exception handlers
├── services/                  # Business logic layer
│   ├── impl/                  # Service implementations
│   └── interfaces/            # Service interfaces
└── util/                      # Utility classes
```

## 🔐 Security Architecture

### Authentication Flow

1. **User Login**:
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **JWT Token Generation**:
   - Validates credentials using Spring Security
   - Generates JWT token with user claims
   - Returns token with user information

3. **Token Validation**:
   - `JwtTokenFilter` intercepts all requests
   - Validates token signature and expiration
   - Loads user details and sets security context

### Authorization Levels

#### Public Endpoints
```java
// No authentication required
.requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
.requestMatchers("/api/v1/now-showing", "/api/v1/now-coming").permitAll()
```

#### User Endpoints
```java
// Requires USER role
.requestMatchers("/api/v1/user/**").hasAuthority("ROLE_USER")
```

#### Admin Endpoints
```java
// Requires ADMIN role
.requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
```

### Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/user/**").hasAuthority("ROLE_USER")
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

## 🗄️ Database Schema

### Core Entities

#### User Entity
```java
@Entity
@Table(name = "users")
public class User extends BaseObject {
    private String firstName;
    private String lastName;
    private String email;        // Unique
    private String password;     // BCrypt encrypted
    private String avatar;
    private String phone;
    private String address;
    private UserStatus status;   // ACTIVE, BLOCKED
    private Date banUntil;
    private Integer point;
    
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Role> roles;     // ROLE_USER, ROLE_ADMIN
}
```

#### Movie Entity
```java
@Entity
@Table(name = "movies")
public class Movie extends BaseObject {
    private String title;
    private String description;
    private String author;
    private String image;
    private String trailer;
    private MovieType type;      // MOVIE, SERIES
    private int duration;
    private Date releaseDate;
    private String actors;
    private String nation;
    
    @ManyToMany
    private Set<Genre> genres;
}
```

#### Booking Entity
```java
@Entity
@Table(name = "bookings")
public class Booking extends BaseObject {
    @ManyToOne
    private User user;
    
    @ManyToOne
    private Showtime showtime;
    
    private int totalSeat;
    private BookingStatus status;    // PENDING, CONFIRMED, CANCELLED
    private double totalPriceMovie;
    
    @OneToMany(mappedBy = "booking")
    private Set<BookingSeat> bookingSeats;
    
    @OneToOne(mappedBy = "booking")
    private Payment payment;
}
```

## 🔌 API Endpoints

### Authentication Endpoints

#### Public Endpoints
```http
POST /api/v1/auth/login          # User login
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/ban            # Ban user (after failed attempts)
POST /api/v1/auth/logout         # User logout (authenticated)
POST /api/v1/auth/forgot-password # Request password reset
POST /api/v1/auth/verify-otp     # Verify OTP
POST /api/v1/auth/reset-password # Reset password
```

#### Home Page Endpoints
```http
GET /api/v1/now-showing          # Get currently showing movies
GET /api/v1/now-coming           # Get upcoming movies
GET /api/v1/get-all-banners      # Get banner images
GET /api/v1/get-all-festivals    # Get festival information
GET /api/v1/get-all-promotion    # Get promotions
GET /api/v1/get-all-genres       # Get all genres
GET /api/v1/theaters-near        # Find nearby theaters
```

### User Endpoints (Authenticated)

#### Booking Management
```http
POST /api/v1/user/bookings                    # Create booking
GET /api/v1/user/bookings/my-bookings         # Get user bookings
POST /api/v1/user/bookings/pay/{bookingId}    # Process payment
POST /api/v1/user/bookings/apply-coupon/{bookingId} # Apply coupon
GET /api/v1/user/bookings/getAllHistoryAward  # Get award history
```

#### Profile Management
```http
GET /api/v1/user/get-profile-user/{userId}    # Get user profile
PUT /api/v1/user/update-profile-user/{userId} # Update profile
PUT /api/v1/user/update-avatar/{userId}       # Update avatar
PUT /api/v1/user/change-password/{userId}     # Change password
```

#### Coupon Management
```http
GET /api/v1/user/available-coupons/{userId}   # Get available coupons
GET /api/v1/user/my-coupons/{userId}          # Get user coupons
POST /api/v1/user/exchange/{couponId}/{userId} # Exchange coupon
GET /api/v1/user/can-exchange/{couponId}/{userId} # Check if can exchange
```

### Admin Endpoints (Admin Role Required)

#### Movie Management
```http
GET /api/v1/admin/movies                       # Get all movies
GET /api/v1/admin/movie/{id}                   # Get movie by ID
POST /api/v1/admin/movie/create                # Create movie
PUT /api/v1/admin/movie/update/{id}            # Update movie
DELETE /api/v1/admin/movie/delete/{id}         # Delete movie
PATCH /api/v1/admin/movie/update/image/{id}    # Update movie image
```

#### User Management
```http
GET /api/v1/admin/users                        # Get all users
GET /api/v1/admin/users/{id}                   # Get user by ID
PATCH /api/v1/admin/users/update/status/{id}   # Update user status
DELETE /api/v1/admin/users/{id}                # Delete user
```

#### Theater Management
```http
GET /api/v1/admin/theaters                     # Get all theaters
POST /api/v1/admin/theater/create              # Create theater
PUT /api/v1/admin/theater/update/{id}          # Update theater
DELETE /api/v1/admin/theater/delete/{id}       # Delete theater
```

#### Statistics & Analytics
```http
GET /api/v1/admin/statistics/users             # User statistics
GET /api/v1/admin/statistics/movies            # Movie statistics
GET /api/v1/admin/statistics/revenue           # Revenue statistics
GET /api/v1/admin/statistics/tickets           # Ticket statistics
GET /api/v1/admin/statistics/news-events       # News and events stats
GET /api/v1/admin/statistics/suppliers         # Supplier revenue stats
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MYSQL_DB_HOST=localhost
MYSQL_DB_PORT=3307
MYSQL_DATABASE=base_core
MYSQL_USER=root
MYSQL_PASSWORD=123456

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here-make-it-long-and-secure

# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Configuration
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/success
VNPAY_IPN_URL=http://localhost:8080/api/v1/payment/vnpay/ipn

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_RETURN_URL=http://localhost:3000/payment/success
PAYPAL_CANCEL_URL=http://localhost:3000/payment/cancel

MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_PAY_URL=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/success
MOMO_IPN_URL=http://localhost:8080/api/v1/payment/momo/ipn

# Exchange Rate API
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
EXCHANGE_RATE_API_KEY=your-api-key

# Frontend Configuration
VITE_BASE_URL=http://localhost:3000
```

### Application Properties

```yaml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_DB_HOST}:${MYSQL_DB_PORT}/${MYSQL_DATABASE}
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        time_zone: Asia/Ho_Chi_Minh
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

jwt:
  secret:
    key: ${JWT_SECRET_KEY}
  expired:
    access: 86400000 # 24 hours
```

## 🚀 Running the Application

### Prerequisites
- Java 17 or higher
- MySQL 8.0
- Gradle 7.0 or higher

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BE
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MySQL database**:
   ```bash
   # Using Docker
   docker run --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=base_core -p 3307:3306 -d mysql:8.0
   ```

4. **Run the application**:
   ```bash
   ./gradlew bootRun
   ```

5. **Access the application**:
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

### Docker Deployment

1. **Build the application**:
   ```bash
   ./gradlew build
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## 🔒 Security Best Practices

### JWT Security
- **Token Expiration**: 24-hour access tokens
- **Token Blacklisting**: Secure logout implementation
- **Secret Key**: Strong, randomly generated secret key
- **Algorithm**: HS256 for token signing

### Password Security
- **BCrypt Encryption**: Industry-standard password hashing
- **Account Lockout**: Automatic account blocking after failed attempts
- **Password Validation**: Minimum length and complexity requirements

### API Security
- **CORS Configuration**: Restricted to specific origins
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries with JPA
- **XSS Protection**: Input sanitization and output encoding

### Data Protection
- **Database Encryption**: Sensitive data encryption at rest
- **Connection Security**: SSL/TLS for database connections
- **Audit Logging**: Comprehensive security event logging

## 📊 API Response Format

### Standard Response Structure
```json
{
  "status": "OK",
  "code": 200,
  "data": {
    // Response data
  },
  "message": "Success"
}
```

### Error Response Structure
```json
{
  "status": "BAD_REQUEST",
  "code": 400,
  "data": "Error message",
  "message": "Validation failed"
}
```

### Paginated Response Structure
```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests LoginServiceTest

# Run tests with coverage
./gradlew test jacocoTestReport
```

### Integration Tests
```bash
# Run integration tests
./gradlew integrationTest
```

### API Testing
- **Swagger UI**: Interactive API documentation and testing
- **Postman Collection**: Pre-configured API requests
- **JUnit Tests**: Automated API endpoint testing

## 📈 Monitoring & Logging

### Application Logging
- **Logback**: Structured logging configuration
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Log Rotation**: Automatic log file management

### Health Checks
```http
GET /actuator/health          # Application health status
GET /actuator/info           # Application information
GET /actuator/metrics        # Application metrics
```

### Performance Monitoring
- **Response Time Tracking**: API endpoint performance monitoring
- **Database Query Monitoring**: Slow query detection
- **Memory Usage Tracking**: JVM memory monitoring

## 🔄 Integration with Frontend

### CORS Configuration
```java
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
config.setAllowedMethods(List.of("*"));
config.setAllowCredentials(true);
config.setAllowedHeaders(List.of("*"));
```

### API Base URL
- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://api.yourdomain.com/api/v1`

### Authentication Flow
1. Frontend sends login request to `/api/v1/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Frontend includes token in Authorization header for subsequent requests
5. Backend validates token on each protected request

## 🚀 Deployment

### Production Environment
1. **Environment Configuration**: Set production environment variables
2. **Database Setup**: Configure production MySQL instance
3. **SSL/TLS**: Enable HTTPS with valid certificates
4. **Load Balancing**: Configure reverse proxy (Nginx)
5. **Monitoring**: Set up application monitoring and alerting

### Docker Production
```bash
# Build production image
docker build -t movie-theater-backend .

# Run with production configuration
docker run -d \
  --name movie-backend \
  -p 8080:8080 \
  --env-file .env.production \
  movie-theater-backend
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: Interactive API documentation
- **OpenAPI Specification**: Machine-readable API specification
- **Postman Collection**: Pre-configured API requests

### Code Documentation
- **JavaDoc**: Comprehensive code documentation
- **README Files**: Component-specific documentation
- **Architecture Diagrams**: System design documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the API documentation
- **Issues**: Create an issue in the repository
- **Email**: Contact the development team

---

**Last Updated**: January 2025
**Version**: 1.0.0 
require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./src/config/database");

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MovieGo API',
      version: '1.0.0',
      description: 'API documentation for MovieGo',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.js', './src/models/**/*.js'], // Đường dẫn tới các file chứa API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Connect to database
connectDB();

const authRouter = require("./src/routes/auth");
const adminMovieRouter = require("./src/routes/admin/movie");
const adminBookingRouter = require("./src/routes/admin/booking");
const adminFestivalRouter = require("./src/routes/admin/festival");
const adminUserManagementRouter = require("./src/routes/admin/userManagement");
const userProfileRouter = require("./src/routes/user/profile");
const userBookingRouter = require("./src/routes/user/booking");
const homeAliasRouter = require("./src/routes/homeAlias");
const adminGenreRouter = require("./src/routes/admin/genre");
const adminNewsRouter = require("./src/routes/admin/news");
const adminTheaterRouter = require("./src/routes/admin/theater");
const theaterPublicRouter = require("./src/routes/theaterPublic");
const movieSelectionPublicRouter = require("./src/routes/movieSelectionPublic");
const adminTicketPriceRouter = require("./src/routes/admin/ticketPrice");
const adminCouponRouter = require("./src/routes/admin/coupon");
const adminPromotionRouter = require("./src/routes/admin/promotion");
const adminScreenRouter = require("./src/routes/admin/screen");
const userCouponRouter = require("./src/routes/user/coupon");
const sidebarManagementRouter = require("./src/routes/sidebarManagement");
const ticketPricePublicRouter = require("./src/routes/ticketPricePublic");
const adminPaymentManagementRouter = require("./src/routes/admin/paymentManagement");
const adminStatisticsRouter = require("./src/routes/admin/statistics");
const adminBannerRouter = require("./src/routes/admin/banner");
const recommendationsRouter = require("./src/routes/recommendations");
const adminSeatRouter = require("./src/routes/admin/seat");
const showtimePublicRouter = require("./src/routes/showtimePublic");
const adminShowtimeRouter = require("./src/routes/admin/showtime");
const paymentsRouter = require("./src/routes/payments");
// const aiRouter = require("./src/routes/ai"); // Temporarily disabled

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:8081",
      "exp://10.10.5.32:8081",
      "exp://10.10.7.126:8081",
      "exp://10.10.6.194:8081",
      "exp://10.10.7.99:8081"
    ],
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminMovieRouter);
app.use("/api/v1/admin", adminGenreRouter);
app.use("/api/v1/admin", adminNewsRouter);
app.use("/api/v1/admin", adminTheaterRouter);
app.use("/api/v1/admin", adminBookingRouter);
app.use("/api/v1/admin", adminFestivalRouter);
app.use("/api/v1/admin", adminTicketPriceRouter);
app.use("/api/v1/admin/users", adminUserManagementRouter);
app.use("/api/v1/admin", adminCouponRouter);
app.use("/api/v1/admin", adminPromotionRouter);
app.use("/api/v1/admin", adminScreenRouter);
app.use("/api/v1/admin", adminPaymentManagementRouter);
app.use("/api/v1/admin", adminStatisticsRouter);
app.use("/api/v1/admin", adminBannerRouter);
app.use("/api/v1/admin", adminSeatRouter);
app.use("/api/v1/user", userProfileRouter);
app.use("/api/v1/user/bookings", userBookingRouter);
app.use("/api/v1", homeAliasRouter);
app.use("/api/v1", theaterPublicRouter);
app.use("/api/v1", movieSelectionPublicRouter);
app.use("/api/v1/user", userCouponRouter);
app.use("/api/v1", sidebarManagementRouter);
app.use("/api/v1", ticketPricePublicRouter);
app.use("/api/v1", recommendationsRouter);
app.use("/api/v1", showtimePublicRouter);
app.use("/api/v1/admin", adminShowtimeRouter);
app.use("/api/v1/payments", paymentsRouter);
// app.use("/api/v1/ai", aiRouter); // Temporarily disabled

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // We are building a REST API, so we send back JSON for errors.
  const statusCode = err.status || 500;
  let statusMessage = "INTERNAL_SERVER_ERROR";

  if (statusCode === 404) {
    statusMessage = "NOT_FOUND";
  } else if (statusCode >= 400 && statusCode < 500) {
    statusMessage = "BAD_REQUEST";
  }

  res.status(statusCode).json({
    status: statusMessage,
    code: statusCode,
    data: err.message,
  });
});

module.exports = app;

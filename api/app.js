require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./src/config/database");

// Connect to database
connectDB();

const authRouter = require("./src/routes/auth");
const adminMovieRouter = require("./src/routes/admin/movie");
const adminBookingRouter = require("./src/routes/admin/booking");
const adminFestivalRouter = require("./src/routes/admin/festival");
const adminUserManagementRouter = require("./src/routes/admin/userManagement");
const homeRouter = require("./src/routes/home");
const homeAliasRouter = require("./src/routes/homeAlias");
const adminGenreRouter = require("./src/routes/admin/genre");
const adminNewsRouter = require("./src/routes/admin/news");
const adminTheaterRouter = require("./src/routes/admin/theater");
const theaterPublicRouter = require("./src/routes/theaterPublic");
const movieSelectionPublicRouter = require("./src/routes/movieSelectionPublic");
const adminCouponRouter = require("./src/routes/admin/coupon");
const userCouponRouter = require("./src/routes/user/coupon");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://movie-booking-vert-rho.vercel.app",
      "https://movie-booking-back.vercel.app",
      "https://movieticketbooking.io.vn",
      "https://www.movieticketbooking.io.vn",
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminMovieRouter);
app.use("/api/v1/admin", adminGenreRouter);
app.use("/api/v1/admin", adminNewsRouter);
app.use("/api/v1/admin", adminTheaterRouter);
app.use("/api/v1/admin", adminBookingRouter);
app.use("/api/v1/admin", adminFestivalRouter);
app.use("/api/v1/admin/users", adminUserManagementRouter);
app.use("/api/v1/admin", adminCouponRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1", homeAliasRouter);
app.use("/api/v1", theaterPublicRouter);
app.use("/api/v1", movieSelectionPublicRouter);
app.use("/api/v1", userCouponRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

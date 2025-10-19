require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Connect to database
connectDB();

const authRouter = require('./src/routes/auth');
const adminMovieRouter = require('./src/routes/admin/movie');
const homeRouter = require('./src/routes/home');
const homeAliasRouter = require('./src/routes/homeAlias');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://movie-booking-vert-rho.vercel.app',
    'https://movie-booking-back.vercel.app',
    'https://movieticketbooking.io.vn',
    'https://www.movieticketbooking.io.vn'
  ],
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminMovieRouter);
app.use('/api/v1/home', homeRouter);
app.use('/api/v1', homeAliasRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';

// Import routes
import movieRoutes from './routes/movie.js';
import adminMovieRoutes from './routes/admin/movie.js';
import adminGenreRoutes from './routes/admin/genre.js';
import adminNewsRoutes from './routes/admin/news.js';
import adminTheaterRoutes from './routes/admin/theater.js';
import newsRoutes from './routes/news.js';
import theaterRoutes from './routes/theater.js';
import publicMovieRoutes from './routes/publicMovie.js';
import couponRoutes from './routes/coupon.js';
import homeRoutes from './routes/home.js';
import { connectMongo, disconnectMongo } from './config/mongodb.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Import database
import { sequelize } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/movies', publicMovieRoutes);
app.use('/api/v1/admin', adminMovieRoutes);
app.use('/api/v1/admin', adminGenreRoutes);
app.use('/api/v1/admin', adminNewsRoutes);
app.use('/api/v1/admin', adminTheaterRoutes);
app.use('/api/v1', newsRoutes);
app.use('/api/v1', theaterRoutes);
app.use('/api/v1', couponRoutes);
app.use('/api/v1', homeRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    // Connect to MongoDB (optional during transition)
    try {
      await connectMongo();
    } catch (e) {
      console.warn('⚠️  MongoDB connection failed (continuing with MySQL):', e.message);
    }
    
    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SDN302 Backend Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🎬 Movie APIs: http://localhost:${PORT}/api/v1/movies`);
      console.log(`👑 Admin APIs: http://localhost:${PORT}/api/v1/admin`);
    });
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  try { await disconnectMongo(); } catch {}
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await sequelize.close();
  try { await disconnectMongo(); } catch {}
  process.exit(0);
});

startServer();

export default app;

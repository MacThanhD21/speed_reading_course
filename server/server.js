import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import smartReadRoutes from './routes/smartReadRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables before starting the server.');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development mode, always allow localhost
    if (process.env.NODE_ENV !== 'production') {
      const localhostOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (localhostOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Get allowed origins from environment variable
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
      : [];
    
    // In production, require CORS_ORIGIN to be set
    if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
      console.warn('⚠️  WARNING: CORS_ORIGIN not set in production! All requests will be denied.');
      return callback(new Error('CORS policy: Origin not allowed'));
    }
    
    // If CORS_ORIGIN is set, check against allowed list
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    } else {
      // In development with no CORS_ORIGIN, allow all (already handled localhost above)
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Speed Reading API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smartread', smartReadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
// BASE_URL is used for logging and health check endpoint info
// In production, set BASE_URL environment variable with your actual server URL
// For development, construct from host and port
const BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com' 
  : `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check endpoint: /api/health`);
  if (BASE_URL && !BASE_URL.includes('yourdomain')) {
    console.log(`📍 Server URL: ${BASE_URL}`);
  }
  
  // Log CORS configuration
  if (process.env.CORS_ORIGIN) {
    console.log(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN}`);
  } else if (process.env.NODE_ENV === 'production') {
    console.warn(`⚠️  WARNING: CORS_ORIGIN not configured! Set CORS_ORIGIN environment variable.`);
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const aiRoutes = require('./routes/ai');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const articleRoutes = require('./routes/articles');
const inquiryRoutes = require('./routes/inquiries');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// CORS Configuration - FIXED
const allowedOrigins = [
  'https://rentwiseproperties.netlify.app',
  'https://rentwiseproperties.netlify.app/',
  'http://localhost:5173',
  'http://localhost:5173/',
  process.env.FRONTEND_URL
].filter(Boolean);

// Function to normalize origin (remove trailing slash)
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, '');
};

// Middleware to normalize origin header before CORS check
app.use((req, res, next) => {
  if (req.headers.origin) {
    req.headers.origin = normalizeOrigin(req.headers.origin);
  }
  next();
});

// CORS middleware with proper configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if normalized origin is allowed
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.some(allowed => 
      normalizeOrigin(allowed) === normalizedOrigin
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Security headers with helmet but allow CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', limiter);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RentWise Properties API is running',
    timestamp: new Date().toISOString(),
    cors_origins: allowedOrigins.map(normalizeOrigin)
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.map(normalizeOrigin).join(', ')}`);
});
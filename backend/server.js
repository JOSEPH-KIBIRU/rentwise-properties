const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const articleRoutes = require('./routes/articles');
const inquiryRoutes = require('./routes/inquiries');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// CORS Configuration
const allowedOrigins = [
  'https://rentwiseproperties.co.ke',           
  'https://www.rentwiseproperties.co.ke',      
  'https://rentwiseproperties.netlify.app',
  'http://localhost:5173',
  'http://localhost:5173/',
  process.env.FRONTEND_URL
].filter(Boolean);

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

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.some(allowed => 
      normalizeOrigin(allowed) === normalizedOrigin
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', limiter);

// Health check (before any routes that might intercept)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RentWise Properties API is running',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      properties: '/api/properties',
      articles: '/api/articles',
      inquiries: '/api/inquiries',
      users: '/api/users',
      ai: '/api/ai'
    }
  });
});

// API Routes - ORDER MATTERS! Specific routes before generic ones
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/ai', aiRoutes);

// Debug route to see all registered routes (optional, remove in production)
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
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
});
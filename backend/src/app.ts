import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler, requestLogger } from './middlewares';
import { logger } from './utils';

// Create Express application
const app: Application = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }

    const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
    if (allowedOrigins.some(allowed => origin === allowed || allowed === '*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting - use higher limits in development
const isDev = config.nodeEnv === 'development';
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isDev ? 1000 : config.rateLimit.maxRequests,
  message: {
    code: 429,
    message: 'Too many requests, please try again later',
    data: null,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for auth endpoints (they have their own limiter)
    return req.path.startsWith('/api/v1/auth/');
  },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 20, // More generous in development
  message: {
    code: 429,
    message: 'Too many login attempts, please try again later',
    data: null,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    code: 200,
    message: 'Hospital Medical System API',
    data: {
      version: '1.0.0',
      documentation: '/api/v1/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
});

export default app;

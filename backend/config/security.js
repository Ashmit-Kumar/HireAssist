/**
 * Security configuration for the application
 * Ye file sabhi security middleware setup karta hai
 * Approach: Helmet + CORS + Rate limiting + Body parsing + Request tracking
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const express = require('express');
const logger = require('../utils/logger');

/**
 * Setup security middleware for the Express app
 * Ye function app me sabhi security middleware configure karta hai
 * Approach: Layer by layer security - headers, cors, rate limiting, parsing
 */
function setupSecurity(app) {
  logger.info('🔧 Configuring security middleware...');

  // Step 1: Helmet for security headers
  // Ye security headers set karta hai XSS, clickjacking etc se bachne ke liye
  setupHelmet(app);

  // Step 2: CORS for browser extension
  // Ye cross-origin requests ko handle karta hai extension ke liye
  setupCORS(app);

  // Step 3: Rate limiting
  // Ye API abuse se bachata hai request limits laga kar
  setupRateLimiting(app);

  // Step 4: Request logging
  // Ye incoming requests ko log karta hai debugging ke liye
  setupRequestLogging(app);

  // Step 5: Body parsing
  // Ye request body ko parse karta hai JSON aur URL-encoded data ke liye
  setupBodyParsing(app);

  // Step 6: Request ID tracking
  // Ye har request ko unique ID deta hai tracking ke liye
  setupRequestTracking(app);

  logger.success('✅ Security middleware configured successfully');
}

/**
 * Configure Helmet for security headers
 * Ye function security headers setup karta hai
 * Approach: CSP, XSS protection, frame options etc
 */
function setupHelmet(app) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:*", "https://localhost:*"]
      },
    },
    crossOriginEmbedderPolicy: false, // Extension compatibility ke liye disable
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  logger.debug('Helmet security headers configured');
}

/**
 * Configure CORS for browser extensions
 * Ye function CORS setup karta hai extension communication ke liye
 * Approach: Specific origins allow karna, credentials support
 */
function setupCORS(app) {
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      /^chrome-extension:\/\/.*$/,  // Chrome extensions ke liye
      /^moz-extension:\/\/.*$/      // Firefox extensions ke liye
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-User-ID', 
      'X-Session-Token',
      'X-Request-ID'
    ],
    exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining']
  };

  app.use(cors(corsOptions));
  logger.debug('CORS configured for extensions');
}

/**
 * Configure rate limiting to prevent API abuse
 * Ye function rate limiting setup karta hai API abuse rokne ke liye
 * Approach: Global limits + endpoint specific limits
 */
function setupRateLimiting(app) {
  // Global rate limiter - sabhi endpoints ke liye
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // 100 requests per window per IP
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes',
      limit: 100,
      window: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });

  app.use(globalLimiter);
  logger.debug('Global rate limiting configured: 100 req/15min');
}

/**
 * Setup request logging
 * Ye function incoming requests ko log karta hai
 * Approach: Morgan logger with custom format
 */
function setupRequestLogging(app) {
  // Development me detailed logging, production me concise
  const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  
  app.use(morgan(logFormat, {
    stream: {
      write: (message) => {
        logger.info(`HTTP Request: ${message.trim()}`);
      }
    }
  }));

  logger.debug('Request logging configured');
}

/**
 * Setup body parsing middleware
 * Ye function request body parsing setup karta hai
 * Approach: JSON + URL encoded with size limits and validation
 */
function setupBodyParsing(app) {
  // JSON body parser with validation
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        const error = new Error('Invalid JSON format');
        error.status = 400;
        throw error;
      }
    }
  }));

  // URL encoded body parser
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  logger.debug('Body parsing configured with 10MB limit');
}

/**
 * Setup request tracking with unique IDs
 * Ye function har request ko unique ID assign karta hai
 * Approach: Random ID generation + response header
 */
function setupRequestTracking(app) {
  app.use((req, res, next) => {
    // Generate unique request ID
    req.id = generateRequestId();
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', req.id);
    
    // Add timestamp for request duration tracking
    req.startTime = Date.now();
    
    // Log request start
    logger.debug(`Request ${req.id} started: ${req.method} ${req.path}`);
    
    // Log request completion
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;
      logger.debug(`Request ${req.id} completed in ${duration}ms with status ${res.statusCode}`);
    });
    
    next();
  });

  logger.debug('Request tracking configured');
}

/**
 * Generate unique request ID
 * Ye function unique request ID generate karta hai
 * Approach: Timestamp + random string combination
 */
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `req_${timestamp}_${random}`;
}

module.exports = {
  setupSecurity
};

/**
 * Rate Limiting Middleware - Specific rate limits for different endpoints
 * Ye middleware different endpoints ke liye specific rate limits provide karta hai
 * Approach: Multiple rate limiters for different security levels
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Strict rate limiter for user registration
 * Ye limiter user registration ke liye strict limits lagata hai
 * Approach: Very low limits to prevent spam registrations
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // Maximum 5 registrations per hour per IP
  message: {
    error: 'Too many registration attempts',
    message: 'You have exceeded the registration limit. Please try again in 1 hour.',
    retryAfter: '1 hour',
    limit: 5,
    window: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIP = req.ip;
    logger.warn(`🚫 Registration rate limit exceeded for IP: ${clientIP}`);
    
    res.status(429).json({
      error: 'Registration rate limit exceeded',
      message: 'Too many registration attempts from this IP',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      details: {
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
      }
    });
  },
  // Skip successful requests to allow legitimate users
  // Successful requests ko skip karta hai legitimate users ke liye
  skipSuccessfulRequests: true,
  
  // Custom key generator to also consider user agent
  // User agent ko bhi consider karta hai key generation me
  keyGenerator: (req) => {
    return `${req.ip}_${req.headers['user-agent'] || 'unknown'}`;
  }
});

/**
 * Medium rate limiter for authentication endpoints
 * Ye limiter authentication endpoints ke liye medium limits lagata hai
 * Approach: Balanced limits for login/session operations
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // 20 requests per 15 minutes per IP
  message: {
    error: 'Too many authentication attempts',
    message: 'You have exceeded the authentication limit. Please try again later.',
    retryAfter: '15 minutes',
    limit: 20,
    window: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIP = req.ip;
    logger.warn(`🚫 Auth rate limit exceeded for IP: ${clientIP}, Endpoint: ${req.path}`);
    
    res.status(429).json({
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts from this IP',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      endpoint: req.path
    });
  }
});

/**
 * Profile update rate limiter
 * Ye limiter profile update operations ke liye limits lagata hai
 * Approach: Reasonable limits for profile modifications
 */
const profileUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes window
  max: 10, // 10 profile updates per 10 minutes per IP
  message: {
    error: 'Too many profile updates',
    message: 'You are updating your profile too frequently. Please wait a moment.',
    retryAfter: '10 minutes',
    limit: 10,
    window: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIP = req.ip;
    logger.warn(`🚫 Profile update rate limit exceeded for IP: ${clientIP}`);
    
    res.status(429).json({
      error: 'Profile update rate limit exceeded',
      message: 'Too many profile updates. Please slow down.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Data retrieval rate limiter
 * Ye limiter data retrieval operations ke liye limits lagata hai
 * Approach: Higher limits for read operations
 */
const dataRetrievalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 50, // 50 data requests per 5 minutes per IP
  message: {
    error: 'Too many data requests',
    message: 'You are making too many data requests. Please slow down.',
    retryAfter: '5 minutes',
    limit: 50,
    window: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIP = req.ip;
    logger.warn(`🚫 Data retrieval rate limit exceeded for IP: ${clientIP}, Endpoint: ${req.path}`);
    
    res.status(429).json({
      error: 'Data retrieval rate limit exceeded',
      message: 'Too many data requests. Please wait before making more requests.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      endpoint: req.path
    });
  }
});

/**
 * Create custom rate limiter with specific configuration
 * Ye function custom rate limiter create karta hai specific configuration ke sath
 * Approach: Flexible rate limiter factory function
 */
function createCustomLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP'
    },
    standardHeaders: true,
    legacyHeaders: false
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Add custom handler if not provided
  // Agar custom handler nahi diya to default handler add karta hai
  if (!finalOptions.handler) {
    finalOptions.handler = (req, res) => {
      logger.warn(`🚫 Custom rate limit exceeded for IP: ${req.ip}, Endpoint: ${req.path}`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: finalOptions.message.message || 'Too many requests',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        endpoint: req.path
      });
    };
  }
  
  return rateLimit(finalOptions);
}

/**
 * Log rate limit statistics
 * Ye function rate limiting statistics log karta hai
 * Approach: Middleware to track and log rate limit usage
 */
function rateLimitLogger() {
  return (req, res, next) => {
    // Add rate limit info to response headers for debugging
    // Debugging ke liye response headers me rate limit info add karta hai
    res.on('finish', () => {
      if (req.rateLimit) {
        logger.debug(`Rate limit info for ${req.ip}: ${req.rateLimit.remaining}/${req.rateLimit.limit} remaining`);
        
        // Log when rate limit is getting close
        // Jab rate limit close aa jaye to warning log karta hai
        const usagePercentage = ((req.rateLimit.limit - req.rateLimit.remaining) / req.rateLimit.limit) * 100;
        if (usagePercentage > 80) {
          logger.warn(`⚠️ IP ${req.ip} has used ${usagePercentage.toFixed(1)}% of rate limit for ${req.path}`);
        }
      }
    });
    
    next();
  };
}

/**
 * Enhanced rate limiter with IP whitelist support
 * Ye function IP whitelist support ke sath enhanced rate limiter provide karta hai
 * Approach: Skip rate limiting for whitelisted IPs
 */
function createEnhancedLimiter(options = {}, whitelist = []) {
  const limiter = createCustomLimiter(options);
  
  return (req, res, next) => {
    // Check if IP is whitelisted
    // IP whitelist me hai ya nahi check karta hai
    const clientIP = req.ip;
    if (whitelist.includes(clientIP)) {
      logger.debug(`✅ IP ${clientIP} is whitelisted, skipping rate limit`);
      return next();
    }
    
    // Apply rate limiting
    // Rate limiting apply karta hai
    limiter(req, res, next);
  };
}

module.exports = {
  registrationLimiter,
  authLimiter,
  profileUpdateLimiter,
  dataRetrievalLimiter,
  createCustomLimiter,
  createEnhancedLimiter,
  rateLimitLogger
};

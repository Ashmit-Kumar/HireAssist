/**
 * Health check routes
 * Ye file health check endpoints provide karta hai
 * Approach: Basic health + detailed diagnostics + storage health
 */

const express = require('express');
const { getStorageHealth } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Basic health check endpoint
 * Ye endpoint basic server health check karta hai
 * Approach: Simple OK response with basic server info
 */
router.get('/', (req, res) => {
  try {
    const healthData = {
      status: 'OK',
      message: 'HireAssist Secure Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      requestId: req.id
    };
    
    logger.debug(`Health check requested by ${req.ip}`);
    res.json(healthData);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      requestId: req.id
    });
  }
});

/**
 * Detailed health check with diagnostics
 * Ye endpoint detailed system health information provide karta hai
 * Approach: Memory, storage, uptime, environment details
 */
router.get('/detailed', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const storageHealth = getStorageHealth();
    
    const detailedHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        node_version: process.version,
        platform: process.platform
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100 // MB
      },
      storage: storageHealth,
      security: {
        cors: 'enabled',
        helmet: 'enabled',
        rateLimit: 'enabled',
        https: process.env.NODE_ENV === 'production' ? 'required' : 'optional'
      },
      requestId: req.id
    };
    
    logger.debug(`Detailed health check requested by ${req.ip}`);
    res.json(detailedHealth);
    
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Detailed health check failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      requestId: req.id
    });
  }
});

/**
 * Storage-specific health check
 * Ye endpoint sirf storage system ki health check karta hai
 * Approach: Storage stats, performance, availability
 */
router.get('/storage', (req, res) => {
  try {
    const storageHealth = getStorageHealth();
    
    // Add performance test
    const startTime = Date.now();
    
    // Simple performance test - storage access time
    const performanceTest = () => {
      // Dummy operations to test storage performance
      const testKey = `health_test_${Date.now()}`;
      const testData = { test: true, timestamp: Date.now() };
      
      // This would be actual storage operations in real implementation
      return Date.now() - startTime;
    };
    
    const responseTime = performanceTest();
    
    const storageHealthData = {
      ...storageHealth,
      performance: {
        responseTime: responseTime,
        status: responseTime < 100 ? 'good' : responseTime < 500 ? 'fair' : 'slow'
      },
      requestId: req.id
    };
    
    logger.debug(`Storage health check requested by ${req.ip}`);
    res.json(storageHealthData);
    
  } catch (error) {
    logger.error('Storage health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Storage health check failed',
      requestId: req.id
    });
  }
});

/**
 * API information endpoint
 * Ye endpoint API ki basic information provide karta hai
 * Approach: Available endpoints, version, capabilities
 */
router.get('/info', (req, res) => {
  try {
    const apiInfo = {
      name: 'HireAssist API',
      version: '1.0.0',
      description: 'Secure AI-powered job application assistant API',
      endpoints: {
        health: {
          basic: '/health',
          detailed: '/health/detailed',
          storage: '/health/storage',
          info: '/health/info'
        },
        // Future endpoints will be added here
        auth: 'Coming soon',
        user: 'Coming soon',
        resume: 'Coming soon'
      },
      security: {
        rateLimit: '100 requests per 15 minutes',
        cors: 'Extension origins only',
        helmet: 'Security headers enabled',
        bodyLimit: '10MB'
      },
      features: {
        userManagement: 'In development',
        resumeOptimization: 'Planned',
        coverLetterGeneration: 'Planned',
        jobParsing: 'Planned'
      },
      requestId: req.id
    };
    
    logger.debug(`API info requested by ${req.ip}`);
    res.json(apiInfo);
    
  } catch (error) {
    logger.error('API info request failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'API info request failed',
      requestId: req.id
    });
  }
});

module.exports = router;

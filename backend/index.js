const express = require('express');
require('dotenv').config();

// Import configurations
const { setupSecurity } = require('./config/security');
const { setupDatabase } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Main server initialization function
 * Ye function server ko setup karta hai step by step
 * Approach: Security first, then routes, then error handling
 */
async function initializeServer() {
  try {
    logger.info('🚀 Starting HireAssist Secure Backend...');

    // Step 1: Setup security middleware (helmet, cors, rate limiting)
    // Ye security headers aur protection lagata hai
    setupSecurity(app);
    logger.info('✅ Security middleware configured');

    // Step 2: Setup database/storage
    // Ye data storage initialize karta hai (in-memory for now)
    await setupDatabase();
    logger.info('✅ Database/Storage initialized');

    // Step 3: Setup routes
    // Ye API endpoints define karta hai
    app.use('/health', healthRoutes);
    app.use('/api/users', userRoutes);
    logger.info('✅ Routes configured');

    // Step 4: Error handling
    // Ye global error handling setup karta hai
    setupErrorHandling(app);
    logger.info('✅ Error handling configured');

    // Step 5: Start server
    // Server ko start karta hai aur success message show karta hai
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`� User API: http://localhost:${PORT}/api/users`);
      logger.info(`�🛡️ Security: Enabled`);
    });

    // Graceful shutdown setup
    // Server ko safely band karne ke liye
    setupGracefulShutdown(server);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Global error handling setup
 * Ye function server-wide error handling setup karta hai
 * Approach: 404 handler first, then global error handler
 */
function setupErrorHandling(app) {
  // 404 handler - jab koi endpoint nahi milta
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      message: `${req.method} ${req.originalUrl} is not valid`,
      availableEndpoints: ['/health', '/api/users']
    });
  });

  // Global error handler - sabhi errors ko handle karta hai
  app.use((err, req, res, next) => {
    logger.error(`Error ${req.id}:`, err);
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: isDevelopment ? err.message : 'Something went wrong',
      requestId: req.id
    });
  });
}

/**
 * Graceful shutdown setup
 * Server ko safely shutdown karne ke liye
 * Approach: SIGTERM signal catch karke server close karta hai
 */
function setupGracefulShutdown(server) {
  process.on('SIGTERM', () => {
    logger.info('� SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('✅ Process terminated');
    });
  });

  process.on('SIGINT', () => {
    logger.info('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('✅ Process terminated');
    });
  });
}

// Start the server
// Ye main entry point hai
initializeServer();

module.exports = app;

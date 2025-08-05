/**
 * Database/Storage configuration
 * Ye file data storage setup karta hai
 * Approach: In-memory Maps for development, easily extendable to real DB
 */

const logger = require('../utils/logger');

// In-memory storage using Maps
// Development ke liye simple storage, production me real database use karenge
let storage = {
  users: new Map(),      // User profile data store karta hai
  sessions: new Map(),   // User sessions track karta hai
  resumes: new Map(),    // Resume data store karta hai
  settings: new Map()    // User settings store karta hai
};

/**
 * Initialize database/storage
 * Ye function storage system ko initialize karta hai
 * Approach: In-memory Maps setup + stats tracking
 */
async function setupDatabase() {
  try {
    logger.info('🗄️  Initializing storage system...');

    // Clear existing data (fresh start for development)
    clearAllData();

    // Setup storage statistics tracking
    setupStorageStats();

    // Initialize default data if needed
    await initializeDefaultData();

    logger.success('✅ Storage system initialized successfully');
    logStorageStats();

  } catch (error) {
    logger.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Clear all stored data
 * Ye function sabhi stored data ko clear karta hai
 * Approach: Map.clear() method use karke
 */
function clearAllData() {
  storage.users.clear();
  storage.sessions.clear();
  storage.resumes.clear();
  storage.settings.clear();
  
  logger.debug('Storage cleared for fresh start');
}

/**
 * Setup storage statistics tracking
 * Ye function storage stats track karne ke liye utilities setup karta hai
 * Approach: Getter functions for counts and memory usage
 */
function setupStorageStats() {
  // Add utility methods to storage object
  storage.getStats = () => ({
    users: storage.users.size,
    sessions: storage.sessions.size,
    resumes: storage.resumes.size,
    settings: storage.settings.size,
    totalEntries: storage.users.size + storage.sessions.size + 
                  storage.resumes.size + storage.settings.size,
    memoryUsage: process.memoryUsage()
  });

  logger.debug('Storage statistics tracking configured');
}

/**
 * Initialize default data
 * Ye function default data setup karta hai agar koi specific requirement ho
 * Approach: Future extensibility ke liye placeholder
 */
async function initializeDefaultData() {
  // Future: Default settings, admin users, etc. setup kar sakte hain
  // Abhi ke liye empty because we'll create data as needed
  
  logger.debug('Default data initialization completed');
}

/**
 * Log current storage statistics
 * Ye function current storage stats ko log karta hai
 * Approach: Get stats and format for readable output
 */
function logStorageStats() {
  const stats = storage.getStats();
  logger.info('📊 Storage Statistics:', {
    users: stats.users,
    sessions: stats.sessions,
    resumes: stats.resumes,
    settings: stats.settings,
    total: stats.totalEntries
  });
}

/**
 * Get storage instance
 * Ye function storage object return karta hai other modules ke liye
 * Approach: Singleton pattern - same storage instance everywhere
 */
function getStorage() {
  return storage;
}

/**
 * Health check for storage
 * Ye function storage ki health check karta hai
 * Approach: Basic connectivity and stats check
 */
function getStorageHealth() {
  const stats = storage.getStats();
  
  return {
    status: 'healthy',
    type: 'in-memory',
    stats: stats,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Cleanup storage (for graceful shutdown)
 * Ye function storage ko safely cleanup karta hai
 * Approach: Clear all data and log final stats
 */
function cleanupStorage() {
  logger.info('🧹 Cleaning up storage...');
  logStorageStats();
  clearAllData();
  logger.info('✅ Storage cleanup completed');
}

// Setup cleanup on process exit
process.on('exit', cleanupStorage);
process.on('SIGINT', cleanupStorage);
process.on('SIGTERM', cleanupStorage);

module.exports = {
  setupDatabase,
  getStorage,
  getStorageHealth,
  cleanupStorage
};

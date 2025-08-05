/**
 * User Service - Handles all user-related business logic
 * Ye service user management ka saara business logic handle karta hai
 * Approach: CRUD operations + validation + security integration
 */

const { getStorage } = require('../config/database');
const { generateSecureUserId, generateSessionToken, encryptSensitiveData, decryptSensitiveData } = require('./securityService');
const logger = require('../utils/logger');

/**
 * Register new user in the system
 * Ye function naya user register karta hai system me
 * Approach: Generate secure ID + create user object + store with encryption
 */
async function registerUser(profileData = {}, settingsData = {}, requestData = {}) {
  try {
    logger.info('🔄 Starting user registration process...');
    
    // Generate secure user ID
    // Secure user ID generate karta hai
    const userId = generateSecureUserId();
    
    // Generate session token for immediate login
    // Registration ke baad immediate login ke liye session token banata hai
    const sessionToken = generateSessionToken(userId);
    
    // Encrypt sensitive profile data
    // Profile data ko encrypt karta hai
    const encryptedProfile = {};
    if (profileData && Object.keys(profileData).length > 0) {
      Object.keys(profileData).forEach(key => {
        // Encrypt sensitive fields like email, phone, etc.
        // Email, phone jaise sensitive fields ko encrypt karta hai
        if (['email', 'phone', 'fullName'].includes(key)) {
          encryptedProfile[key] = encryptSensitiveData(profileData[key]);
        } else {
          encryptedProfile[key] = profileData[key];
        }
      });
    }
    
    // Merge settings with defaults
    // Settings ko defaults ke saath merge karta hai
    const userSettings = {
      ...getDefaultUserSettings(),
      ...settingsData
    };
    
    // Create user data object
    // User ka data object create karta hai
    const userData = {
      id: userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profile: encryptedProfile,
      resumes: [],
      settings: userSettings,
      metadata: {
        registrationIP: requestData.ip || 'unknown',
        userAgent: requestData.userAgent || 'unknown',
        registrationFingerprint: requestData.fingerprint || 'unknown'
      }
    };
    
    // Store user in database
    // User ko database me store karta hai
    const storage = getStorage();
    storage.users.set(userId, userData);
    
    // Store session
    // Session information store karta hai
    const sessionData = {
      userId: userId,
      token: sessionToken,
      createdAt: new Date().toISOString(),
      fingerprint: requestData.fingerprint || 'unknown',
      ip: requestData.ip || 'unknown',
      lastUsed: new Date().toISOString()
    };
    
    storage.sessions.set(sessionToken, sessionData);
    
    logger.success(`✅ User registered successfully: ${userId}`);
    logger.info(`📊 Total users: ${storage.users.size}, Total sessions: ${storage.sessions.size}`);
    
    // Return success response
    // Success response return karta hai
    return {
      success: true,
      userId: userId,
      sessionToken: sessionToken,
      profile: decryptUserSensitiveData({ profile: encryptedProfile }).profile,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      message: 'User registered successfully'
    };
    
  } catch (error) {
    logger.error('❌ User registration failed:', error);
    throw new Error('User registration failed');
  }
}

/**
 * Get user data by user ID
 * Ye function user ID se user ka data retrieve karta hai
 * Approach: Storage lookup + data decryption + safe return
 */
async function getUserById(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    const storage = getStorage();
    const userData = storage.users.get(userId);
    
    if (!userData) {
      logger.warn(`User not found: ${userId}`);
      return { success: false, error: 'User not found' };
    }
    
    // Update last active timestamp
    // Last active time update karta hai
    userData.lastActive = new Date().toISOString();
    storage.users.set(userId, userData);
    
    // Decrypt sensitive data if needed
    // Agar sensitive data encrypted hai to decrypt karta hai
    const safeUserData = decryptUserSensitiveData(userData);
    
    logger.debug(`User data retrieved for: ${userId}`);
    
    return {
      success: true,
      user: safeUserData
    };
    
  } catch (error) {
    logger.error('Failed to get user data:', error);
    throw new Error('Failed to retrieve user data');
  }
}

/**
 * Update user profile information
 * Ye function user ki profile information update karta hai
 * Approach: Validation + encryption + storage update
 */
async function updateUserProfile(userId, profileData) {
  try {
    if (!userId || !profileData) {
      throw new Error('User ID and profile data are required');
    }
    
    const storage = getStorage();
    const userData = storage.users.get(userId);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Encrypt sensitive profile data
    // Profile me sensitive data ko encrypt karta hai
    const encryptedProfile = encryptUserSensitiveData(profileData);
    
    // Update user profile
    // User profile update karta hai
    userData.profile = {
      ...userData.profile,
      ...encryptedProfile,
      updatedAt: new Date().toISOString()
    };
    
    userData.lastActive = new Date().toISOString();
    
    // Save updated user data
    // Updated data save karta hai
    storage.users.set(userId, userData);
    
    logger.success(`✅ Profile updated for user: ${userId}`);
    
    // Return decrypted profile for response
    // Response ke liye decrypted profile return karta hai
    const safeProfile = decryptUserSensitiveData(userData.profile);
    
    return {
      success: true,
      profile: safeProfile,
      message: 'Profile updated successfully'
    };
    
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Update user settings
 * Ye function user ki settings update karta hai
 * Approach: Merge with defaults + validation + storage
 */
async function updateUserSettings(userId, newSettings) {
  try {
    if (!userId || !newSettings) {
      throw new Error('User ID and settings are required');
    }
    
    const storage = getStorage();
    const userData = storage.users.get(userId);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Merge with existing settings
    // Existing settings ke sath merge karta hai
    userData.settings = {
      ...userData.settings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    
    userData.lastActive = new Date().toISOString();
    
    // Save updated user data
    // Updated data save karta hai
    storage.users.set(userId, userData);
    
    logger.success(`✅ Settings updated for user: ${userId}`);
    
    return {
      success: true,
      settings: userData.settings,
      message: 'Settings updated successfully'
    };
    
  } catch (error) {
    logger.error('Failed to update user settings:', error);
    throw error;
  }
}

/**
 * Validate session and get user data
 * Ye function session validate karta hai aur user data return karta hai
 * Approach: Session lookup + token verification + user data retrieval
 */
async function validateUserSession(sessionToken) {
  try {
    if (!sessionToken) {
      return { valid: false, error: 'Session token required' };
    }
    
    const storage = getStorage();
    const sessionData = storage.sessions.get(sessionToken);
    
    if (!sessionData) {
      return { valid: false, error: 'Invalid session' };
    }
    
    // Update session last used time
    // Session ka last used time update karta hai
    sessionData.lastUsed = new Date().toISOString();
    storage.sessions.set(sessionToken, sessionData);
    
    // Get user data
    // User data retrieve karta hai
    const userResult = await getUserById(sessionData.userId);
    
    if (!userResult.success) {
      return { valid: false, error: 'User not found' };
    }
    
    logger.debug(`Session validated for user: ${sessionData.userId}`);
    
    return {
      valid: true,
      user: userResult.user,
      session: sessionData
    };
    
  } catch (error) {
    logger.error('Session validation failed:', error);
    return { valid: false, error: 'Session validation failed' };
  }
}

/**
 * Get default user settings
 * Ye function default user settings return karta hai
 * Approach: Predefined settings object with sensible defaults
 */
function getDefaultUserSettings() {
  return {
    backendUrl: 'http://localhost:3000',
    autoFill: true,
    smartSuggestions: true,
    notifications: true,
    theme: 'light',
    language: 'en',
    privacy: {
      shareData: false,
      analytics: false
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Encrypt sensitive fields in user data
 * Ye function user data me sensitive fields ko encrypt karta hai
 * Approach: Identify sensitive fields + encrypt individually
 */
function encryptUserSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sensitiveFields = ['email', 'phone', 'fullName'];
  const encrypted = { ...data };
  
  sensitiveFields.forEach(field => {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      try {
        encrypted[field] = encryptSensitiveData(encrypted[field]);
      } catch (error) {
        logger.warn(`Failed to encrypt field ${field}:`, error);
        // Keep original value if encryption fails
      }
    }
  });
  
  return encrypted;
}

/**
 * Decrypt sensitive fields in user data
 * Ye function user data me encrypted fields ko decrypt karta hai
 * Approach: Identify encrypted fields + decrypt individually
 */
function decryptUserSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const decrypted = { ...data };
  
  Object.keys(decrypted).forEach(key => {
    if (decrypted[key] && typeof decrypted[key] === 'object' && decrypted[key].encrypted) {
      try {
        decrypted[key] = decryptSensitiveData(decrypted[key]);
      } catch (error) {
        logger.warn(`Failed to decrypt field ${key}:`, error);
        // Keep encrypted value if decryption fails
      }
    }
  });
  
  return decrypted;
}

/**
 * Get user statistics
 * Ye function user statistics provide karta hai
 * Approach: Count users, active sessions, etc.
 */
function getUserStats() {
  const storage = getStorage();
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Count active sessions
  // Active sessions count karta hai
  let activeSessions = 0;
  storage.sessions.forEach(session => {
    const lastUsed = new Date(session.lastUsed).getTime();
    if (lastUsed > oneHourAgo) {
      activeSessions++;
    }
  });
  
  // Count recent users
  // Recent users count karta hai
  let recentUsers = 0;
  storage.users.forEach(user => {
    const lastActive = new Date(user.lastActive).getTime();
    if (lastActive > oneDayAgo) {
      recentUsers++;
    }
  });
  
  return {
    totalUsers: storage.users.size,
    totalSessions: storage.sessions.size,
    activeSessions: activeSessions,
    recentUsers: recentUsers,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  registerUser,
  getUserById,
  updateUserProfile,
  updateUserSettings,
  validateUserSession,
  getUserStats
};

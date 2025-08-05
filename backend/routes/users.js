/**
 * User Registration Routes - REST API endpoints for user management
 * Ye file user registration aur profile management ke routes provide karta hai
 * Approach: Express router + middleware integration + error handling
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const userService = require('../services/userService');
const { validateUserProfile, validateUserSettings } = require('../utils/validators');
const { registrationLimiter, profileUpdateLimiter } = require('../middleware/rateLimiting');

/**
 * POST /api/users/register - Register new user
 * Ye endpoint naya user register karta hai
 * Approach: Validation -> Registration -> Response with user ID
 */
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    logger.info('User registration request received', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    const { profile, settings } = req.body;
    
    // Validate profile data
    // Profile data ko validate karta hai
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile data is required',
        code: 'MISSING_PROFILE'
      });
    }
    
    const profileValidation = validateUserProfile(profile);
    if (!profileValidation.isValid) {
      logger.warn('Profile validation failed during registration', {
        errors: profileValidation.errors,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        error: 'Profile validation failed',
        details: profileValidation.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Validate settings if provided
    // Settings validate karta hai agar provide kiye gaye hain
    let validatedSettings = {};
    if (settings) {
      const settingsValidation = validateUserSettings(settings);
      if (!settingsValidation.isValid) {
        logger.warn('Settings validation failed during registration', {
          errors: settingsValidation.errors,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          error: 'Settings validation failed',
          details: settingsValidation.errors,
          code: 'SETTINGS_VALIDATION_ERROR'
        });
      }
      validatedSettings = settingsValidation.sanitized;
    }
    
    // Register user through service
    // Service ke through user register karta hai
    const registrationResult = await userService.registerUser(
      profileValidation.sanitized,
      validatedSettings,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        fingerprint: 'web-request'
      }
    );
    
    if (!registrationResult.success) {
      logger.error('User registration failed in service layer', {
        error: registrationResult.error,
        ip: req.ip
      });
      
      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
    
    logger.info('User successfully registered', {
      userId: registrationResult.userId,
      ip: req.ip,
      hasProfile: !!profile,
      hasSettings: !!settings
    });
    
    // Return success response with user ID
    // Success response user ID ke saath return karta hai
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: registrationResult.userId,
        sessionToken: registrationResult.sessionToken,
        profile: registrationResult.profile
      }
    });
    
  } catch (error) {
    logger.error('Unexpected error during user registration', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/users/profile/:userId - Get user profile
 * Ye endpoint user profile retrieve karta hai
 * Approach: User ID validation -> Service call -> Response formatting
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    logger.info('User profile request received', {
      userId,
      ip: req.ip
    });
    
    // Validate user ID format
    // User ID format validate karta hai
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      });
    }
    
    // Get user from service
    // Service se user retrieve karta hai
    const userResult = await userService.getUserById(userId.trim());
    
    if (!userResult.success) {
      if (userResult.error === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      logger.error('Error retrieving user profile', {
        userId,
        error: userResult.error,
        ip: req.ip
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user profile',
        code: 'RETRIEVAL_ERROR'
      });
    }
    
    logger.info('User profile successfully retrieved', {
      userId,
      ip: req.ip
    });
    
    res.json({
      success: true,
      data: {
        profile: userResult.user.profile,
        settings: userResult.user.settings,
        lastUpdated: userResult.user.lastUpdated
      }
    });
    
  } catch (error) {
    logger.error('Unexpected error during profile retrieval', {
      error: error.message,
      userId: req.params.userId,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/users/profile/:userId - Update user profile
 * Ye endpoint user profile update karta hai
 * Approach: User verification -> Validation -> Update -> Response
 */
router.put('/profile/:userId', profileUpdateLimiter, async (req, res) => {
  try {
    const { userId } = req.params;
    const { profile, settings, sessionToken } = req.body;
    
    logger.info('User profile update request received', {
      userId,
      ip: req.ip,
      hasProfile: !!profile,
      hasSettings: !!settings
    });
    
    // Validate user ID
    // User ID validate karta hai
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      });
    }
    
    // Validate session token
    // Session token validate karta hai
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token is required',
        code: 'MISSING_SESSION_TOKEN'
      });
    }
    
    // Verify user session
    // User session verify karta hai
    const sessionValidation = await userService.validateUserSession(userId.trim(), sessionToken);
    
    if (!sessionValidation.success) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
    }
    
    let updateData = {};
    
    // Validate and prepare profile update
    // Profile update validate aur prepare karta hai
    if (profile) {
      const profileValidation = validateUserProfile(profile);
      if (!profileValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Profile validation failed',
          details: profileValidation.errors,
          code: 'VALIDATION_ERROR'
        });
      }
      updateData.profile = profileValidation.sanitized;
    }
    
    // Validate and prepare settings update
    // Settings update validate aur prepare karta hai
    if (settings) {
      const settingsValidation = validateUserSettings(settings);
      if (!settingsValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Settings validation failed',
          details: settingsValidation.errors,
          code: 'SETTINGS_VALIDATION_ERROR'
        });
      }
      updateData.settings = settingsValidation.sanitized;
    }
    
    // Check if there's anything to update
    // Update karne ke liye kuch hai ya nahi check karta hai
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid update data provided',
        code: 'NO_UPDATE_DATA'
      });
    }
    
    // Update user profile through service
    // Service ke through user profile update karta hai
    const updateResult = await userService.updateUserProfile(userId.trim(), updateData);
    
    if (!updateResult.success) {
      if (updateResult.error === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      logger.error('Profile update failed in service layer', {
        userId,
        error: updateResult.error,
        ip: req.ip
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_ERROR'
      });
    }
    
    logger.info('User profile successfully updated', {
      userId,
      updatedFields: Object.keys(updateData),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updateResult.user.profile,
        settings: updateResult.user.settings,
        lastUpdated: updateResult.user.lastUpdated
      }
    });
    
  } catch (error) {
    logger.error('Unexpected error during profile update', {
      error: error.message,
      userId: req.params.userId,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/users/:userId - Delete user account
 * Ye endpoint user account delete karta hai
 * Approach: Session validation -> Deletion -> Cleanup
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionToken, confirmDeletion } = req.body;
    
    logger.info('User deletion request received', {
      userId,
      ip: req.ip
    });
    
    // Validate user ID
    // User ID validate karta hai
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID'
      });
    }
    
    // Validate session token
    // Session token validate karta hai
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token is required',
        code: 'MISSING_SESSION_TOKEN'
      });
    }
    
    // Validate deletion confirmation
    // Deletion confirmation validate karta hai
    if (!confirmDeletion) {
      return res.status(400).json({
        success: false,
        error: 'Deletion confirmation is required',
        code: 'MISSING_CONFIRMATION'
      });
    }
    
    // Verify user session
    // User session verify karta hai
    const sessionValidation = await userService.validateUserSession(userId.trim(), sessionToken);
    
    if (!sessionValidation.success) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
    }
    
    // Delete user through service
    // Service ke through user delete karta hai
    const deletionResult = await userService.deleteUser(userId.trim());
    
    if (!deletionResult.success) {
      if (deletionResult.error === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      logger.error('User deletion failed in service layer', {
        userId,
        error: deletionResult.error,
        ip: req.ip
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user account',
        code: 'DELETION_ERROR'
      });
    }
    
    logger.info('User account successfully deleted', {
      userId,
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
    
  } catch (error) {
    logger.error('Unexpected error during user deletion', {
      error: error.message,
      userId: req.params.userId,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/users/validate/:userId - Validate user session
 * Ye endpoint user session validate karta hai
 * Approach: Session verification -> Status response
 */
router.get('/validate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionToken } = req.query;
    
    // Validate inputs
    // Inputs validate karta hai
    if (!userId || !sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'User ID and session token are required',
        code: 'MISSING_PARAMETERS'
      });
    }
    
    // Validate session
    // Session validate karta hai
    const sessionValidation = await userService.validateUserSession(userId, sessionToken);
    
    res.json({
      success: true,
      data: {
        valid: sessionValidation.success,
        expiresAt: sessionValidation.expiresAt
      }
    });
    
  } catch (error) {
    logger.error('Error during session validation', {
      error: error.message,
      userId: req.params.userId,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

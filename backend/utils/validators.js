/**
 * Input Validators - Validation functions for user inputs
 * Ye file sabhi input validation functions provide karta hai
 * Approach: Individual validators + sanitization + error reporting
 */

const logger = require('../utils/logger');

/**
 * Validate user profile data
 * Ye function user profile data ko validate karta hai
 * Approach: Field by field validation + sanitization + error collection
 */
function validateUserProfile(profileData) {
  const errors = [];
  const sanitized = {};
  
  if (!profileData || typeof profileData !== 'object') {
    return {
      isValid: false,
      errors: ['Profile data must be an object'],
      sanitized: {}
    };
  }
  
  // Validate full name
  // Full name ko validate aur sanitize karta hai
  if (profileData.fullName !== undefined) {
    const nameValidation = validateFullName(profileData.fullName);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitized.fullName = nameValidation.sanitized;
    }
  }
  
  // Validate email
  // Email ko validate aur sanitize karta hai
  if (profileData.email !== undefined) {
    const emailValidation = validateEmail(profileData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    } else {
      sanitized.email = emailValidation.sanitized;
    }
  }
  
  // Validate phone
  // Phone number ko validate aur sanitize karta hai
  if (profileData.phone !== undefined) {
    const phoneValidation = validatePhone(profileData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    } else {
      sanitized.phone = phoneValidation.sanitized;
    }
  }
  
  // Validate LinkedIn URL
  // LinkedIn URL ko validate aur sanitize karta hai
  if (profileData.linkedin !== undefined) {
    const linkedinValidation = validateLinkedInURL(profileData.linkedin);
    if (!linkedinValidation.isValid) {
      errors.push(...linkedinValidation.errors);
    } else {
      sanitized.linkedin = linkedinValidation.sanitized;
    }
  }
  
  const isValid = errors.length === 0;
  
  if (!isValid) {
    logger.warn('Profile validation failed:', { errors, originalData: profileData });
  }
  
  return {
    isValid,
    errors,
    sanitized
  };
}

/**
 * Validate full name field
 * Ye function full name field ko validate karta hai
 * Approach: Type check + length limits + harmful content detection
 */
function validateFullName(name) {
  const errors = [];
  
  // Type validation
  // Type check karta hai
  if (typeof name !== 'string') {
    return {
      isValid: false,
      errors: ['Full name must be a string'],
      sanitized: ''
    };
  }
  
  // Sanitize: remove HTML tags and excessive whitespace
  // HTML tags aur extra spaces remove karta hai
  let sanitized = name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
  
  // Length validation
  // Length check karta hai
  if (sanitized.length === 0) {
    errors.push('Full name cannot be empty');
  } else if (sanitized.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  } else if (sanitized.length > 100) {
    errors.push('Full name cannot exceed 100 characters');
    sanitized = sanitized.substring(0, 100);
  }
  
  // Character validation
  // Valid characters check karta hai
  const validNamePattern = /^[a-zA-Z\s\.\-']+$/;
  if (sanitized && !validNamePattern.test(sanitized)) {
    errors.push('Full name contains invalid characters. Only letters, spaces, dots, hyphens, and apostrophes are allowed');
  }
  
  // Harmful content detection
  // Harmful content detect karta hai
  const harmfulPatterns = [
    /<script/i, /javascript:/i, /data:/i, /vbscript:/i, /onload/i, /onerror/i
  ];
  
  if (harmfulPatterns.some(pattern => pattern.test(name))) {
    errors.push('Full name contains potentially harmful content');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate email address
 * Ye function email address ko validate karta hai
 * Approach: Format validation + domain validation + normalization
 */
function validateEmail(email) {
  const errors = [];
  
  // Type validation
  // Type check karta hai
  if (typeof email !== 'string') {
    return {
      isValid: false,
      errors: ['Email must be a string'],
      sanitized: ''
    };
  }
  
  // Sanitize: trim and lowercase
  // Trim aur lowercase karta hai
  let sanitized = email.trim().toLowerCase();
  
  // Length validation
  // Email length check karta hai
  if (sanitized.length === 0) {
    errors.push('Email cannot be empty');
  } else if (sanitized.length > 254) {
    errors.push('Email cannot exceed 254 characters');
  }
  
  // Format validation using regex
  // Email format validate karta hai regex se
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (sanitized && !emailPattern.test(sanitized)) {
    errors.push('Invalid email format');
  }
  
  // Additional domain validation
  // Domain validation karta hai
  if (sanitized && sanitized.includes('@')) {
    const domain = sanitized.split('@')[1];
    if (domain) {
      // Check for valid domain format
      // Domain format check karta hai
      if (domain.length > 253) {
        errors.push('Email domain is too long');
      }
      
      // Check for suspicious domains
      // Suspicious domains check karta hai
      const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
      if (suspiciousDomains.includes(domain)) {
        errors.push('Temporary email addresses are not allowed');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate phone number
 * Ye function phone number ko validate karta hai
 * Approach: Format normalization + pattern validation + country code support
 */
function validatePhone(phone) {
  const errors = [];
  
  // Type validation
  // Type check karta hai
  if (typeof phone !== 'string') {
    return {
      isValid: false,
      errors: ['Phone number must be a string'],
      sanitized: ''
    };
  }
  
  // Sanitize: remove all non-digit characters except + and spaces
  // Sirf digits, +, aur spaces keep karta hai
  let sanitized = phone.replace(/[^\d\+\s\-\(\)]/g, '').trim();
  
  // Length validation
  // Phone length check karta hai
  if (sanitized.length === 0) {
    errors.push('Phone number cannot be empty');
  } else if (sanitized.length < 10) {
    errors.push('Phone number is too short (minimum 10 digits)');
  } else if (sanitized.length > 15) {
    errors.push('Phone number is too long (maximum 15 digits)');
  }
  
  // Format validation
  // Phone format validate karta hai
  const phonePattern = /^[\+]?[\d\s\-\(\)]{10,15}$/;
  if (sanitized && !phonePattern.test(sanitized)) {
    errors.push('Invalid phone number format');
  }
  
  // Check for obviously fake numbers
  // Fake numbers detect karta hai
  const digitOnly = sanitized.replace(/[^\d]/g, '');
  if (digitOnly && /^(\d)\1+$/.test(digitOnly)) {
    errors.push('Phone number appears to be invalid (all same digits)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate LinkedIn URL
 * Ye function LinkedIn URL ko validate karta hai
 * Approach: URL format + LinkedIn domain + profile path validation
 */
function validateLinkedInURL(url) {
  const errors = [];
  
  // Type validation
  // Type check karta hai
  if (typeof url !== 'string') {
    return {
      isValid: false,
      errors: ['LinkedIn URL must be a string'],
      sanitized: ''
    };
  }
  
  // Sanitize: trim
  // URL trim karta hai
  let sanitized = url.trim();
  
  // Length validation
  // URL length check karta hai
  if (sanitized.length === 0) {
    errors.push('LinkedIn URL cannot be empty');
  } else if (sanitized.length > 200) {
    errors.push('LinkedIn URL is too long');
  }
  
  // Add https:// if missing
  // Agar protocol missing hai to add karta hai
  if (sanitized && !sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = 'https://' + sanitized;
  }
  
  // URL format validation
  // URL format validate karta hai
  try {
    const urlObj = new URL(sanitized);
    
    // Check if it's LinkedIn domain
    // LinkedIn domain check karta hai
    if (!urlObj.hostname.includes('linkedin.com')) {
      errors.push('URL must be from linkedin.com domain');
    }
    
    // Check for profile path
    // Profile path check karta hai
    if (!urlObj.pathname.includes('/in/') && !urlObj.pathname.includes('/pub/')) {
      errors.push('LinkedIn URL must be a profile URL (containing /in/ or /pub/)');
    }
    
  } catch (error) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate user settings object
 * Ye function user settings ko validate karta hai
 * Approach: Settings structure validation + type checking + defaults
 */
function validateUserSettings(settings) {
  const errors = [];
  const sanitized = {};
  
  if (!settings || typeof settings !== 'object') {
    return {
      isValid: false,
      errors: ['Settings must be an object'],
      sanitized: {}
    };
  }
  
  // Validate backend URL
  // Backend URL validate karta hai
  if (settings.backendUrl !== undefined) {
    if (typeof settings.backendUrl !== 'string') {
      errors.push('Backend URL must be a string');
    } else {
      try {
        new URL(settings.backendUrl);
        sanitized.backendUrl = settings.backendUrl.trim();
      } catch (error) {
        errors.push('Invalid backend URL format');
      }
    }
  }
  
  // Validate boolean settings
  // Boolean settings validate karta hai
  const booleanSettings = ['autoFill', 'smartSuggestions', 'notifications'];
  booleanSettings.forEach(setting => {
    if (settings[setting] !== undefined) {
      if (typeof settings[setting] !== 'boolean') {
        errors.push(`${setting} must be a boolean`);
      } else {
        sanitized[setting] = settings[setting];
      }
    }
  });
  
  // Validate theme setting
  // Theme setting validate karta hai
  if (settings.theme !== undefined) {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(settings.theme)) {
      errors.push('Theme must be one of: light, dark, auto');
    } else {
      sanitized.theme = settings.theme;
    }
  }
  
  // Validate language setting
  // Language setting validate karta hai
  if (settings.language !== undefined) {
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi'];
    if (!validLanguages.includes(settings.language)) {
      errors.push('Language must be a valid language code');
    } else {
      sanitized.language = settings.language;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Sanitize general text input
 * Ye function general text input ko sanitize karta hai
 * Approach: HTML removal + XSS prevention + length limits
 */
function sanitizeTextInput(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .trim()
    .substring(0, maxLength);
}

module.exports = {
  validateUserProfile,
  validateFullName,
  validateEmail,
  validatePhone,
  validateLinkedInURL,
  validateUserSettings,
  sanitizeTextInput
};

/**
 * Security Service - Handles all cryptographic operations
 * Ye service sabhi security-related operations handle karta hai
 * Approach: Secure random generation + encryption + token management
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Generate cryptographically secure user ID
 * Ye function secure user ID generate karta hai
 * Approach: Crypto.randomBytes + timestamp + base64url encoding
 */
function generateSecureUserId() {
  try {
    // Generate 24 bytes (192 bits) of secure random data
    // Ye highly secure random data generate karta hai
    const randomBytes = crypto.randomBytes(24);
    
    // Convert to base64url (URL-safe base64)
    // Ye URL-safe format me convert karta hai
    const randomString = randomBytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // Add timestamp component for uniqueness
    // Extra uniqueness ke liye timestamp add karta hai
    const timestamp = Date.now().toString(36);
    
    const userId = `usr_${timestamp}_${randomString}`;
    
    logger.debug(`Generated secure user ID: ${userId.substring(0, 20)}...`);
    return userId;
    
  } catch (error) {
    logger.error('Failed to generate secure user ID:', error);
    throw new Error('User ID generation failed');
  }
}

/**
 * Generate session token for user authentication
 * Ye function user ke liye session token generate karta hai
 * Approach: JWT-like structure with expiry + signature
 */
function generateSessionToken(userId) {
  try {
    // Create payload with user info and timing
    // Token me user info aur time details store karta hai
    const payload = {
      userId: userId,
      issued: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      random: crypto.randomBytes(16).toString('hex')
    };
    
    // Create token signature for verification
    // Token ki authenticity verify karne ke liye signature banata hai
    const signature = createTokenSignature(payload);
    
    // Combine payload and signature
    // Payload aur signature ko combine karke final token banata hai
    const token = {
      payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signature: signature
    };
    
    const finalToken = `${token.payload}.${token.signature}`;
    
    logger.debug(`Generated session token for user: ${userId}`);
    return finalToken;
    
  } catch (error) {
    logger.error('Failed to generate session token:', error);
    throw new Error('Session token generation failed');
  }
}

/**
 * Verify session token validity
 * Ye function session token ki validity check karta hai
 * Approach: Signature verification + expiry check + format validation
 */
function verifySessionToken(token, expectedUserId) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'Invalid token format' };
    }
    
    // Split token into parts
    // Token ko parts me divide karta hai
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Invalid token structure' };
    }
    
    const [payloadPart, signaturePart] = parts;
    
    // Decode and parse payload
    // Payload ko decode aur parse karta hai
    let payload;
    try {
      const payloadJson = Buffer.from(payloadPart, 'base64').toString('utf8');
      payload = JSON.parse(payloadJson);
    } catch (error) {
      return { valid: false, reason: 'Invalid payload encoding' };
    }
    
    // Verify signature
    // Token signature verify karta hai
    const expectedSignature = createTokenSignature(payload);
    if (signaturePart !== expectedSignature) {
      return { valid: false, reason: 'Invalid token signature' };
    }
    
    // Check expiry
    // Token ki expiry check karta hai
    if (Date.now() > payload.expires) {
      return { valid: false, reason: 'Token expired' };
    }
    
    // Check user ID match
    // Expected user ID se match karta hai
    if (expectedUserId && payload.userId !== expectedUserId) {
      return { valid: false, reason: 'User ID mismatch' };
    }
    
    logger.debug(`Token verified successfully for user: ${payload.userId}`);
    return { 
      valid: true, 
      payload: payload,
      remainingTime: payload.expires - Date.now()
    };
    
  } catch (error) {
    logger.error('Token verification failed:', error);
    return { valid: false, reason: 'Verification error' };
  }
}

/**
 * Create HMAC signature for token
 * Ye function token ke liye HMAC signature create karta hai
 * Approach: HMAC-SHA256 with secret key
 */
function createTokenSignature(payload) {
  // Use environment secret or default (change in production!)
  // Production me proper secret key use karna hai
  const secret = process.env.JWT_SECRET || 'hireassist-default-secret-change-in-production';
  
  // Create HMAC signature
  // HMAC signature generate karta hai
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('base64url');
}

/**
 * Generate request fingerprint for additional security
 * Ye function request ki fingerprint generate karta hai
 * Approach: User agent + IP hash for device identification
 */
function generateRequestFingerprint(req) {
  try {
    const components = [
      req.headers['user-agent'] || 'unknown',
      req.ip || 'unknown',
      req.headers['accept-language'] || 'unknown'
    ];
    
    // Create hash of components
    // Components ka hash banata hai
    const hash = crypto.createHash('sha256');
    hash.update(components.join('|'));
    const fingerprint = hash.digest('base64url').substring(0, 16);
    
    logger.debug(`Generated request fingerprint: ${fingerprint}`);
    return fingerprint;
    
  } catch (error) {
    logger.error('Failed to generate request fingerprint:', error);
    return 'unknown';
  }
}

/**
 * Encrypt sensitive data before storage
 * Ye function sensitive data ko encrypt karta hai storage se pehle
 * Approach: AES-256-GCM encryption with random IV
 */
function encryptSensitiveData(data) {
  try {
    if (!data || typeof data !== 'string') {
      return data; // Return as-is if not string
    }
    
    // Generate random IV for each encryption
    // Har encryption ke liye random IV generate karta hai
    const iv = crypto.randomBytes(16);
    const key = getEncryptionKey();
    
    // Create cipher and encrypt
    // Cipher create karke data encrypt karta hai
    const cipher = crypto.createCipher('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return encrypted object with IV and auth tag
    // IV aur auth tag ke sath encrypted object return karta hai
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm'
    };
    
  } catch (error) {
    logger.error('Data encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data from storage
 * Ye function storage se data ko decrypt karta hai
 * Approach: AES-256-GCM decryption with IV and auth tag verification
 */
function decryptSensitiveData(encryptedObj) {
  try {
    if (!encryptedObj || typeof encryptedObj !== 'object' || !encryptedObj.encrypted) {
      return encryptedObj; // Return as-is if not encrypted object
    }
    
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const authTag = Buffer.from(encryptedObj.authTag, 'hex');
    
    // Create decipher and decrypt
    // Decipher create karke data decrypt karta hai
    const decipher = crypto.createDecipher(encryptedObj.algorithm || 'aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedObj.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    logger.error('Data decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Get encryption key from environment or generate default
 * Ye function encryption key provide karta hai
 * Approach: Environment variable or derived key from secret
 */
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    return crypto.scryptSync(envKey, 'hireassist-salt', 32);
  }
  
  // Fallback key (change in production!)
  // Production me proper key use karna hai
  const defaultSecret = process.env.JWT_SECRET || 'hireassist-default-secret';
  return crypto.scryptSync(defaultSecret, 'hireassist-encryption-salt', 32);
}

module.exports = {
  generateSecureUserId,
  generateSessionToken,
  verifySessionToken,
  generateRequestFingerprint,
  encryptSensitiveData,
  decryptSensitiveData
};

# Step 2: Secure User ID Generation & Registration

## Overview
Step 2 implements a complete user management system with cryptographically secure user identification, profile management, and session handling. This system follows Method 2 data persistence with simple user identification (no traditional login required).

## Architecture Components

### 1. Security Service
- **Secure ID Generation**: Cryptographically secure user IDs with entropy-based randomization
- **Session Token Management**: HMAC-based tokens with expiration handling
- **Data Encryption**: AES-256-GCM encryption for sensitive profile information
- **Validation System**: Comprehensive input validation and sanitization

### 2. User Management Service
- **User Registration**: Complete user lifecycle with encrypted profile storage
- **Profile Management**: CRUD operations with security integration
- **Session Handling**: Token-based session management with validation
- **Data Protection**: Automatic encryption/decryption of sensitive fields

### 3. Input Validation System
- **Profile Validation**: Name, email, phone, LinkedIn URL validation
- **Settings Validation**: User preferences and configuration validation
- **Security Filters**: XSS protection and harmful content detection
- **Sanitization**: Input cleaning and normalization

### 4. Rate Limiting
- **Registration Protection**: Limited registration attempts per IP
- **Profile Update Control**: Throttled profile modification requests
- **Authentication Limiting**: Session validation rate limiting

## API Endpoints

### User Management
```
POST /api/users/register           - Register new user
GET  /api/users/profile/:userId    - Get user profile
PUT  /api/users/profile/:userId    - Update user profile
DELETE /api/users/:userId          - Delete user account
GET  /api/users/validate/:userId   - Validate user session
```

## User Registration Process

### Registration Flow
1. **Input Validation**: Profile and settings validation
2. **ID Generation**: Secure user ID creation
3. **Data Encryption**: Sensitive profile data encryption
4. **Storage**: User data persistence in secure storage
5. **Session Creation**: Session token generation and storage
6. **Response**: User ID and session token return

### Registration Request
```json
{
  "profile": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "settings": {
    "autoFill": true,
    "smartSuggestions": true,
    "notifications": false,
    "theme": "dark",
    "language": "en"
  }
}
```

### Registration Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "usr_secure_random_id",
    "sessionToken": "encrypted_session_token"
  }
}
```

## Security Features

### User ID Generation
- **Format**: `usr_` prefix + timestamp + random components
- **Entropy**: High-entropy randomization for uniqueness
- **Validation**: Built-in format and security validation
- **Collision Prevention**: Duplicate detection and regeneration

### Data Encryption
- **Algorithm**: AES-256-GCM for authenticated encryption
- **Key Management**: Secure key generation and storage
- **Selective Encryption**: Only sensitive fields encrypted
- **Decryption**: Automatic decryption during data retrieval

### Session Management
- **Token Format**: Base64-encoded HMAC tokens
- **Expiration**: 24-hour session lifetime
- **Validation**: Cryptographic signature verification
- **Cleanup**: Automatic expired session removal

## Input Validation

### Profile Fields
- **Full Name**: Length limits, character validation, harmful content detection
- **Email**: Format validation, domain verification, temporary email blocking
- **Phone**: International format support, length validation, fake number detection
- **LinkedIn**: URL format validation, domain verification, profile path checking

### Settings Validation
- **Backend URL**: Valid URL format verification
- **Boolean Settings**: Type checking for toggle options
- **Theme**: Enumerated value validation (light/dark/auto)
- **Language**: Supported language code validation

## Rate Limiting Configuration

### Registration Limits
- **Rate**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent automated registration abuse
- **Response**: 429 status with retry information

### Profile Update Limits
- **Rate**: 10 requests per 15 minutes per IP
- **Purpose**: Prevent rapid profile modification attacks
- **Scope**: Per-user and per-IP limiting

### Authentication Limits
- **Rate**: 20 requests per 15 minutes per IP
- **Purpose**: Prevent session validation abuse
- **Bypass**: Valid sessions not rate limited

## Testing

### Manual Registration Test
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "fullName": "Test User",
      "email": "test@example.com"
    }
  }'
```

### Profile Retrieval Test
```bash
curl http://localhost:3000/api/users/profile/USER_ID
```

### Session Validation Test
```bash
curl "http://localhost:3000/api/users/validate/USER_ID?sessionToken=TOKEN"
```

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Profile validation failed",
  "details": ["Full name is required", "Invalid email format"],
  "code": "VALIDATION_ERROR"
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": "Invalid or expired session",
  "code": "INVALID_SESSION"
}
```

### Rate Limiting Errors
```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Data Storage Structure

### User Data Format
```javascript
{
  userId: "usr_unique_id",
  profile: {
    // Encrypted sensitive fields
    fullName: { encrypted: true, data: "..." },
    email: { encrypted: true, data: "..." },
    // Non-sensitive fields stored as-is
  },
  settings: {
    autoFill: true,
    theme: "dark",
    // ... other preferences
  },
  metadata: {
    createdAt: "2025-08-05T09:00:00.000Z",
    lastUpdated: "2025-08-05T09:00:00.000Z",
    lastActive: "2025-08-05T09:00:00.000Z"
  }
}
```

### Session Data Format
```javascript
{
  sessionId: "session_unique_id",
  userId: "usr_unique_id",
  token: "encrypted_token",
  expiresAt: "2025-08-06T09:00:00.000Z",
  createdAt: "2025-08-05T09:00:00.000Z",
  lastUsed: "2025-08-05T09:00:00.000Z"
}
```

## Performance Considerations

### Memory Usage
- Efficient encrypted data storage
- Session cleanup for expired tokens
- Optimized validation algorithms

### Security vs Performance
- Balanced encryption for sensitive data only
- Fast session validation with caching
- Minimal computational overhead

## Troubleshooting

### Common Issues

1. **User Not Found Errors**
   - Verify user ID format and encoding
   - Check storage system health
   - Validate registration completion

2. **Session Validation Failures**
   - Check token expiration
   - Verify token format and encoding
   - Validate session storage

3. **Rate Limiting Issues**
   - Monitor IP-based limits
   - Check rate limiter configuration
   - Review request patterns

## Integration Points

### Extension Integration
- User ID storage in extension storage
- Session token management
- Profile data synchronization

### Security Integration
- Encryption key management
- Session lifecycle handling
- Rate limiting coordination

## Next Steps
Step 2 provides user management foundation for:
- Advanced session management (Step 3)
- Resume data handling (Step 4)
- AI-powered job assistance (Steps 5-8)

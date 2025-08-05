# HireAssist Backend API Documentation

## Overview
The HireAssist backend provides secure REST APIs for user management, profile handling, and health monitoring. The system uses Method 2 data persistence with cryptographically secure user identification.

## Base URL
```
http://localhost:3000
```

## Authentication
The system uses session token-based authentication. Tokens are provided upon user registration and must be included in requests that modify user data.

## Rate Limiting
API endpoints are protected with rate limiting:
- Registration: 5 requests per 15 minutes per IP
- Profile updates: 10 requests per 15 minutes per IP
- Authentication: 20 requests per 15 minutes per IP

## Health Endpoints

### Get Basic Health Status
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-08-05T09:00:00.000Z",
  "requestId": "req_unique_id"
}
```

### Get Detailed Health Information
```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-08-05T09:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "requestId": "req_unique_id"
}
```

### Get Storage Statistics
```http
GET /health/storage
```

**Response:**
```json
{
  "status": "healthy",
  "type": "in-memory",
  "stats": {
    "users": 5,
    "sessions": 3,
    "resumes": 2,
    "settings": 5,
    "totalEntries": 15
  },
  "memoryUsage": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  }
}
```

## User Management Endpoints

### Register New User
```http
POST /api/users/register
```

**Request Body:**
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

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "usr_unique_secure_id",
    "sessionToken": "encrypted_session_token"
  }
}
```

### Get User Profile
```http
GET /api/users/profile/{userId}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
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
    },
    "lastUpdated": "2025-08-05T09:00:00.000Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile/{userId}
```

**Request Body:**
```json
{
  "sessionToken": "user_session_token",
  "profile": {
    "fullName": "John Smith",
    "email": "johnsmith@example.com"
  },
  "settings": {
    "theme": "light",
    "notifications": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "fullName": "John Smith",
      "email": "johnsmith@example.com",
      "phone": "+1-555-123-4567",
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "settings": {
      "autoFill": true,
      "smartSuggestions": true,
      "notifications": true,
      "theme": "light",
      "language": "en"
    },
    "lastUpdated": "2025-08-05T09:30:00.000Z"
  }
}
```

### Delete User Account
```http
DELETE /api/users/{userId}
```

**Request Body:**
```json
{
  "sessionToken": "user_session_token",
  "confirmDeletion": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

### Validate User Session
```http
GET /api/users/validate/{userId}?sessionToken={token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expiresAt": "2025-08-06T09:00:00.000Z"
  }
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Profile validation failed",
  "details": [
    "Full name is required",
    "Invalid email format"
  ],
  "code": "VALIDATION_ERROR"
}
```

### Authentication Error (401 Unauthorized)
```json
{
  "success": false,
  "error": "Invalid or expired session",
  "code": "INVALID_SESSION"
}
```

### Not Found Error (404 Not Found)
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

### Rate Limit Error (429 Too Many Requests)
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded",
  "retryAfter": 900
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Data Validation Rules

### Profile Fields
- **fullName**: 2-100 characters, letters/spaces/dots/hyphens/apostrophes only
- **email**: Valid email format, max 254 characters, no temporary emails
- **phone**: 10-15 digits, international format supported
- **linkedin**: Valid LinkedIn profile URL

### Settings Fields
- **autoFill**: Boolean value
- **smartSuggestions**: Boolean value
- **notifications**: Boolean value
- **theme**: One of: "light", "dark", "auto"
- **language**: Valid language code (en, es, fr, de, it, pt, hi)

## Security Features

### Data Protection
- Sensitive profile data is encrypted using AES-256-GCM
- Session tokens use HMAC-based signatures
- Input validation prevents XSS and injection attacks
- Rate limiting prevents abuse and DoS attacks

### Session Management
- Sessions expire after 24 hours
- Session tokens are cryptographically secure
- Automatic cleanup of expired sessions

## Usage Examples

### cURL Examples

**Register a new user:**
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

**Get user profile:**
```bash
curl http://localhost:3000/api/users/profile/usr_example_id
```

**Validate session:**
```bash
curl "http://localhost:3000/api/users/validate/usr_example_id?sessionToken=example_token"
```

### JavaScript/Fetch Examples

**Register user:**
```javascript
const response = await fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profile: {
      fullName: 'Test User',
      email: 'test@example.com'
    }
  })
});

const data = await response.json();
console.log(data);
```

**Update profile:**
```javascript
const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionToken: 'user_session_token',
    profile: {
      fullName: 'Updated Name'
    }
  })
});

const data = await response.json();
console.log(data);
```

## Response Headers

All responses include:
- `Content-Type: application/json`
- `X-Request-ID: {unique_request_id}`
- Security headers via Helmet.js

## Best Practices

### Client Integration
1. Store user ID and session token securely
2. Handle rate limiting with exponential backoff
3. Validate session tokens before making requests
4. Implement proper error handling for all scenarios

### Security Considerations
1. Always use HTTPS in production
2. Validate all input data on client side
3. Handle session expiration gracefully
4. Don't expose sensitive tokens in logs or URLs

# Step 1: Basic Secure Server Setup

## Overview
Step 1 establishes the foundational secure backend server for HireAssist with essential security middleware, in-memory storage, and health monitoring endpoints.

## Architecture Components

### 1. Security Layer
- **Helmet.js**: HTTP security headers protection
- **CORS**: Cross-origin resource sharing for browser extensions
- **Rate Limiting**: Global request throttling (100 requests per 15 minutes)
- **Request Tracking**: UUID-based request identification
- **Body Parsing**: JSON payload processing with size limits

### 2. Storage System
- **In-Memory Storage**: Development-ready data persistence using Maps
- **Statistics Tracking**: Real-time monitoring of storage usage
- **Data Categories**: Users, sessions, resumes, settings
- **Memory Management**: Efficient storage with cleanup capabilities

### 3. Health Monitoring
- **Basic Health Check**: Server status and uptime monitoring
- **Storage Health**: Memory usage and data statistics
- **Performance Metrics**: Response time and system health indicators

## API Endpoints

### Health Endpoints
```
GET /health          - Basic server health status
GET /health/detailed - Comprehensive health information
GET /health/storage  - Storage system statistics
```

## Installation & Setup

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Create `.env` file in backend directory:
```env
PORT=3000
NODE_ENV=development
```

### Starting the Server
```bash
npm start
# or
node index.js
```

### Server Startup Sequence
1. **Security Configuration**: Helmet, CORS, rate limiting
2. **Storage Initialization**: In-memory Maps setup
3. **Routes Registration**: Health endpoints mounting
4. **Error Handling**: Global error and 404 handlers
5. **Server Start**: Express server listening on configured port

## Security Features

### Request Protection
- HTTP security headers via Helmet
- CORS configured for browser extension origins
- Global rate limiting to prevent abuse
- Request size limits to prevent DoS attacks

### Error Handling
- Sanitized error responses in production
- Detailed error logging for debugging
- Request ID tracking for error correlation
- Graceful server shutdown handling

## Testing

### Health Check Test
```bash
curl http://localhost:3000/health
```

Expected Response:
```json
{
  "status": "healthy",
  "uptime": 45.123,
  "timestamp": "2025-08-05T09:00:00.000Z",
  "requestId": "req_unique_id"
}
```

### Storage Health Test
```bash
curl http://localhost:3000/health/storage
```

Expected Response:
```json
{
  "status": "healthy",
  "type": "in-memory",
  "stats": {
    "users": 0,
    "sessions": 0,
    "resumes": 0,
    "settings": 0,
    "totalEntries": 0
  }
}
```

## Logging System

### Log Levels
- **INFO**: General operational information
- **DEBUG**: Detailed debugging information
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **SUCCESS**: Successful operations

### Log Format
```
[2025-08-05 09:00:00] LEVEL: Message content
```

## Performance Considerations

### Memory Usage
- Efficient Map-based storage for development
- Automatic cleanup of expired sessions
- Memory usage monitoring and reporting

### Response Times
- Optimized middleware chain
- Minimal request processing overhead
- Built-in performance monitoring

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing Node.js processes

2. **Memory Issues**
   - Monitor storage statistics
   - Restart server to clear memory

3. **CORS Errors**
   - Verify extension origin configuration
   - Check browser console for detailed errors

## Next Steps
Step 1 provides the secure foundation for:
- User registration and management (Step 2)
- Session handling and authentication (Step 3)
- Resume processing capabilities (Step 4)
- AI integration for job assistance (Steps 5-8)

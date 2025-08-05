# HireAssist Backend Installation Guide

## Quick Start

### Prerequisites
- **Node.js**: Version 16.x or higher
- **npm**: Comes with Node.js installation
- **Git**: For cloning the repository

### Installation Steps

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` file in the backend directory:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the Server**
   ```bash
   node index.js
   ```

5. **Verify Installation**
   Open browser and visit: `http://localhost:3000/health`

## Project Structure

```
backend/
├── index.js                 # Main server entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment configuration
├── config/                 # Configuration modules
│   ├── security.js         # Security middleware setup
│   └── database.js         # Storage configuration
├── utils/                  # Utility functions
│   ├── logger.js           # Logging system
│   └── validators.js       # Input validation
├── services/               # Business logic services
│   ├── securityService.js  # Cryptographic operations
│   └── userService.js      # User management
├── middleware/             # Express middleware
│   └── rateLimiting.js     # Rate limiting controls
└── routes/                 # API route handlers
    ├── health.js           # Health check endpoints
    └── users.js            # User management endpoints
```

## Available Scripts

```bash
# Start the server
node index.js

# Start with development logging
NODE_ENV=development node index.js

# Stop all Node.js processes (Windows)
taskkill /F /IM node.exe

# Stop all Node.js processes (Linux/Mac)
pkill node
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `NODE_ENV` | `development` | Environment mode |

## Health Checks

### Basic Health Check
```bash
curl http://localhost:3000/health
```

### Detailed Health Information
```bash
curl http://localhost:3000/health/detailed
```

### Storage System Status
```bash
curl http://localhost:3000/health/storage
```

## API Endpoints Summary

### Health Monitoring
- `GET /health` - Basic server status
- `GET /health/detailed` - Comprehensive health info
- `GET /health/storage` - Storage system statistics

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user account
- `GET /api/users/validate/:userId` - Validate user session

## Troubleshooting

### Server Won't Start
1. **Port Already in Use**
   ```bash
   # Change port in .env file
   PORT=3001
   ```

2. **Missing Dependencies**
   ```bash
   npm install
   ```

3. **Permission Issues**
   ```bash
   # Run as administrator (Windows) or with sudo (Linux/Mac)
   ```

### API Errors
1. **404 Not Found**
   - Verify endpoint URL
   - Check server is running
   - Review available endpoints

2. **Rate Limiting (429)**
   - Wait for rate limit reset
   - Review request frequency
   - Check IP-based limits

3. **Validation Errors (400)**
   - Verify request payload format
   - Check required fields
   - Review validation rules

### Memory Issues
1. **High Memory Usage**
   - Restart server to clear memory
   - Monitor storage statistics
   - Check for memory leaks

2. **Performance Degradation**
   - Review storage statistics
   - Clear expired sessions
   - Monitor system resources

## Development Tips

### Logging
- All requests are logged with unique IDs
- Use different log levels for debugging
- Check console output for detailed information

### Testing
- Use curl or Postman for API testing
- Monitor health endpoints regularly
- Test rate limiting with multiple requests

### Security
- Never expose sensitive configuration
- Use HTTPS in production
- Monitor rate limiting effectiveness

## Production Deployment

### Environment Setup
```env
PORT=3000
NODE_ENV=production
```

### Security Considerations
- Use reverse proxy (nginx)
- Enable HTTPS/SSL
- Configure proper CORS origins
- Set up monitoring and logging
- Implement proper backup strategies

### Process Management
Consider using PM2 for production:
```bash
npm install -g pm2
pm2 start index.js --name "hireassist-backend"
pm2 startup
pm2 save
```

## Support

### Common Resources
- Check health endpoints for system status
- Review server logs for error details
- Monitor memory usage through storage endpoints
- Use request IDs for error tracking

### Development Mode
- Detailed error messages enabled
- Comprehensive logging output
- CORS relaxed for development
- Rate limiting may be reduced

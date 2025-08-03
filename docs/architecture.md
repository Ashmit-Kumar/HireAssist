# HireAssist Architecture

## System Overview

HireAssist is an AI-powered job application assistant consisting of:

1. **Browser Extension** - Frontend interface for users
2. **Backend API** - Node.js server handling AI integration
3. **External APIs** - LLM services (OpenAI, Gemini, Hugging Face)

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Backend API   │    │   LLM Services  │
│   Extension     │    │   (Node.js)     │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Content Scripts│    │ • Express Server│    │ • OpenAI GPT    │
│ • Popup UI      │◄──►│ • Route Handlers│◄──►│ • Google Gemini │
│ • Storage Utils │    │ • LLM Service   │    │ • Hugging Face  │
│ • Auto-fill     │    │ • File Parser   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Details

### Browser Extension
- **Manifest V3** Chrome extension
- **Content Scripts**: Inject functionality into job sites
- **Popup Interface**: User configuration and quick actions
- **Storage**: Chrome storage APIs for user data

### Backend API
- **Express.js** REST API server
- **Multer** for file upload handling
- **LLM Integration** for AI-powered features
- **PDF Parsing** for resume processing

### Data Flow

1. User uploads resume → Backend processes and stores
2. Extension detects job posting → Extracts job data
3. User triggers action → Extension calls backend API
4. Backend queries LLM → Returns AI-generated content
5. Extension displays/applies results → User benefits

## Security Considerations

- API keys stored securely in backend environment
- User data encrypted in Chrome storage
- CORS properly configured for extension origin
- Input validation on all API endpoints

## Scalability

- Stateless backend design
- Caching for frequently accessed data
- Rate limiting to prevent abuse
- Modular LLM service for easy provider switching

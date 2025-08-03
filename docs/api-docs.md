# HireAssist API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required. Future versions may implement API key or JWT-based authentication.

## Endpoints

### Health Check
```http
GET /health
```
Returns the health status of the API server.

**Response:**
```json
{
  "status": "OK",
  "message": "HireAssist Backend is running"
}
```

---

## User Routes

### Get User Profile
```http
GET /api/user/profile
```

### Create User Profile
```http
POST /api/user/profile
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

### Update User Profile
```http
PUT /api/user/profile
```

---

## Resume Routes

### Upload Resume
```http
POST /api/resume/upload
```

**Request:** Multipart form data with `resume` file field

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "filename": "1234567890-resume.pdf"
}
```

### Get Resume Data
```http
GET /api/resume/:id
```

### Tag Resume Sections
```http
POST /api/resume/:id/tag
```

---

## Cover Letter Routes

### Generate Cover Letter
```http
POST /api/cover-letter/generate
```

**Request Body:**
```json
{
  "jobDescription": "Software Engineer position...",
  "resumeData": {
    "experience": [...],
    "skills": [...],
    "education": [...]
  },
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express..."
}
```

### Get Cover Letter Templates
```http
GET /api/cover-letter/templates
```

---

## Optimization Routes

### Optimize Resume
```http
POST /api/optimize/resume
```

**Request Body:**
```json
{
  "resumeData": {
    "experience": [...],
    "skills": [...],
    "education": [...]
  },
  "jobDescription": "We are looking for a Software Engineer..."
}
```

**Response:**
```json
{
  "optimizedResume": {
    "experience": [...],
    "skills": [...],
    "education": [...],
    "suggestions": [...]
  }
}
```

### Get Optimization Suggestions
```http
POST /api/optimize/suggestions
```

**Request Body:**
```json
{
  "resumeData": {...},
  "jobDescription": "..."
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "type": "keyword",
      "section": "skills",
      "recommendation": "Add 'React.js' to your skills section",
      "priority": "high"
    }
  ]
}
```

---

## Answer Routes

### Generate Answer
```http
POST /api/answer/generate
```

**Request Body:**
```json
{
  "question": "Why are you interested in this role?",
  "context": "Software Engineer position at Tech Company",
  "resumeData": {...},
  "jobDescription": "..."
}
```

**Response:**
```json
{
  "answer": "I am particularly drawn to this Software Engineer role because..."
}
```

### Get Answer Suggestions
```http
POST /api/answer/suggestions
```

**Request Body:**
```json
{
  "question": "Tell me about a challenging project you've worked on",
  "context": "Technical interview question"
}
```

**Response:**
```json
{
  "suggestions": [
    "Structure your answer using the STAR method",
    "Focus on technical challenges and solutions",
    "Quantify the impact of your work"
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Specific validation error message"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## CORS Policy

The API accepts requests from:
- `chrome-extension://*` (for browser extension)
- `http://localhost:*` (for development)
- Configured production domains

---

## File Upload Limits

- **Max File Size:** 10MB
- **Supported Formats:** PDF, DOC, DOCX, TXT
- **Upload Directory:** `./uploads/`

---

## Environment Variables

See `.env.example` for required environment variables:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `HUGGINGFACE_API_KEY`
- `PORT`
- `NODE_ENV`

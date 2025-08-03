# HireAssist Backend

Backend API server for HireAssist - an AI-powered job application assistant that helps with resume optimization, cover letter generation, and application question answering.

## Features

- **Resume Processing**: Upload and parse PDF/text resumes
- **Cover Letter Generation**: AI-powered cover letter creation
- **Resume Optimization**: Tailor resumes for specific job descriptions
- **Question Answering**: Generate answers for application questions
- **Multi-LLM Support**: Integration with OpenAI, Gemini, and Hugging Face

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your API keys
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `POST /profile` - Create user profile
- `PUT /profile` - Update user profile

### Resume Routes (`/api/resume`)
- `POST /upload` - Upload resume file
- `GET /:id` - Get resume data
- `POST /:id/tag` - Tag resume sections

### Cover Letter Routes (`/api/cover-letter`)
- `POST /generate` - Generate cover letter
- `GET /templates` - Get cover letter templates

### Optimization Routes (`/api/optimize`)
- `POST /resume` - Optimize resume for job
- `POST /suggestions` - Get optimization suggestions

### Answer Routes (`/api/answer`)
- `POST /generate` - Generate answer for question
- `POST /suggestions` - Get answer suggestions

## Environment Variables

See `.env.example` for all required environment variables.

## Development

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## License

MIT

# HireAssist 

An AI-powered browser extension that automates and enhances job applications with intelligent resume optimization, cover letter generation, and application form auto-filling.

## 🚀 Features 

- **Smart Auto-Fill**: Automatically detect and fill job application forms
- **Resume Optimization**: AI-powered resume tailoring for specific job postings
- **Cover Letter Generation**: Create personalized cover letters instantly
- **Question Answering**: Get AI-generated answers for application questions
- **Job Description Parsing**: Extract key requirements from job postings
- **Multi-Platform Support**: Works with LinkedIn, Indeed, Glassdoor, and more

## 🏗️ Architecture

HireAssist consists of two main components:

1. **Backend API** (Node.js) - Handles AI integration and data processing
2. **Browser Extension** - Provides user interface and job site integration

## 📦 Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder
4. The HireAssist extension should now appear in your toolbar

## 🔧 Configuration

### API Keys Required

- **OpenAI API Key**: For GPT-powered text generation
- **Google Gemini API Key**: Alternative LLM provider
- **Hugging Face API Key**: For open-source models

### Extension Settings

1. Click the HireAssist icon in your browser toolbar
2. Go to the "Settings" tab
3. Configure your backend URL (default: `http://localhost:3000`)
4. Enable desired features (auto-fill, smart suggestions)

## 📱 Usage

### Setting Up Your Profile

1. Click the HireAssist extension icon
2. Go to the "Profile" tab
3. Fill in your personal information
4. Upload your resume (PDF, DOC, or TXT format)

### Using the Extension

1. **Job Description Parsing**: Visit any job posting page and click "Parse Job Description"
2. **Auto-Fill**: On application forms, click the "Auto-fill with HireAssist" button
3. **Answer Generation**: Select any question text and use the AI answer helper
4. **Quick Actions**: Use the popup for resume optimization and cover letter generation

## 🌐 Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- Workday
- Greenhouse
- Lever
- Generic job sites (auto-detection)

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev          # Start development server
npm test            # Run tests
npm run lint        # Run ESLint
```

### Extension Development

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the reload button for HireAssist
4. Test your changes

### API Documentation

See `docs/api-docs.md` for detailed API documentation.

## 📋 Project Structure

```
HireAssist/
├── backend/                 # Node.js API server
│   ├── routes/             # API route handlers
│   ├── services/           # LLM integration services
│   ├── utils/              # Utility functions
│   └── uploads/            # Uploaded resume storage
├── extension/              # Browser extension
│   ├── content/            # Content scripts
│   ├── styles/             # CSS styling
│   ├── utils/              # Extension utilities
│   ├── manifest.json       # Extension manifest
│   ├── popup.html          # Extension popup UI
│   └── popup.js            # Popup logic
├── public/                 # Static assets
├── docs/                   # Documentation
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation in the `docs/` folder
2. Open an issue on GitHub
3. Review the browser console for error messages

## 🔮 Roadmap

- [ ] Add support for more job sites
- [ ] Implement user authentication
- [ ] Add analytics and usage tracking
- [ ] Create mobile app version
- [ ] Integrate with calendar for interview scheduling
- [ ] Add salary negotiation assistance

## ⚠️ Disclaimer

HireAssist is designed to assist with job applications. Always review and customize AI-generated content before submitting applications. Ensure all information is accurate and truthful.

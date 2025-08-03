ai-job-assistant/
├── backend/                            # Node.js Backend API Server
│   ├── index.js                        # Main Express app entry
│   ├── routes/                         # Route modules
│   │   ├── user.js                     # User profile data routes
│   │   ├── resume.js                   # Resume upload & tagging
│   │   ├── coverLetter.js              # Cover letter generation
│   │   ├── optimize.js                 # Resume optimization
│   │   └── answer.js                   # Question-answer generation
│   ├── services/                       # LLM and helper services
│   │   ├── llmService.js               # Wrapper for OpenAI/Gemini/HF
│   │   └── promptTemplates.js          # Templates for LLM prompts
│   ├── uploads/                        # Uploaded resumes
│   ├── .env.example                    # Sample environment vars
│   ├── utils/                          # Utility functions
│   │   └── fileParser.js               # PDF to text, etc.
│   ├── package.json
│   └── README.md
├── extension/                          # Browser Extension (Chrome/Firefox)
│   ├── manifest.json
│   ├── popup.html                      # Settings + personal data UI
│   ├── popup.js
│   ├── content/
│   │   ├── autofill.js                 # Auto-fill logic
│   │   ├── jd_parser.js                # Job description scraping
│   │   └── question_detector.js        # Detect selected question
│   ├── styles/
│   │   └── popup.css                   # Popup styling (can use Tailwind)
│   └── utils/
│       ├── storage.js                  # chrome.storage utilities
│       └── prompts.js                  # Prompt construction client-side
├── public/                             # Icons, logos, assets
│   └── icon128.png
├── docs/                               # Diagrams, usage guides
│   ├── architecture.png
│   └── api-docs.md
├── README.md                           # Project overview
└── LICENSE                             # MIT or your preferred license

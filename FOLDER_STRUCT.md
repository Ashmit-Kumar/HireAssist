ai-job-assistant/
├── backend/                    # Backend API server (Flask or Node.js)
│   ├── app.py                  # Main backend logic (proxy to LLMs)
│   ├── requirements.txt        # For Flask or FastAPI
│   ├── .env.example            # Template for API keys
│   └── utils/                  # Prompt templates, model routing
├── extension/                  # Chrome/Firefox extension
│   ├── manifest.json
│   ├── popup.html              # UI for settings, personal data
│   ├── popup.js
│   ├── content/
│   │   ├── autofill.js         # Form detection and filling
│   │   ├── jd_parser.js        # Job description scraping
│   │   └── question_detector.js# Detect selected field/question
│   ├── styles/                 # Minimal CSS or Tailwind
│   └── utils/                  # Chrome storage utils, prompts
├── public/                     # Assets like logos, icons
├── docs/                       # Architecture diagrams, usage docs
├── README.md
└── LICENSE

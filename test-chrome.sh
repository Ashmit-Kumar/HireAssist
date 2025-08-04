#!/bin/bash

# 🌐 Chrome Testing Script for HireAssist
# This script sets up the extension for Chrome testing

echo "🌐 Setting up HireAssist for Chrome testing..."

# Navigate to extension directory
cd extension

# Backup current manifest if it exists
if [ -f "manifest.json" ]; then
    echo "📋 Backing up current manifest..."
    cp manifest.json manifest-backup-$(date +%Y%m%d_%H%M%S).json
fi

# Use Chrome manifest (create if doesn't exist)
if [ ! -f "manifest-chrome.json" ]; then
    echo "🔧 Creating Chrome manifest..."
    cat > manifest-chrome.json << 'EOF'
{
  "manifest_version": 3,
  "name": "HireAssist",
  "version": "1.0.0",
  "description": "AI-powered job application assistant for resume optimization and auto-fill",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "tabs"
  ],
  "host_permissions": [
    "http://localhost:3000/*",
    "https://*.linkedin.com/*",
    "https://*.indeed.com/*",
    "https://*.glassdoor.com/*",
    "https://*.workday.com/*",
    "https://*.greenhouse.io/*",
    "https://*.lever.co/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "HireAssist",
    "default_icon": {
      "16": "public/icon16.png",
      "48": "public/icon48.png",
      "128": "public/icon128.png"
    }
  },
  "icons": {
    "16": "public/icon16.png",
    "48": "public/icon48.png",
    "128": "public/icon128.png"
  },
  "content_scripts": [
    {
      "matches": [
        "https://*.linkedin.com/*",
        "https://*.indeed.com/*",
        "https://*.glassdoor.com/*",
        "https://*.workday.com/*",
        "https://*.greenhouse.io/*",
        "https://*.lever.co/*"
      ],
      "js": [
        "content/jd_parser.js",
        "content/question_detector.js",
        "content/autofill.js"
      ],
      "css": ["styles/popup.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "web_accessible_resources": [
    {
      "resources": ["public/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
EOF
fi

echo "🔄 Switching to Chrome manifest..."
cp manifest-chrome.json manifest.json

# Create placeholder icons for Chrome (PNG format)
echo "🎨 Creating placeholder icons..."
mkdir -p public

# Create simple PNG icons using ImageMagick (if available) or base64 encoded PNGs
if command -v convert &> /dev/null; then
    echo "🎨 Using ImageMagick to create PNG icons..."
    convert -size 16x16 xc:"#1a73e8" -gravity center -pointsize 10 -fill white -annotate +0+0 "H" public/icon16.png
    convert -size 48x48 xc:"#1a73e8" -gravity center -pointsize 24 -fill white -annotate +0+0 "HA" public/icon48.png
    convert -size 128x128 xc:"#1a73e8" -gravity center -pointsize 48 -fill white -annotate +0+0 "HA" public/icon128.png
else
    echo "🎨 Creating basic colored squares as icons..."
    # Create minimal PNG files (base64 encoded 1x1 blue pixels, scaled up)
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEElEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon16.png
    echo "iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAAF0lEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon48.png
    echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGElEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon128.png
fi

echo ""
echo "✅ Chrome setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Open Chrome and go to: chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select folder: $(pwd)/"
echo ""
echo "🔗 Test URLs:"
echo "   - LinkedIn Jobs: https://www.linkedin.com/jobs/"
echo "   - Indeed: https://www.indeed.com/"
echo "   - Backend Health: http://localhost:3000/health"
echo ""

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Backend is not running. Start it with: cd backend && npm run dev"
fi

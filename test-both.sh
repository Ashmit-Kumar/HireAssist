#!/bin/bash

# 🌐🦊 Multi-Browser Testing Script for HireAssist
# This script sets up the extension for testing in both Chrome and Firefox simultaneously

echo "🌐🦊 Setting up HireAssist for multi-browser testing..."

# Navigate to extension directory
cd extension

# Backup current manifest if it exists
if [ -f "manifest.json" ]; then
    echo "📋 Backing up current manifest..."
    cp manifest.json manifest-backup-$(date +%Y%m%d_%H%M%S).json
fi

# Create separate directories for each browser
echo "📁 Creating browser-specific directories..."
mkdir -p ../extension-chrome
mkdir -p ../extension-firefox

# Copy all extension files to both directories
echo "📂 Copying extension files..."
cp -r * ../extension-chrome/
cp -r * ../extension-firefox/

# Set up Chrome version
echo "🌐 Setting up Chrome version..."
cd ../extension-chrome

# Ensure Chrome manifest exists and is correct
cat > manifest.json << 'EOF'
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

# Create PNG icons for Chrome
mkdir -p public
if command -v convert &> /dev/null; then
    convert -size 16x16 xc:"#1a73e8" -gravity center -pointsize 10 -fill white -annotate +0+0 "H" public/icon16.png
    convert -size 48x48 xc:"#1a73e8" -gravity center -pointsize 24 -fill white -annotate +0+0 "HA" public/icon48.png
    convert -size 128x128 xc:"#1a73e8" -gravity center -pointsize 48 -fill white -annotate +0+0 "HA" public/icon128.png
else
    # Create basic blue squares
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEElEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon16.png
    echo "iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAAF0lEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon48.png
    echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGElEQVR42mNkoBAwjhowasAQBgAKdAABAFXtNwAAAABJRU5ErkJggg==" | base64 -d > public/icon128.png
fi

# Set up Firefox version
echo "🦊 Setting up Firefox version..."
cd ../extension-firefox

# Use Firefox manifest
cp manifest-firefox.json manifest.json

# Create SVG icons for Firefox
mkdir -p public
cat > public/icon16.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
  <rect width="16" height="16" fill="#1a73e8" rx="2"/>
  <text x="8" y="12" text-anchor="middle" fill="white" font-size="10" font-family="Arial, sans-serif" font-weight="bold">H</text>
</svg>
EOF

cat > public/icon48.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
  <rect width="48" height="48" fill="#1a73e8" rx="6"/>
  <text x="24" y="30" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">HA</text>
</svg>
EOF

cat > public/icon128.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <rect width="128" height="128" fill="#1a73e8" rx="16"/>
  <text x="64" y="75" text-anchor="middle" fill="white" font-size="48" font-family="Arial, sans-serif" font-weight="bold">HA</text>
</svg>
EOF

# Update manifest to use SVG icons
sed -i 's/icon16\.png/icon16.svg/g' manifest.json
sed -i 's/icon48\.png/icon48.svg/g' manifest.json
sed -i 's/icon128\.png/icon128.svg/g' manifest.json

# Go back to root directory
cd ..

echo ""
echo "✅ Multi-browser setup complete!"
echo ""
echo "📁 Directory structure:"
echo "   - Chrome extension: $(pwd)/extension-chrome/"
echo "   - Firefox extension: $(pwd)/extension-firefox/"
echo ""
echo "🌐 Chrome setup:"
echo "   1. Open Chrome → chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select: $(pwd)/extension-chrome/"
echo ""
echo "🦊 Firefox setup:"
echo "   1. Open Firefox → about:debugging"
echo "   2. Click 'This Firefox'"
echo "   3. Click 'Load Temporary Add-on'"
echo "   4. Select: $(pwd)/extension-firefox/manifest.json"
echo ""
echo "🔗 Test URLs (same for both browsers):"
echo "   - LinkedIn Jobs: https://www.linkedin.com/jobs/"
echo "   - Indeed: https://www.indeed.com/"
echo "   - Backend Health: http://localhost:3000/health"
echo ""

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Backend is not running. Start it with: cd backend && npm run dev"
    echo ""
    echo "🚀 To start backend now:"
    echo "   cd backend && npm run dev"
fi

echo ""
echo "🎯 Testing Tips:"
echo "   - Test the same features in both browsers"
echo "   - Compare extension behavior across browsers"
echo "   - Check console logs in both browsers"
echo "   - Verify data sync works correctly"

#!/bin/bash

# 🦊 Firefox Testing Script for HireAssist
# This script sets up the extension for Firefox testing

echo "🦊 Setting up HireAssist for Firefox testing..."

# Navigate to extension directory
cd extension

# Backup current manifest if it exists
if [ -f "manifest.json" ]; then
    echo "📋 Backing up current manifest..."
    cp manifest.json manifest-backup-$(date +%Y%m%d_%H%M%S).json
fi

# Use Firefox manifest
echo "🔄 Switching to Firefox manifest..."
cp manifest-firefox.json manifest.json

# Create placeholder icons if they don't exist
echo "🎨 Creating placeholder icons..."
mkdir -p public

# Create simple SVG icons for Firefox
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

# Update manifest to use SVG icons for Firefox
echo "🔧 Updating manifest for SVG icons..."
sed -i 's/icon16\.png/icon16.svg/g' manifest.json
sed -i 's/icon48\.png/icon48.svg/g' manifest.json
sed -i 's/icon128\.png/icon128.svg/g' manifest.json

echo ""
echo "✅ Firefox setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Open Firefox and go to: about:debugging"
echo "3. Click 'This Firefox'"
echo "4. Click 'Load Temporary Add-on'"
echo "5. Select: $(pwd)/manifest.json"
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

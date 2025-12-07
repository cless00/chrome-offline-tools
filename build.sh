#!/bin/bash

# Chrome Extension Build Script for Web Store Deployment
# Usage: ./build.sh

set -e

# Configuration
EXTENSION_NAME="offline-tools"
BUILD_DIR="build"
DIST_DIR="dist"
STORE_ASSETS_DIR="$DIST_DIR/store-assets"
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

echo "🔧 Building Chrome Extension v${VERSION}..."
echo ""

# Clean previous builds
echo "📁 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"
mkdir -p "$STORE_ASSETS_DIR"

# Copy extension files
echo "📋 Copying extension files..."

# Core files
cp manifest.json "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"

# Assets directory
cp -r assets "$BUILD_DIR/"

# Remove any development files from assets
rm -rf "$BUILD_DIR/assets/icons/icon.svg" 2>/dev/null || true

# Clean up any .DS_Store files
find "$BUILD_DIR" -name ".DS_Store" -delete 2>/dev/null || true

# Create ZIP file for Chrome Web Store
echo "📦 Creating ZIP archive..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip" ./*
cd ..

# Generate Store Assets
echo ""
echo "🎨 Generating store assets..."

# 1. Store Icon (128x128 with 96x96 icon + 16px padding) - Chrome Web Store guideline
echo "  🖼️  Creating store icon (96x96 icon with 16px padding)..."
node -e "
const sharp = require('sharp');

async function createStoreIcon() {
    // Resize icon to 96x96
    const resizedIcon = await sharp('assets/icons/icon128-dark.png')
        .resize(96, 96)
        .toBuffer();
    
    // Create 128x128 transparent canvas with 96x96 icon centered (16px padding each side)
    // Add subtle white glow for dark background visibility
    await sharp({
        create: {
            width: 128,
            height: 128,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
    .composite([{
        input: resizedIcon,
        left: 16,
        top: 16
    }])
    .png()
    .toFile('$STORE_ASSETS_DIR/store-icon-128.png');
    
    console.log('    Created store-icon-128.png (96x96 icon + 16px padding)');
}

createStoreIcon().catch(err => console.error('    Error:', err));
"

# 2. Large promotional tile (440x280) - Resize from icon
echo "  🖼️  Creating promotional tile..."
node -e "
const sharp = require('sharp');
const path = require('path');

// Create 440x280 promotional tile with icon centered on background
sharp({
    create: {
        width: 440,
        height: 280,
        channels: 4,
        background: { r: 30, g: 30, b: 40, alpha: 1 }
    }
})
.composite([{
    input: 'assets/icons/icon128-dark.png',
    gravity: 'center'
}])
.png()
.toFile('$STORE_ASSETS_DIR/promo-tile-440x280.png')
.then(() => console.log('    Created promo-tile-440x280.png'))
.catch(err => console.error('    Error:', err));
"

# 3. Screenshots (1280x800)
echo "  📸 Capturing screenshots..."
if [ -f "scripts/capture-screenshots.js" ]; then
    # Check if puppeteer is installed
    if [ ! -d "node_modules/puppeteer" ]; then
        echo "    Installing puppeteer..."
        npm install puppeteer --save-dev --silent
    fi
    node scripts/capture-screenshots.js
else
    echo "    ⚠️  Screenshot script not found. Skipping..."
fi

# Calculate ZIP size
ZIP_SIZE=$(ls -lh "$DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip" | awk '{print $5}')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Extension Package:"
echo "   $DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip ($ZIP_SIZE)"
echo ""
echo "🎨 Store Assets:"
echo "   $STORE_ASSETS_DIR/"
ls -la "$STORE_ASSETS_DIR/" 2>/dev/null | tail -n +4 | awk '{print "   - " $NF " (" $5 ")"}'
echo ""
echo "📤 Next steps:"
echo "   1. Go to https://chrome.google.com/webstore/devconsole"
echo "   2. Click 'New Item' or update existing"
echo "   3. Upload: $DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip"
echo "   4. Upload store assets from: $STORE_ASSETS_DIR/"
echo ""

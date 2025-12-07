#!/bin/bash

# Chrome Extension Build Script for Web Store Deployment
# Usage: ./build.sh

set -e

# Configuration
EXTENSION_NAME="offline-tools"
BUILD_DIR="build"
DIST_DIR="dist"
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

echo "🔧 Building Chrome Extension v${VERSION}..."

# Clean previous builds
echo "📁 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"

# Create build directory
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

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

# Calculate ZIP size
ZIP_SIZE=$(ls -lh "$DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip" | awk '{print $5}')

echo ""
echo "✅ Build completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Package: $DIST_DIR/${EXTENSION_NAME}-v${VERSION}.zip"
echo "📏 Size: $ZIP_SIZE"
echo ""
echo "📤 Next steps:"
echo "   1. Go to https://chrome.google.com/webstore/devconsole"
echo "   2. Click 'New Item' or update existing"
echo "   3. Upload the ZIP file from: $DIST_DIR/"
echo ""

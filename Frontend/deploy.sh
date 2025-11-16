#!/bin/bash

# Configuration
BUILD_DIR="./build"
NGINX_DIR="/usr/share/nginx/html"
BACKUP_DIR="/usr/share/nginx/html_backup"

echo "🚀 Starting deployment process..."

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Run 'bun run build' first."
    exit 1
fi

echo "📦 Creating backup..."
sudo cp -r "$NGINX_DIR" "${BACKUP_DIR}_$(date +%Y%m%d_%H%M%S)"

echo "🔄 Deploying new build..."
sudo cp -r "$BUILD_DIR"/* "$NGINX_DIR"/

echo "🔐 Setting permissions..."
sudo chown -R nginx:nginx "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

echo "✅ Deployment completed successfully!"
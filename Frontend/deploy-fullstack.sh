#!/bin/bash

set -e

IP="147.45.147.54"
FRONTEND_DIR="./build"

echo "🚀 Deploying Fullstack with PM2"
echo "📡 IP: $IP"
echo "🎨 Frontend: PM2 (port 3000)"
echo "⚙️  Backend: PM2 (port 8000)"

# Сборка фронтенда
echo ""
echo "📦 Building Frontend..."
bun run build:prod

# Запуск/перезапуск через PM2
echo ""
echo "🔄 Managing services with PM2..."

# Проверяем, существует ли процесс frontend
if pm2 describe frontend > /dev/null 2>&1; then
    echo "🔄 Restarting frontend..."
    pm2 restart frontend
else
    echo "🎯 Starting frontend with PM2..."
    pm2 start ecosystem.config.js --only frontend
fi

# Проверяем бэкенд
if pm2 describe backend > /dev/null 2>&1; then
    echo "🔄 Restarting backend..."
    pm2 restart backend
else
    echo "⚙️ Starting backend with PM2..."
    pm2 start ecosystem.config.js --only backend
fi

# Сохраняем конфигурацию PM2
echo "💾 Saving PM2 configuration..."
pm2 save

# Настройка автозапуска
echo "🔧 Setting up startup script..."
pm2 startup || true

# Проверка статуса
echo ""
echo "📊 PM2 Status:"
pm2 status

# Проверка сервисов
echo ""
echo "🔍 Checking services..."
sleep 3

echo "🎯 Frontend check (port 3000):"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo "⚙️ Backend check (port 8000):"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "⚠️ Backend health check failed"
fi

# Перезагрузка nginx
echo ""
echo "🔄 Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ PM2 Deployment completed!"
echo "🌐 Application: https://$IP"
echo "🔧 API: https://$IP/api/"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status              - Check status"
echo "   pm2 logs frontend       - Frontend logs"
echo "   pm2 logs backend        - Backend logs"
echo "   pm2 monit               - Monitor all services"
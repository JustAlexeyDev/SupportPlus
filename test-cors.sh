#!/bin/bash

echo "🔍 Диагностика CORS и подключения"
echo ""

# Получаем локальный IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Не удалось определить локальный IP"
    exit 1
fi

echo "📍 Локальный IP: $LOCAL_IP"
echo ""

# Проверяем, запущен ли бэкенд
echo "🔌 Проверка бэкенда..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    echo "✅ Backend доступен на localhost:8000"
else
    echo "❌ Backend НЕ доступен на localhost:8000"
    echo "   Убедитесь, что бэкенд запущен: cd Backend && npm run start:dev"
fi

# Проверяем доступность с локального IP
if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:8000/health | grep -q "200"; then
    echo "✅ Backend доступен на $LOCAL_IP:8000"
else
    echo "❌ Backend НЕ доступен на $LOCAL_IP:8000"
    echo "   Проверьте, что HOST=0.0.0.0 в Backend/.env"
fi

echo ""

# Проверяем CORS заголовки
echo "🌐 Проверка CORS заголовков..."
echo ""

# Тест с localhost
echo "Тест 1: Запрос с localhost:3000"
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    -i http://localhost:8000/auth/login 2>&1)

if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
    echo "✅ CORS заголовки присутствуют для localhost:3000"
    echo "$CORS_RESPONSE" | grep -i "access-control" | head -5
else
    echo "❌ CORS заголовки отсутствуют для localhost:3000"
fi

echo ""

# Тест с локальным IP
echo "Тест 2: Запрос с $LOCAL_IP:3000"
CORS_RESPONSE_IP=$(curl -s -H "Origin: http://$LOCAL_IP:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    -i http://localhost:8000/auth/login 2>&1)

if echo "$CORS_RESPONSE_IP" | grep -q "access-control-allow-origin"; then
    echo "✅ CORS заголовки присутствуют для $LOCAL_IP:3000"
    echo "$CORS_RESPONSE_IP" | grep -i "access-control" | head -5
else
    echo "❌ CORS заголовки отсутствуют для $LOCAL_IP:3000"
fi

echo ""
echo "📋 Рекомендации:"
echo "   1. Убедитесь, что Backend/.env содержит:"
echo "      NODE_ENV=development"
echo "      HOST=0.0.0.0"
echo "      PORT=8000"
echo ""
echo "   2. Убедитесь, что Frontend/.env содержит (или пусто для автоопределения):"
echo "      REACT_APP_API_URL=http://$LOCAL_IP:8000"
echo ""
echo "   3. Перезапустите бэкенд после изменения .env"
echo ""
echo "   4. Проверьте брандмауэр:"
echo "      sudo ufw allow 8000"
echo "      sudo ufw allow 3000"
echo ""






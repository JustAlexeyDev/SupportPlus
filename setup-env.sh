#!/bin/bash

echo "🔧 Настройка .env файлов для проекта SupportPlus"
echo ""

# Backend .env
if [ ! -f "Backend/.env" ]; then
    echo "📝 Создание Backend/.env из примера..."
    if [ -f "Backend/.env.example" ]; then
        cp Backend/.env.example Backend/.env
        echo "✅ Backend/.env создан"
    else
        cat > Backend/.env << 'EOF'
# Backend Environment Variables
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000
DB_TYPE=sqlite
DB_DATABASE=supportplus.db
DB_SYNCHRONIZE=true
DB_LOGGING=true
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SWAGGER_PATH=api
EOF
        echo "✅ Backend/.env создан с базовыми настройками"
    fi
else
    echo "ℹ️  Backend/.env уже существует"
fi

# Frontend .env
if [ ! -f "Frontend/.env" ]; then
    echo "📝 Создание Frontend/.env из примера..."
    if [ -f "Frontend/.env.example" ]; then
        cp Frontend/.env.example Frontend/.env
        echo "✅ Frontend/.env создан"
    else
        cat > Frontend/.env << 'EOF'
# Frontend Environment Variables
# React requires REACT_APP_ prefix for custom variables
# Leave empty for auto-detection based on hostname
REACT_APP_API_URL=
EOF
        echo "✅ Frontend/.env создан с базовыми настройками"
    fi
else
    echo "ℹ️  Frontend/.env уже существует"
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Отредактируйте Backend/.env для настройки бэкенда"
echo "   2. Отредактируйте Frontend/.env для настройки фронтенда (опционально)"
echo "   3. Запустите серверы:"
echo "      cd Backend && npm run start:dev"
echo "      cd Frontend && npm run dev"
echo ""






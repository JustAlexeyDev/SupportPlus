#!/bin/bash

set -e

IP="147.45.147.54"
CONFIG_FILE="/etc/nginx/sites-available/fullstack-pm2"

echo "🎯 Setting up nginx for PM2 on $IP"

sudo tee $CONFIG_FILE > /dev/null <<EOF
server {
    listen 80;
    server_name $IP;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $IP;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Frontend через PM2
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend через PM2
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Health checks для PM2
    location /health/frontend {
        proxy_pass http://localhost:3000/;
        access_log off;
    }
    
    location /health/backend {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }

    gzip on;
    gzip_types application/javascript application/json text/css text/javascript;
}
EOF

# Активируем сайт
sudo ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/

# Проверяем конфигурацию
sudo nginx -t

# Перезагружаем nginx
sudo systemctl reload nginx

echo "✅ nginx PM2 setup completed!"
echo "🌐 Your app: https://$IP"
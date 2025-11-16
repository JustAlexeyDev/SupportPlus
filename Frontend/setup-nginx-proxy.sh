#!/bin/bash

set -e

IP="147.45.147.54"
FRONTEND_PORT="3000"
BACKEND_PORT="8000"
CONFIG_FILE="/etc/nginx/sites-available/fullstack-app"

echo "🎯 Setting up nginx proxy for:"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   External: https://$IP"

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

    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since' always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Static files
    location /static/ {
        proxy_pass http://localhost:$BACKEND_PORT/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types application/javascript application/json text/css text/javascript;
}
EOF

echo "🔗 Enabling site..."
sudo ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/

echo "🔍 Testing nginx configuration..."
sudo nginx -t

echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ nginx proxy setup completed!"
echo "🌐 Frontend: https://$IP"
echo "🔧 Backend API: https://$IP/api/"
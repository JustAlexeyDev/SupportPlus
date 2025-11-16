#!/bin/bash

case "$1" in
    "start")
        echo "🚀 Starting all services with PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 status
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        pm2 stop all
        pm2 status
        ;;
    "restart")
        echo "🔄 Restarting all services..."
        pm2 restart all
        pm2 status
        ;;
    "deploy")
        echo "🎯 Deploying frontend and restarting..."
        bun run build:prod
        pm2 restart frontend
        pm2 status
        ;;
    "logs")
        echo "📋 Showing logs..."
        if [ "$2" = "frontend" ]; then
            pm2 logs frontend
        elif [ "$2" = "backend" ]; then
            pm2 logs backend
        else
            pm2 logs
        fi
        ;;
    "status")
        echo "📊 PM2 Status:"
        pm2 status
        echo ""
        echo "🌐 Service URLs:"
        echo "   Frontend: https://147.45.147.54"
        echo "   Backend:  https://147.45.147.54/api/"
        ;;
    "setup")
        echo "🔧 Initial PM2 setup..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
        echo "✅ Setup completed. Run 'pm2 status' to check"
        ;;
    *)
        echo "📖 PM2 Management Script"
        echo "Usage: $0 {start|stop|restart|deploy|logs|status|setup}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  deploy    - Build and restart frontend"
        echo "  logs      - Show logs (frontend|backend)"
        echo "  status    - Show status and URLs"
        echo "  setup     - Initial setup"
        exit 1
        ;;
esac
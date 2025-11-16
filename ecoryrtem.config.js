module.exports = {
  apps: [
    // Frontend React app
    {
      name: 'frontend',
      cwd: './',
      script: 'npx',
      args: 'serve -s build -l 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    
    // Backend API
    {
      name: 'backend',
      cwd: '../backend', // укажите путь к бэкенду
      script: 'npm', // или 'bun', 'node'
      args: 'start', // или ваш скрипт запуска
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        HOST: 'localhost'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '147.45.147.54',
      ref: 'origin/main',
      repo: 'git@your-repo.git',
      path: '/var/www/fullstack',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/fullstack/logs'
    }
  }
};
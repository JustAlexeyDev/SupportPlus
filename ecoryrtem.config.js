cat > /var/www/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '/var/www/frontend',
      script: 'bun',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/frontend-error.log',
      out_file: '/var/log/frontend-out.log',
      log_file: '/var/log/frontend-combined.log',
      time: true
    },
    {
      name: 'backend',
      cwd: '/var/www/backend',
      script: 'bun',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/backend-error.log',
      out_file: '/var/log/backend-out.log',
      log_file: '/var/log/backend-combined.log',
      time: true
    }
  ]
};
EOF
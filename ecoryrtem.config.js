module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './Frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
      },
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'backend',
      cwd: './Backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
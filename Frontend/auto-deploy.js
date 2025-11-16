const { exec } = require('child_process');
const chokidar = require('chokidar');

console.log('Watching for changes...');

chokidar.watch(['src/**/*', 'public/**/*']).on('change', (path) => {
  console.log(`🔄 ${path} changed, rebuilding...`);
  
  exec('bun run build:optimized && rsync -av --delete build/ /usr/share/nginx/html/', 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Build failed: ${error}`);
        return;
      }
      console.log('✅ Build and deploy completed!');
    });
});
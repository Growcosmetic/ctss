// PM2 Ecosystem file for CTSS
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'ctss',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(), // Tự động detect thư mục hiện tại
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Logs
      error_file: './logs/ctss-error.log',
      out_file: './logs/ctss-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};

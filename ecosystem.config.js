module.exports = {
  apps: [{
    name: 'ctss',
    script: 'npm',
    args: 'start',
    cwd: '/root/ctss',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/root/ctss/logs/pm2-error.log',
    out_file: '/root/ctss/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};

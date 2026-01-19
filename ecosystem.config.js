module.exports = {
  apps: [
    {
      name: 'angeline-web-admin',
      cwd: './apps/web-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        DATABASE_URL: 'postgresql://angeline_admin:Angeline2026@localhost:5432/angeline_live?schema=public',
        JWT_SECRET: 'AngelineJWT2026SecretKey'
      },
      error_file: './logs/web-admin-error.log',
      out_file: './logs/web-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'angeline-live-core',
      cwd: './apps/live-core',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        LIVE_CORE_PORT: 7001
      },
      error_file: './logs/live-core-error.log',
      out_file: './logs/live-core-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      watch: false
    }
  ]
};

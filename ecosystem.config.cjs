module.exports = {
  apps: [{
    name: 'weather',
    script: 'server/index.mjs',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
      PORT: 4175,
    },
  }],
}


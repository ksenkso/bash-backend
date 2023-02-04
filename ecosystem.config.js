module.exports = {
  apps: [{
    name: 'backend',
    script: 'dist/main.js',
    env: {
      "NODE_ENV": 'development',
      "APP_PORT": '7777',
    },
    env_production: {
      "NODE_ENV": 'production',
      "APP_PORT": '443',
    }
  }]
}

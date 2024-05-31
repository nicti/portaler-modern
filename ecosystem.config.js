module.exports = {
  apps: [
    {
      name: 'api',
      script: 'out/index.js',
      cwd: 'packages/api-server',
    },
    {
      name: 'etl',
      script: 'out/index.js',
      cwd: 'packages/bin-etl',
    },
    {
      name: 'bot',
      script: 'out/index.js',
      cwd: 'packages/discord-bot',
    },
  ],
}

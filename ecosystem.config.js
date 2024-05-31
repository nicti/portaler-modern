module.exports = {
  apps: [
    {
      name: 'api',
      script: 'packages/api-server/out/index.js',
      cwd: 'packages/api-server',
    },
    {
      name: 'etl',
      script: 'packages/bin-etl/out/index.js',
      cwd: 'packages/bin-etl',
    },
    {
      name: 'bot',
      script: 'packages/discord-bot/out/index.js',
      cwd: 'packages/discord-bot',
    },
  ],
}

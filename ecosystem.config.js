module.exports = {
  apps: [
    {
      name: 'api',
      script: 'out/index.js',
      cwd: 'packages/api-server',
      time: true,
    },
    {
      name: 'etl',
      script: 'out/index.js',
      cwd: 'packages/bin-etl',
      time: true,
    },
    {
      name: 'bot',
      script: 'out/index.js',
      cwd: 'packages/discord-bot',
      time: true,
    },
  ],
}

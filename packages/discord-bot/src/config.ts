import { DBConfig, RedisConfig } from '@portaler/types'

interface BotConfig {
  db: DBConfig
  redis: RedisConfig
  token: string
  roleNameRead: string
  roleNameWrite: string
  api: string
}

const config: BotConfig = {
  db: {
    host: process.env.DB_HOST!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
    port: Number(process.env.DB_PORT || 5432),
  },
  redis: {
    host: process.env.REDIS_HOST!,
    password: process.env.REDIS_PASSWORD!,
    port: Number(process.env.REDIS_PORT || 6379),
    db: Number(process.env.REDIS_DB || 0),
  },
  token: process.env.DISCORD_BOT_TOKEN!,
  roleNameRead: process.env.DISCORD_ROLE_READ!,
  roleNameWrite: process.env.DISCORD_ROLE_WRITE!,
  api: 'https://discord.com/api',
}

export default config

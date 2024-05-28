import path from 'path'
import { createDb, migrate } from 'postgres-migrations'
import config from './config'
import logger from './logger'
import { db } from './db'

const migrations = async () => {
  const discord_server_ids = (
    process.env.DISCORD_SERVER_ID as unknown as string
  ).split(',')
  try {
    await createDb(config.db.database, {
      ...config.db,
      defaultDatabase: 'postgres',
    })

    await migrate(config.db, path.resolve('./db_migrations'))
  } catch (err: any) {
    logger.error('Error populating servers', { error: err })
  }
  for (let i = 0; i < discord_server_ids.length; i++) {
    const discord_server_id = discord_server_ids[i]
    try {
      await db.Server.create(discord_server_id)
    } catch (err: any) {
      logger.info('Server <' + discord_server_id + '> already exists in db')
    }
  }
}

export default migrations

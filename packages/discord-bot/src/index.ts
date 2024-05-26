import 'dotenv/config'

import { Client, Intents } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

import getDb from './db'
import initEvents from './events'
import logger from './logger'

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
})

// Start the bot
;(async () => {
  await getDb()

  const portalerCommand = new SlashCommandBuilder()
    .setName('portaler')
    .setDescription('Portaler commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('routes')
        .setDescription('List all routes to royal/bz zones')
    )
  const commands = [portalerCommand.toJSON()]

  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN as string
  )

  const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(',')[0]
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID as string,
      mainGuildId
    ),
    { body: commands }
  )

  client.login(process.env.DISCORD_BOT_TOKEN)

  client.on('ready', () => {
    logger.info('Discord Bot Started')
    initEvents(client)
  })
})()

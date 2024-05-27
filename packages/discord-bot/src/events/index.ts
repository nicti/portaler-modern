import {
  Client,
  Collection,
  Guild,
  GuildMember,
  Message,
  PartialGuildMember,
  Snowflake,
  TextChannel,
} from 'discord.js'
import roleHandler, { removeUser } from './handlers/roleHandler'
import setupServer from './handlers/setupServer'
import removeServer from './handlers/deleteServerRole'
import interactionCreate from './handlers/interactionCreate'
import getRoutes from '../util/routes'
import buildRoutesEmbed from '../util/embeds'

const fiveMinutes: number = 1000 * 60 * 5

const initEvents = (client: Client) => {
  // bot joins a server
  client.on('guildCreate', (server: Guild) => setupServer(server))

  // bot leaves server, need to flush role an users from db
  client.on('guildDelete', (server: Guild) => removeServer(server))

  // when members get updated
  client.on('guildMemberUpdate', (_, member: GuildMember) =>
    roleHandler(member)
  )

  // when a member leaves a server
  client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) =>
    removeUser(member)
  )

  // Slash command handler
  client.on('interactionCreate', (interaction: any) =>
    interactionCreate(client, interaction)
  )

  // setup interval for updating embeds
  setInterval(async () => {
    const allowedChannels: string[] = (
      process.env.DISCORD_ALLOWED_CHANNEL_IDS as string
    ).split(',')

    // get main discord id
    const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(',')[0]

    for (let i = 0; i < allowedChannels.length; i++) {
      const id: string = allowedChannels[i]
      const channel: TextChannel = (await client.channels.fetch(
        id
      )) as TextChannel
      const messages: Collection<Snowflake, Message> =
        await channel.messages.fetch()
      messages.forEach(async (message: Message): Promise<void> => {
        if (message.author.id === client.user?.id) {
          // this is my embed, update it
          if (message.embeds[0].title === 'Current royal/bz portals') {
            const [biDirectionalPathsExtended, validUntil] = await getRoutes(
              mainGuildId
            )
            if (biDirectionalPathsExtended === null || validUntil === null) {
              return
            }
            const embed = await buildRoutesEmbed(
              biDirectionalPathsExtended,
              validUntil
            )
            message.edit({ embeds: [embed] })
          }
        }
      })
    }
  }, fiveMinutes)
}

export default initEvents

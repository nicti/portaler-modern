import {
  Client,
  Collection,
  Guild,
  GuildMember,
  Message, MessageAttachment,
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
import getMapImage from '../util/cytosnap'

const fiveMinutes: number = 1000 * 60 * 5

const initEvents = (client: Client) => {
  // bot joins a server
  client.on('guildCreate', (server: Guild) => setupServer(server))

  // bot leaves server, need to flush role an users from db
  client.on('guildDelete', (server: Guild) => removeServer(server))

  // when members get updated
  client.on('guildMemberUpdate', (_, member: GuildMember) =>
    roleHandler(member),
  )

  // when a member leaves a server
  client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) =>
    removeUser(member),
  )

  // Slash command handler
  client.on('interactionCreate', (interaction: any) =>
    interactionCreate(client, interaction),
  )

  // setup interval for updating embeds
  const updateEmbeds = async () => {
    const allowedChannels: string[] = (
      process.env.DISCORD_ALLOWED_CHANNEL_IDS as string
    ).split(',')

    // get main discord id
    const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(',')[0]

    for (let i = 0; i < allowedChannels.length; i++) {
      const id: string = allowedChannels[i]
      let channel: TextChannel | null = null
      try {
        channel = (await client.channels.fetch(id)) as TextChannel
      } catch (DiscordAPIError) {
        console.error(
          `Channel with id ${id} does not exist or bot does not have access to it`,
        )
        continue
      }
      const messages: Collection<Snowflake, Message> =
        await channel.messages.fetch()
      messages.forEach(async (message: Message): Promise<void> => {
        if (message.author.id === client.user?.id) {
          // this is my embed, update it
          if (message.embeds[0].title === 'Current royal/bz portals') {
            const [biDirectionalPathsExtended, validUntil] = await getRoutes(
              mainGuildId,
            )
            if (biDirectionalPathsExtended === null || validUntil === null) {
              return
            }
            const image = await getMapImage(biDirectionalPathsExtended)
            const embed = await buildRoutesEmbed(
              biDirectionalPathsExtended,
              validUntil,
              image
            )
            let file: MessageAttachment | null = null
            if (image) {
              file = new MessageAttachment(image, 'map.png')
            }
            if (file) {
              message.edit({ embeds: [embed], files: [file] })
            } else {
              message.edit({ embeds: [embed] })
            }
          }
        }
      })
    }
  }
  // Initial run and interval every 5 minutes
  updateEmbeds()
  setInterval(updateEmbeds, fiveMinutes)
}

export default initEvents

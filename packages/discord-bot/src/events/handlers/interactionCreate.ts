import {
  Client,
  CommandInteraction,
  Message,
  MessageAttachment,
  MessageManager,
} from 'discord.js'

import logger from '../../logger'
import getRoutes from '../../util/routes'
import buildRoutesEmbed from '../../util/embeds'
import getMapImage from '../../util/cytosnap'

const interactionCreate = async (
  client: Client,
  interaction: CommandInteraction | any
) => {
  if (!interaction.isCommand()) return
  if (
    !(process.env.DISCORD_ALLOWED_CHANNEL_IDS as string)
      .split(',')
      .includes(interaction.channel.id)
  ) {
    return interaction.reply({
      content: 'This command is not allowed in this channel',
      ephemeral: true,
    })
  }
  if (interaction.commandName === 'portaler') {
    if (interaction.options.getSubcommand() === 'routes') {
      // get main discord id
      const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(',')[0]
      const [biDirectionalPathsExtended, validUntil] = await getRoutes(
        mainGuildId
      )
      if (biDirectionalPathsExtended === null || validUntil === null) {
        return interaction.reply({
          content: 'Failed to fetch routes',
          ephemeral: true,
        })
      }
      const image = await getMapImage(biDirectionalPathsExtended)
      const embed = await buildRoutesEmbed(
        biDirectionalPathsExtended,
        validUntil,
        image
      )
      let file: MessageAttachment | null = null
      if (image) {
        const sfbuff: any = Buffer.from(image.split(',')[1], 'base64')
        file = new MessageAttachment(sfbuff, 'map.png')
      }
      let msgResponse: Message | null = null
      if (file) {
        msgResponse = await interaction.reply({
          embeds: [embed],
          files: [file],
          fetchReply: true,
        })
      } else {
        msgResponse = await interaction.reply({
          embeds: [embed],
          fetchReply: true,
        })
      }
      if (msgResponse !== null) {
        const prevMessages: MessageManager = interaction.channel.messages
        prevMessages
          .fetch()
          .then((messages) => {
            messages.forEach((message: Message) => {
              if (
                message.author.id === client.user?.id &&
                msgResponse !== null &&
                msgResponse.id !== message.id
              ) {
                message.delete()
              }
            })
          })
          .catch((err: any) => {
            logger.error(
              "Couldn't fetch messages to delete old ones",
              err.message
            )
          })
      }
      return
    }
  }
}

export default interactionCreate

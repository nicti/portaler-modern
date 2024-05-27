import { Client, Message, MessageEmbed, MessageManager } from 'discord.js'

import logger from '../../logger'
import { round } from 'lodash'
import getRoutes from '../../util/routes'
import buildRoutesEmbed from '../../util/embeds'


const interactionCreate = async (client: Client, interaction: any) => {
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
      const embed = buildRoutesEmbed(biDirectionalPathsExtended, validUntil)
      const prevMessages: MessageManager = interaction.channel.messages
      prevMessages
        .fetch()
        .then((messages) => {
          messages.forEach((message: Message) => {
            if (message.author.id === client.user?.id) {
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

      return interaction.reply({ embeds: [embed] })
    }
  }
}

export default interactionCreate

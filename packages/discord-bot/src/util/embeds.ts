import { MessageEmbed } from 'discord.js'
import { round } from 'lodash'
import exp from 'node:constants'

const formatDate = (date: Date) =>
  `${date.getUTCDate()}/${
    date.getUTCMonth() + 1
  }/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()} UTC`

const buildRoutesEmbed = async (
  biDirectionalPathsExtended: any[],
  validUntil: number
) => {
  const embed = new MessageEmbed().setTitle('Current royal/bz portals')
  const biDirectionalPathsExtendedSorted = biDirectionalPathsExtended.sort(
    (a, b) => {
      if (a.distance < b.distance) return -1
      if (a.distance > b.distance) return 1
      return 0
    }
  )
  for (let i = 0; i < biDirectionalPathsExtendedSorted.length; i++) {
    const bidirectionalPath = biDirectionalPathsExtendedSorted[i]
    embed.addFields([
      {
        name: bidirectionalPath.name,
        value: bidirectionalPath.path.join(' -> '),
        inline: false,
      },
    ])
  }
  const validUntilDate = new Date(validUntil)
  const dateNow = new Date()
  embed.setDescription(`Valid until: ${formatDate(validUntilDate)} | <t:${round(
    validUntil / 1000
  )}:R>
Posted at:  ${formatDate(dateNow)} | <t:${round(Date.now() / 1000)}:R>`)
  embed.setFooter({
    text: 'Excluding underways and tunnels',
  })
  return embed
}

export default buildRoutesEmbed

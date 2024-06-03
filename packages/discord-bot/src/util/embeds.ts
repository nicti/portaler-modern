import { MessageEmbed } from 'discord.js'
import { round } from 'lodash'
import exp from 'node:constants'

const formatDate = (date: Date) =>
  `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getUTCFullYear()} ${date
    .getUTCHours()
    .toString()
    .padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')} UTC`

const buildRoutesEmbed = async (
  biDirectionalPathsExtended: any[],
  validUntil: number,
  image: any | null = null
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
  let descriptionPostfix = ''
  if (biDirectionalPathsExtendedSorted.length === 0) {
    descriptionPostfix = '**Get mapping! No info available at the moment.**'
  }
  let description = ''
  const dateNow = new Date()
  if (validUntil === Infinity) {
    description = `Posted at:  ${formatDate(dateNow)} | <t:${round(
      Date.now() / 1000
    )}:R>
${descriptionPostfix}`
  } else {
    const validUntilDate = new Date(validUntil)
    description = `Valid until: ${formatDate(validUntilDate)} | <t:${round(
      validUntil / 1000
    )}:R>
Posted at:  ${formatDate(dateNow)} | <t:${round(Date.now() / 1000)}:R>
${descriptionPostfix}`
  }
  embed.setDescription(description)
  embed.setURL(process.env.FRONTEND_LINK as string)
  embed.setFooter({
    text: 'Excluding underways and tunnels | Map only includes relevant paths',
  })
  if (image) {
    embed.setImage('attachment://map.png')
  }
  return embed
}

export default buildRoutesEmbed

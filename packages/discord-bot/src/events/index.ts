import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Events,
  Guild,
  GuildMember,
  PartialGuildMember,
} from 'discord.js'
import roleHandler, { removeUser } from './handlers/roleHandler'
import setupServer from './handlers/setupServer'
import removeServer from './handlers/deleteServerRole'
import { db, redis } from '../db'
import Graph from 'graphology'
import { bidirectional } from 'graphology-shortest-path/unweighted'
import { round } from 'lodash'

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

  client.on(
    Events.InteractionCreate,
    async (interaction: ChatInputCommandInteraction | any) => {
      if (!interaction.isChatInputCommand()) return
      if (interaction.commandName === 'portaler') {
        if (interaction.options.getSubcommand() === 'routes') {
          // get main discord id
          const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(
            ','
          )[0]
          const mainGuildInternal = await db.Server.getServer(mainGuildId)
          if (!mainGuildInternal) {
            return interaction.reply({
              content: 'Server not found',
              ephemeral: true,
            })
          }
          const zones = JSON.parse(await redis.getZones())
          const shortestPathToBzPortal = JSON.parse(
            await redis.getShortestPaths()
          )
          const portals = (
            await db.dbQuery('SELECT * FROM portals WHERE server_id = $1;', [
              mainGuildInternal.id,
            ])
          ).rows
          const portaledZones = zones.filter((zone: any) =>
            portals.some(
              (portal: any) =>
                !zone.type.startsWith('TUNNEL_') &&
                portal.size !== 'const' &&
                portal.size !== 'royal' &&
                (portal.conn1 === zone.name || portal.conn2 === zone.name)
            )
          )
          let validUntil: number = Infinity
          const portalGraph: Graph = new Graph({ type: 'undirected' })
          for (let i = 0; i < portals.length; i++) {
            const portal = portals[i]
            if (portal.size === 'const' || portal.size === 'royal') continue
            if (!portalGraph.hasNode(portal.conn1)) {
              portalGraph.addNode(portal.conn1)
            }
            if (!portalGraph.hasNode(portal.conn2)) {
              portalGraph.addNode(portal.conn2)
            }
            if (!portalGraph.hasEdge(portal.conn1, portal.conn2)) {
              portalGraph.addEdge(portal.conn1, portal.conn2)
            }
            if (portal.expires < validUntil) {
              validUntil = portal.expires
            }
          }
          const bidirectionalPaths = []
          for (let i = 0; i < portaledZones.length; i++) {
            const portaledZone = portaledZones[i]
            const path =
              bidirectional(
                portalGraph,
                'Setent-Et-Nusum',
                portaledZone.name
              ) ?? null
            if (path) {
              bidirectionalPaths.push(path)
            }
          }
          // rebuild bidirectional paths to include the royal zones
          const biDirectionalPathsExtended = []
          for (let i = 0; i < bidirectionalPaths.length; i++) {
            const bidirectionalPath = bidirectionalPaths[i]
            const targetZone = bidirectionalPath[bidirectionalPath.length - 1]
            const color = zones.find((z: any) => z.name === targetZone).color
            let distance = bidirectionalPath.length - 1
            let name = `Path to ${targetZone} :${color}_circle: (${
              bidirectionalPath.length - 1
            })`
            if (
              zones
                .find((z: any) => z.name === targetZone)
                .type.startsWith('OPENPVP_BLACK')
            ) {
              // this is a black zone, get the shortest path to bz portal
              const shortestPathToRoyal = shortestPathToBzPortal[targetZone]
              name = `Path to ${targetZone} :${color}_circle: (${
                bidirectionalPath.length - 1
              }, ${
                shortestPathToRoyal.distance - 1
              } to ${shortestPathToRoyal.to.join(', ')})`
              distance += shortestPathToRoyal.distance - 1
            }
            biDirectionalPathsExtended.push({
              path: bidirectionalPath,
              name: name,
              distance: distance,
              color: color,
            })
          }
          const embed = new EmbedBuilder().setTitle('Current royal/bz portals')
          const biDirectionalPathsExtendedSorted =
            biDirectionalPathsExtended.sort((a, b) => {
              if (a.distance < b.distance) return -1
              if (a.distance > b.distance) return 1
              return 0
            })
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
          embed.setDescription(`Valid until: ${new Date(
            validUntil
          ).toUTCString()} | <t:${round(validUntil / 1000)}:R>
Posted at: ${new Date().toUTCString()} | <t:${round(Date.now() / 1000)}:R>`)

          return interaction.reply({ embeds: [embed] })
        }
      }
    }
  )
}

export default initEvents

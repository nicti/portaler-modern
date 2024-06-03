import cytosnap from 'cytosnap'
import { db, redis } from '../db'
import { Zone } from '@portaler/types'
cytosnap.use(['cytoscape-fcose'])

const portalSizeToColor: any = {
  blue: '#00b0ff',
  yellow: '#ffc400',
  royal: '#aa00ff',
  const: '#ff3838',
}

const getZoneColor = (
  type: string,
  isHome: boolean,
  isDeep: boolean = false
): string => {
  if (isHome) {
    return '#aa00ff'
  }

  if (isDeep) {
    return '#00897b'
  }

  switch (type) {
    case 'road':
    case 'road-ho':
      return '#1de9b6'
    case 'black':
      return '#1b1a29'
    case 'red':
      return '#fe0b01'
    case 'yellow':
      return '#ffb002'
    case 'blue':
      return '#3d679c'
    case 'city':
      return '#42a5f5'
    case 'city-black':
      return '#140c7c'
    default:
      return '#15ff00'
  }
}

const getShape = (zone: Zone): string => {
  switch (zone.color) {
    case 'road':
      return 'cut-rectangle'
    case 'road-ho':
      return 'pentagon'
    case 'city':
      return 'star'
    case 'city-black':
      return 'star'
    default:
      return ''
  }
}

const getMapImage = async (
  biDirectionalPathsExtended: any[]
): Promise<any | null> => {
  const elements: any[] = []
  const zones = JSON.parse(await redis.getZones())
  const mainGuildId = (process.env.DISCORD_GUILD_ID as string).split(',')[0]
  const serverId = await db.Server.getServerIdByDiscordId(mainGuildId)
  if (serverId === null) {
    return null
  }
  const dbPortals: any[] = (
    await db.dbQuery('SELECT * FROM portals WHERE server_id = $1;', [serverId])
  ).rows
  if (biDirectionalPathsExtended.length) {
    biDirectionalPathsExtended.forEach(
      (d: {
        path: string[]
        name: string
        distance: number
        color: string
      }) => {
        for (let i = 0; i <= d.path.length - 1; i++) {
          const zone = zones.find((z: any) => z.name === d.path[i])
          let label = ''
          if (['red', 'yellow', 'blue', 'black'].includes(zone.color)) {
            label = `${d.path[i]} (${d.distance - 1})`
          } else {
            label = `${d.path[i]}`
          }
          const backgroundUrl = `url(./tiers/${zone.tier.toLowerCase()}.png)`
          elements.push({
            data: {
              id: d.path[i],
              label: label,
            },
            css: {
              backgroundColor: getZoneColor(
                zone.color,
                zone.name === process.env.HOME_ZONE
              ),
              shape: getShape(zone),
              width: 30,
              height: 30,
              'background-image': backgroundUrl,
              'background-height': 30,
              'background-width': 30,
              'background-repeat': 'no-repeat',
              'text-outline-width': 1,
              'text-outline-opacity': 0.5,
              'text-margin-y': -5,
            },
          })
          if (i > 0) {
            const portal = dbPortals.find(
              (p: any) =>
                (p.conn1 === d.path[i] && p.conn2 === d.path[i - 1]) ||
                (p.conn1 === d.path[i - 1] && p.conn2 === d.path[i])
            )
            elements.push({
              data: {
                source: d.path[i],
                target: d.path[i - 1],
              },
              css: {
                lineColor: portal ? portalSizeToColor[portal.size] : '',
                width: 5,
                'text-outline-color': '#222',
                'text-outline-width': 2,
                'text-outline-opacity': 0.5,
              },
            })
          }
        }
      }
    )
  } else {
    const zone = zones.find((z: any) => z.name === process.env.HOME_ZONE)
    const label = `${process.env.HOME_ZONE}`
    const backgroundUrl = zone.tier
      ? `url(./tiers/${zone.tier.toLowerCase()}.png)`
      : 'none'
    elements.push({
      data: {
        id: process.env.HOME_ZONE,
        label: label,
      },
      css: {
        backgroundColor: getZoneColor(
          zone.color,
          zone.name === process.env.HOME_ZONE
        ),
        shape: getShape(zone),
        width: 30,
        height: 30,
        'background-image': backgroundUrl,
        'background-height': 30,
        'background-width': 30,
        'background-repeat': 'no-repeat',
        'text-outline-width': 1,
        'text-outline-opacity': 0.5,
        'text-margin-y': -5,
      },
    })
  }
  const snap = cytosnap({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-web-security'],
  })
  await snap.start()
  return await snap.shot({
    elements: elements,
    pan: { x: 0, y: 0 },
    minZoom: 0.05,
    maxZoom: 1.75,
    wheelSensitivity: 0.25,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: true,
    selectionType: 'single',
    layout: {
      name: 'fcose',
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 70,
      nestingFactor: 0.5,
      fit: true,
      randomize: true,
      padding: 42,
      animationDuration: 250,
      tilingPaddingVertical: 20,
      tilingPaddingHorizontal: 20,
      nodeRepulsion: 4194304,
      numIter: 2097152,
      uniformNodeDimensions: true,
      quality: 'proof',
      gravityRangeCompound: -100.0,
    },
    style: [
      {
        selector: 'node[label]',
        css: {
          label: 'data(label)',
          color: 'white',
        },
      },
      {
        selector: 'edge[label]',
        css: {
          label: 'data(label)',
          width: 3,
          color: 'white',
        },
      },
      {
        selector: '.timeLow',
        css: {
          color: 'red',
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'unbundled-bezier',
        },
      },
    ],
    resolvesTo: 'stream',
    format: 'png',
    width: 1500,
    height: 1000,
    background: '#333',
  })
}

export default getMapImage

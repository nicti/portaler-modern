import Graph from 'graphology'
import { bidirectional } from 'graphology-shortest-path/unweighted'
import FullZone from './FullZone'
import { redis } from './db'

const calculateWorldMapping = (fileData: FullZone[]) => {
  // bz mapping
  const bzGraph = new Graph()
  const bzPortalMap = new Map<string, string>()

  const bzData = fileData.filter(
    (item) =>
      item.enabled === 'true' &&
      (item.type.startsWith('OPENPVP_BLACK') ||
        item.type.startsWith('PLAYERCITY_BLACK_PORTALCITY_NOFURNITURE'))
  )
  // bz nodes
  bzData.forEach((item: FullZone) => {
    // @ts-ignore
    bzGraph.addNode(item.displayname)
    if (Array.isArray(item.exits?.exit)) {
      item.exits?.exit.forEach((exit) => {
        bzPortalMap.set(`${exit.id}@${item.id}`, item.displayname)
      })
    }
  })
  // bz edges
  bzData.forEach((item: FullZone) => {
    if (Array.isArray(item.exits?.exit)) {
      item.exits?.exit.forEach((exit) => {
        const target = bzPortalMap.get(exit.targetid)
        if (target === undefined) {
          return
        }
        try {
          // @ts-ignore
          bzGraph.addEdge(item.displayname, target)
        } catch (UsageGraphError) {}
      })
    }
  })
  // bz to portals storage
  const bzToPortals: any = {}
  // bz to portals calculation
  bzData.forEach((zone: FullZone) => {
    let shortest: string[][] = []
    const bridgewatch =
      bidirectional(bzGraph, zone.displayname, 'Bridgewatch Portal') ?? []
    shortest.push(bridgewatch)
    let shortNum: number = shortest[0].length
    const fortSterling =
      bidirectional(bzGraph, zone.displayname, 'Fort Sterling Portal') ?? []
    if (fortSterling.length < shortNum) {
      shortest = [fortSterling]
      shortNum = fortSterling.length
    } else if (fortSterling.length === shortNum) {
      shortest.push(fortSterling)
    }
    const lymhurst =
      bidirectional(bzGraph, zone.displayname, 'Lymhurst Portal') ?? []
    if (lymhurst.length < shortNum) {
      shortest = [lymhurst]
      shortNum = lymhurst.length
    } else if (lymhurst.length === shortNum) {
      shortest.push(lymhurst)
    }
    const martlock =
      bidirectional(bzGraph, zone.displayname, 'Martlock Portal') ?? []
    if (martlock.length < shortNum) {
      shortest = [martlock]
      shortNum = martlock.length
    } else if (martlock.length === shortNum) {
      shortest.push(martlock)
    }
    const thetford =
      bidirectional(bzGraph, zone.displayname, 'Thetford Portal') ?? []
    if (thetford.length < shortNum) {
      shortest = [thetford]
      shortNum = thetford.length
    } else if (thetford.length === shortNum) {
      shortest.push(thetford)
    }
    bzToPortals[zone.displayname] = {
      to: shortest.map((i) => i[i.length - 1]),
      distance: shortNum,
      portals: shortest,
    }
  })

  // royal cities mapping
  const rcGraph = new Graph()
  const rcPortalMap = new Map<string, string>()
  const rcCity = [
    'Bridgewatch',
    'Fort Sterling',
    'Lymhurst',
    'Martlock',
    'Thetford',
    'Caerleon',
  ]

  const rcData = fileData.filter(
    (item) =>
      item.enabled === 'true' &&
      (item.type === 'SAFEAREA' ||
        item.type === 'OPENPVP_YELLOW' ||
        item.type === 'OPENPVP_RED' ||
        rcCity.includes(item.displayname))
  )
  rcData.forEach((item: FullZone) => {
    rcGraph.addNode(item.displayname)
    if (Array.isArray(item.exits?.exit)) {
      item.exits?.exit.forEach((exit) => {
        rcPortalMap.set(`${exit.id}@${item.id}`, item.displayname)
      })
    }
  })
  rcData.forEach((item: FullZone) => {
    if (Array.isArray(item.exits?.exit)) {
      item.exits?.exit.forEach((exit) => {
        const target = rcPortalMap.get(exit.targetid)
        if (target === undefined) {
          return
        }
        try {
          rcGraph.addEdge(item.displayname, target)
        } catch (UsageGraphError) {}
      })
    }
  })
  const rcToCitys: any = {}
  rcData.forEach((zone: FullZone) => {
    let shortest: string[][] = []
    const bridgewatch =
      bidirectional(rcGraph, zone.displayname, 'Bridgewatch') ?? []
    shortest.push(bridgewatch)
    let shortNum: number = shortest[0].length
    const fortSterling =
      bidirectional(rcGraph, zone.displayname, 'Fort Sterling') ?? []
    if (fortSterling.length < shortNum) {
      shortest = [fortSterling]
      shortNum = fortSterling.length
    } else if (fortSterling.length === shortNum) {
      shortest.push(fortSterling)
    }
    const lymhurst = bidirectional(rcGraph, zone.displayname, 'Lymhurst') ?? []
    if (lymhurst.length < shortNum) {
      shortest = [lymhurst]
      shortNum = lymhurst.length
    } else if (lymhurst.length === shortNum) {
      shortest.push(lymhurst)
    }
    const martlock = bidirectional(rcGraph, zone.displayname, 'Martlock') ?? []
    if (martlock.length < shortNum) {
      shortest = [martlock]
      shortNum = martlock.length
    } else if (martlock.length === shortNum) {
      shortest.push(martlock)
    }
    const thetford = bidirectional(rcGraph, zone.displayname, 'Thetford') ?? []
    if (thetford.length < shortNum) {
      shortest = [thetford]
      shortNum = thetford.length
    } else if (thetford.length === shortNum) {
      shortest.push(thetford)
    }
    const caerleon = bidirectional(rcGraph, zone.displayname, 'Caerleon') ?? []
    if (caerleon.length < shortNum) {
      shortest = [caerleon]
      shortNum = caerleon.length
    } else if (caerleon.length === shortNum) {
      shortest.push(caerleon)
    }
    rcToCitys[zone.displayname] = {
      to: shortest.map((i) => i[i.length - 1]),
      distance: shortNum,
      portals: shortest,
    }
  })

  redis.setShortestPaths({ ...bzToPortals, ...rcToCitys })
}

export default calculateWorldMapping

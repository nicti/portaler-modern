import Graph from 'graphology'
import { bidirectional } from 'graphology-shortest-path/unweighted'
import FullZone from './FullZone'
import { redis } from './db'

const calculateWorldMapping = (fileData: FullZone[]) => {
  // bz mapping
  const bzGraph = new Graph()
  const portalMap = new Map<string, string>()

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
        portalMap.set(exit.id, item.displayname)
      })
    }
  })
  // bz edges
  bzData.forEach((item: FullZone) => {
    if (Array.isArray(item.exits?.exit)) {
      item.exits?.exit.forEach((exit) => {
        const target = portalMap.get(exit.targetid.split('@')[0])
        if (target === undefined) {
          return
        }
        try {
          // @ts-ignore
          bzGraph.addEdge(item.displayname, target)
        } catch (UsageGraphError) {
          console.log('Error adding edge', item.displayname, target)
        }
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
  redis.setShortestPaths(bzToPortals)
  const a = 'b'
}

export default calculateWorldMapping

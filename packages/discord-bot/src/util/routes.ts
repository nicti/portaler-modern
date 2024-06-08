import { db, redis } from '../db'
import Graph from 'graphology'
import { bidirectional } from 'graphology-shortest-path/unweighted'

const getRoutes = async (
  mainGuildId: any
): Promise<[any[], number] | [null, null]> => {
  const mainGuildInternal = await db.Server.getServer(mainGuildId)
  if (!mainGuildInternal) {
    return [null, null]
  }
  const zones = JSON.parse(await redis.getZones())
  const shortestPathToBzPortal = JSON.parse(await redis.getShortestPaths())
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
        (portal.size !== 'royal' ||
          portal.conn1 === 'Brecilien' ||
          portal.conn2 === 'Brecilien') &&
        (portal.conn1 === zone.name || portal.conn2 === zone.name)
    )
  )
  let validUntil: number = Infinity
  const portalGraph: Graph = new Graph({ type: 'undirected' })
  for (let i = 0; i < portals.length; i++) {
    const portal = portals[i]
    if (
      portal.size === 'const' ||
      (portal.size === 'royal' &&
        !(portal.conn1 === 'Brecilien' || portal.conn2 === 'Brecilien'))
    )
      continue
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
    let path = null
    try {
      path =
        bidirectional(portalGraph, process.env.HOME_ZONE, portaledZone.name) ??
        null
    } catch (GraphError) {
      continue
    }
    if (path) {
      bidirectionalPaths.push(path)
    }
  }
  // rebuild bidirectional paths to include the royal zones
  const biDirectionalPathsExtended = []
  for (let i = 0; i < bidirectionalPaths.length; i++) {
    const bidirectionalPath = bidirectionalPaths[i]
    const targetZone = bidirectionalPath[bidirectionalPath.length - 1]
    let color = zones.find((z: any) => z.name === targetZone).color
    if (color === 'city-black') color = ':homes:'
    else color = `:${color}_circle:`
    let distance = bidirectionalPath.length - 1
    let name = `Path to ${targetZone} ${color} (${
      bidirectionalPath.length - 1
    })`
    const zone = zones.find((z: any) => z.name === targetZone)
    let zDistance = 0
    if (
      zone.type.startsWith('OPENPVP_BLACK') ||
      zone.type.startsWith('OPENPVP_RED') ||
      zone.type.startsWith('OPENPVP_YELLOW') ||
      zone.type.startsWith('SAFEAREA')
    ) {
      // this is a black zone, get the shortest path to bz portal
      const shortestPathToRoyal = shortestPathToBzPortal[targetZone]
      name = `Path to ${targetZone} ${color} (${
        bidirectionalPath.length - 1
      }, ${shortestPathToRoyal.distance - 1} to ${shortestPathToRoyal.to.join(
        ', '
      )})`
      distance += shortestPathToRoyal.distance - 1
      zDistance = shortestPathToRoyal.distance
    }
    biDirectionalPathsExtended.push({
      path: bidirectionalPath,
      name: name,
      distance: distance,
      zDistance: zDistance,
      color: color,
    })
  }
  return [biDirectionalPathsExtended, validUntil]
}

export default getRoutes

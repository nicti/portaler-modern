import { Router } from 'express'

import { getZoneMeta } from '../database/zones'
import { redis } from '../utils/db'
import logger from '../utils/logger'
import getVerifyUser from '../middleware/verifyUser'
import { RoleType } from '@portaler/data-models/out/models/Server'
import { getServerPortals, IPortalModel } from '../database/portals'

const router = Router()

router.get('/list', async (_, res) => {
  try {
    const zones = JSON.parse(await redis.getZones())
    const shortestPaths = JSON.parse(await redis.getShortestPaths())
    for (let i = 0; i < zones.length; i++) {
      zones[i] = {
        ...zones[i],
        shortestPaths: shortestPaths[zones[i].name],
      }
    }
    res.contentType('application/json').status(200).send(JSON.stringify(zones))
  } catch (err: any) {
    logger.error('Error fetching zones', {
      error: {
        error: JSON.stringify(err),
        trace: err.stack,
      },
    })
    res.sendStatus(500)
  }
})

router.post('/deadend', getVerifyUser(RoleType.WRITE), async (req, res) => {
  const body: { zoneId: number; zoneName: string } = req.body
  const zones = JSON.parse(await redis.getZones())
  const zone = zones.find((z: any) => z.name === body.zoneName)
  if (!zone.type.startsWith('TUNNEL_')) {
    return res.status(400).send('Zone is not a road')
  }
  const dbPortals: IPortalModel[] = await getServerPortals(req.serverId)
  const relatedPortals = dbPortals.filter(
    (portal: IPortalModel) =>
      portal.conn1 === body.zoneName || portal.conn2 === body.zoneName
  )
  if (relatedPortals.length > 1) {
    return res.status(400).send('Zone has too many portals')
  }
  zones.find((z: any) => z.name === body.zoneName).is_dead_end =
    !zone.is_dead_end
  redis.setZones(zones).then(() => {
    res.sendStatus(204)
  })
})

router.get('/info/:id', async (req, res) => {
  try {
    const zone = await getZoneMeta(Number(req.params.id))
    const zones = JSON.parse(await redis.getZones())
    zone.is_dead_end = zones.find((z: any) => z.name === zone.name).is_dead_end
    res.contentType('application/json').status(200).send(zone)
  } catch (err: any) {
    logger.error('Error fetching zone info', {
      error: {
        error: JSON.stringify(err),
        trace: err.stack,
      },
    })
    res.sendStatus(500)
  }
})

export default router

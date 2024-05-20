import { Router } from 'express'

import { getZoneMeta } from '../database/zones'
import { redis } from '../utils/db'
import logger from '../utils/logger'
import { PortalPayload } from '@portaler/types'

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

router.get('/info/:id', async (req, res) => {
  try {
    const zone = await getZoneMeta(Number(req.params.id))
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

router.post('/test', async (req, res) => {
  const body: PortalPayload = req.body
  res.status(200).send(body)
})

export default router

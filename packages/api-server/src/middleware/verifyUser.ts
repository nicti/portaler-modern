import { NextFunction, Request, Response } from 'express'

import { db, redis } from '../utils/db'
import logger from '../utils/logger'
import { RoleType } from '@portaler/data-models/out/models/Server'

const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  permission: RoleType
) => {
  try {
    if (process.env.DISABLE_AUTH === 'true') {
      req.userId = 1
      req.serverId = 1
      return next()
    }

    if (!req.headers.authorization) {
      return res.sendStatus(401)
    }

    const authHeaders = req.headers.authorization.split(' ')

    if (authHeaders[0] !== 'Bearer') {
      return res.sendStatus(401)
    }

    const token = authHeaders[1]

    const userServer = await redis.getUser(token)

    if (!userServer) {
      return res.sendStatus(403)
    }

    const [userId, serverId0] = userServer.split(':')

    const discordServerIds = (process.env.DISCORD_SERVER_ID as string).split(
      ','
    )

    const serverIds: number[] = []
    for (let i = 0; i < discordServerIds.length; i++) {
      const sid: string = discordServerIds[i]
      serverIds.push((await db.Server.getServerIdByDiscordId(sid)) ?? 0)
    }

    // eslint-disable-next-line eqeqeq
    if (!serverIds.includes(parseInt(serverId0))) {
      return res.sendStatus(403)
    }

    // get permissions for user
    const perm = await db.User.getPermission(userId, permission)
    if (!perm) {
      return res.status(405).send('No permission')
    }

    req.userId = Number(userId)
    req.serverId = Number(serverId0)

    next()
  } catch (err: any) {
    logger.warn('Error verifying user', {
      error: {
        error: JSON.stringify(err),
        trace: err.stack,
      },
    })
    return res.status(500).send({ error: 'Error Verifying User' })
  }
}

const getVerifyUser =
  (permission: RoleType) =>
  (req: Request, res: Response, next: NextFunction) => {
    verifyUser(req, res, next, permission)
  }

export default getVerifyUser

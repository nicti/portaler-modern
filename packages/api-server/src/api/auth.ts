import btoa from 'btoa'
import { Router } from 'express'
import { v4 as uuid } from 'uuid'

import { UserAction } from '@portaler/data-models/out/models/User'

import config from '../utils/config'
import { db, redis } from '../utils/db'
import fetchToken from '../utils/discord/fetchToken'
import fetchUser from '../utils/discord/fetchUser'
import fetchUserGuilds, {
  DiscordMeGuilds,
} from '../utils/discord/fetchUserGuilds'
import logger from '../utils/logger'
import { RoleType } from '@portaler/data-models/out/models/Server'

const router = Router()

router.get('/login', (_, res) => {
  res.redirect(config.discord.authUrl)
})

// should come from auth.portaler
router.get('/callback', async (req, res) => {
  try {
    const discordServerId = (process.env.DISCORD_SERVER_ID as string).split(',')

    const protocol = req.secure ? 'https://' : 'http://'
    const code = req.query.code as string
    if (!code) {
      throw new Error('NoCodeProvided???: ' + code)
    }
    const discordJson = await fetchToken(code)
    const token = discordJson.access_token
    const [me, server] = await Promise.all([
      fetchUser(token),
      fetchUserGuilds(token),
    ])

    const userId = await db.User.createLogin(
      me,
      server,
      discordJson.refresh_token
    )
    // Find common discord servers between user and env
    const commonDiscordIds: DiscordMeGuilds[] = server.filter(
      (v: DiscordMeGuilds) => discordServerId.includes(v.id)
    )
    const serverId = await db.Server.getServerIdByDiscordId(
      commonDiscordIds[0].id
    )
    if (!serverId) {
      throw new Error('NoServerFound: ' + serverId)
    }

    const user = await db.User.getFullUser(userId, serverId)
    const redirectUrl = `${protocol}${config.localUrl}`
    if (!user) {
      return res.status(401).redirect(`${redirectUrl}/?token=invalid`)
    }
    if (!userId) {
      return res.status(401).redirect(`${redirectUrl}/?token=invalid`)
    }
    const uid: string = uuid()

    const ourToken = btoa(uid.replace(/-/gi, '')).replace(/=/gi, '')
    await redis.setUser(ourToken, user.id, serverId)

    await db.User.logUserAction(
      user.id,
      serverId,
      UserAction.login,
      JSON.stringify({ user })
    )

    const hasRead = await db.User.getPermission(
      user.id.toString(),
      RoleType.READ
    )
    const hasWrite = await db.User.getPermission(
      user.id.toString(),
      RoleType.WRITE
    )
    let permission = 0
    if (hasRead) {
      permission = 1
    }
    if (hasWrite) {
      permission = 2
    }

    res.redirect(`${redirectUrl}/?token=${ourToken}&permission=${permission}`)
  } catch (err: any) {
    logger.error('Error logging in User', {
      error: {
        error: JSON.stringify(err),
        trace: err.stack,
      },
    })
    res.sendStatus(500)
  }
})

export default router

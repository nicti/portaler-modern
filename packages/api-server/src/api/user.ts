import { Router } from 'express'
import { UserInfo } from '@portaler/types'
import logger from '../utils/logger'
import { getUserInfo } from '../database/users'
import getVerifyUser from '../middleware/verifyUser'
import { RoleType } from '@portaler/data-models/src/models/Server'

const router = Router()

router.get('/', getVerifyUser(RoleType.READ), async (req: any, res: any) => {
  try {
    const dbUsersInfo: UserInfo[] = await getUserInfo()
    const users_info = dbUsersInfo.map((p) => ({
      discord_name: p.discord_name,
      discord_discriminator: p.discord_discriminator,
      portals_created: p.portals_created,
    }))
    res.status(200).send(users_info)
    // public
    // res
    //   .status(200)
    //   .send("Hello! You can't parse public portaler users data, silly :)")
  } catch (err: any) {
    logger.error('Error fetching users info', {
      user: req.userId,
      server: req.serverId,
      error: err,
    })
    res.sendStatus(500)
  }
})

export default router

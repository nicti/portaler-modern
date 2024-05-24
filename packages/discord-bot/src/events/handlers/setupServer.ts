import { Guild, Role, RoleData } from 'discord.js'

import { IServerModel, IUserModel } from '@portaler/data-models'

import config from '../../config'
import { db, redis } from '../../db'
import logger from '../../logger'
import { RoleType } from '@portaler/data-models/out/models/Server'

const fetchRole = async (
  role: Role,
  server: Guild,
  serverRoleId: number,
  sid: number,
  dbServer: IServerModel
) => {
  const members = await server.members.fetch({ force: true })

  const membersToAdd = members.filter(
    (m: { roles: { cache: { has: (arg0: any) => any } } }) =>
      m.roles.cache.has(role.id)
  )

  const usersInDbRes = await Promise.all(
    membersToAdd.map((m) => db.User.getUserByDiscord(m.id))
  )

  const usersInDb = usersInDbRes.filter(Boolean) as IUserModel[]

  const usersNotInDb = membersToAdd.filter(
    (m) => !usersInDb.find((u) => u?.discordId === m.id)
  )

  const addRolesToUsers = usersInDb.map((u) =>
    db.User.addRoles(u.id, [serverRoleId], sid)
  )

  const addUsersAndRoles = usersNotInDb.map((m) =>
    db.User.createUser(m, sid, [serverRoleId])
  )

  const discord_id = dbServer && dbServer.discordId ? dbServer.discordId : ''

  const addToRedis = redis.setAsync(`server:${sid}`, discord_id)

  if (discord_id) {
    await redis.setAsync(
      `server:${discord_id}`,
      JSON.stringify({
        serverId: dbServer?.id,
      })
    )
  }
  await Promise.all([addToRedis, ...addRolesToUsers, ...addUsersAndRoles])
  logger.info('Attached to role ' + role.name + ' with id <' + role.id + '>')
}

const setupServer = async (server: Guild) => {
  // Build role payloads
  const roleReadPayload: RoleData = {
    name: config.roleNameRead,
    permissions: [],
    color: '#aa00ff',
    hoist: false,
    mentionable: false,
  }

  const roleWritePayload: RoleData = {
    name: config.roleNameWrite,
    permissions: [],
    color: '#aa00ff',
    hoist: false,
    mentionable: false,
  }

  try {
    let serverId = null

    // Fetch server from database
    const dbServer = await db.Server.getServer(server.id)
    if (!dbServer) {
      throw new Error(
        'Bot has been invited to wrong discord server, no manipulations provided'
      )
    }
    serverId = dbServer.id

    const discordRoles = await server.roles.cache

    // Read permission role check
    const hasReadRole = discordRoles.find(
      (r) => r.name === roleReadPayload.name
    )

    const readRole = hasReadRole || (await server.roles.create(roleReadPayload))
    const sid = serverId
    if (!sid) {
      throw new Error('Impossible error, how did you get there? xd')
    }
    const serverReadRoleId =
      hasReadRole && dbServer && dbServer.roles[0].id !== null
        ? dbServer.roles[0].id
        : await db.Server.createRole(sid, readRole.id, RoleType.READ)

    // Write permission role check
    const hasWriteRole = discordRoles.find(
      (r) => r.name === roleWritePayload.name
    )

    const writeRole =
      hasWriteRole || (await server.roles.create(roleWritePayload))
    const serverWriteRoleId =
      hasWriteRole && dbServer && dbServer.roles[0].id !== null
        ? dbServer.roles[0].id
        : await db.Server.createRole(sid, writeRole.id, RoleType.WRITE)

    if (hasReadRole) {
      await fetchRole(readRole, server, serverReadRoleId, sid, dbServer)
    }
    if (hasWriteRole) {
      await fetchRole(writeRole, server, serverWriteRoleId, sid, dbServer)
    }
    logger.info('New server with id <' + dbServer.discordId + '> created')
  } catch (err: any) {
    logger.error('Error setting up server', {
      name: server.name,
      id: server.id,
      error: err.message,
    })
  }
}

export default setupServer

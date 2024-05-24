import { GuildMember, PartialGuildMember } from 'discord.js'

import { db, redis } from '../../db'
import logger from '../../logger'
import { RoleType } from '@portaler/data-models/out/models/Server'

/**
 * Remove a user's roles and log them out
 * @param  userId
 * @param  serverId
 * @param  roleIds
 * @param  db
 * @param  redis
 */
const removeUserRoles = async (
  userId: number,
  serverId: number,
  roleIds: number[]
) => {
  try {
    await db.User.removeUserRoles(userId, roleIds)
  } catch (err: any) {
    logger.error('Remove role', {
      userId,
      serverId,
      roleIds,
      error: err,
    })
  }
}

/**
 * Remove a user from a
 * @param  member
 * @param  db
 * @param  redis
 */
export const removeUser = async (member: GuildMember | PartialGuildMember) => {
  const [server, user] = await Promise.all([
    db.Server.getServer(member.guild.id),
    db.User.getUserByDiscord(member.id),
  ])

  if (user && server) {
    await db.User.removeUserServer(user.id, server.id)

    removeUserRoles(
      user.id,
      server.id,
      server.roles.map((r: { id: any }) => r.id)
    )
  }
}

/**
 * Handles role updates
 * Checking against oldMember vs newMember from Discord.js is highly unreliable,
 * so we need to check against our own data sources
 * @param  member
 * @param  db
 * @param  redis
 */
const roleHandler = async (member: GuildMember) => {
  try {
    const server = await db.Server.getServer(member.guild.id)

    if (server) {
      // if this returns null, the user has no role assigned in database
      const user = await db.User.getFullUser(member.id, server.id)
      const roles = server.roles

      const newRoles: string[] = member.roles.cache.map((r) => r.id)

      // Handle read role
      const readRoleId: any[] = roles.filter(
        (r) => r.role_type === RoleType.READ
      )

      const hasReadRole = newRoles.some((r) =>
        readRoleId.map((r) => r.discordRoleId).includes(r)
      )

      if (user && !hasReadRole) {
        // role was removed from user
        removeUserRoles(
          user.id,
          server.id,
          readRoleId.map((r) => r.id)
        )
      } else if (!user && hasReadRole) {
        const dbUser = await db.User.getUserByDiscord(member.id)

        if (dbUser) {
          await db.User.addRoles(
            dbUser.id,
            readRoleId.map((r) => r.id),
            server.id
          )
        } else {
          await db.User.createUser(
            member,
            server.id,
            readRoleId.map((r) => r.id)
          )
        }
      }

      // Handle write role
      const writeRoleId: any[] = roles.filter(
        (r) => r.role_type === RoleType.WRITE
      )

      const hasWriteRole = newRoles.some((r) =>
        writeRoleId.map((r) => r.discordRoleId).includes(r)
      )

      if (user && !hasWriteRole) {
        // role was removed from user
        removeUserRoles(
          user.id,
          server.id,
          writeRoleId.map((r) => r.id)
        )
      } else if (!user && hasWriteRole) {
        const dbUser = await db.User.getUserByDiscord(member.id)

        if (dbUser) {
          await db.User.addRoles(
            dbUser.id,
            writeRoleId.map((r) => r.id),
            server.id
          )
        } else {
          await db.User.createUser(
            member,
            server.id,
            writeRoleId.map((r) => r.id)
          )
        }
      } else if (user && hasWriteRole) {
        const dbUser = await db.User.getUserByDiscord(member.id)

        if (dbUser) {
          await db.User.addRoles(
            dbUser.id,
            writeRoleId.map((r) => r.id),
            server.id
          )
        } else {
          await db.User.createUser(
            member,
            server.id,
            writeRoleId.map((r) => r.id)
          )
        }
      }
    }
  } catch (err: any) {
    logger.error(err)
  }
}

export default roleHandler

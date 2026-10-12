import crypto from "crypto"
import argon2 from "argon2"

import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { sendMail } from "../../../utils/mail"
import pool from "../../../config/database"

import {
  countActiveUsers,
  findTemplesByOrganization,
  findUserInOrganization,
  findUserStatuses,
  findUsersByOrganization,
  getOrganizationLimit,
  insertUser,
  isEmailOrPhoneTaken,
  isTempleInOrganization,
  lockOrganizationLimit,
  revokeUserSessions,
  softDeleteUser,
  updateUserStatus,
} from "../repositories/userRepository"

import type { CreateUserInput, UserLimit } from "../usersTypes"

const LIMIT_MESSAGE = "User limit reached. Suspend or deactivate an existing user, or buy more users."

const PASSWORD_SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@#$%&*!?"]

const pick = (chars: string) => chars[crypto.randomInt(chars.length)]

export const generatePassword = (length = 12) => {
  const all = PASSWORD_SETS.join("")
  const chars = [...PASSWORD_SETS.map(pick), ...Array.from({ length: length - PASSWORD_SETS.length }, () => pick(all))]
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

export const listUsersService = (organizationId: number) => findUsersByOrganization(organizationId)

export const listTemplesService = (organizationId: number) => findTemplesByOrganization(organizationId)

export const listStatusesService = () => findUserStatuses()

export const getUserLimitService = async (organizationId: number): Promise<UserLimit> => {
  const [limit, used] = await Promise.all([getOrganizationLimit(organizationId), countActiveUsers(pool, organizationId)])
  return { limit, used, remaining: Math.max(0, limit - used) }
}

export const createUserService = async (organizationId: number, input: CreateUserInput) => {
  const statuses = await findUserStatuses()
  if (!statuses.includes(input.user_status)) throw new HttpError(400, "Invalid status")

  const password = generatePassword()
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

  const id = await withTransaction(async (conn) => {
    const limit = await lockOrganizationLimit(conn, organizationId)
    if ((await countActiveUsers(conn, organizationId)) >= limit) throw new HttpError(409, LIMIT_MESSAGE)
    if (!(await isTempleInOrganization(conn, input.temple_id, organizationId))) {
      throw new HttpError(403, "Selected temple does not belong to your organization")
    }
    if (await isEmailOrPhoneTaken(conn, input.user_email, input.user_phone)) {
      throw new HttpError(409, "A user with this email or phone already exists")
    }
    return insertUser(conn, {
      ...input,
      organization_id: organizationId,
      user_code: `U${organizationId}-${Date.now().toString(36).toUpperCase()}`,
      user_password_hash: passwordHash,
    })
  })

  void sendMail({
    to: input.user_email,
    subject: "Your TMS account has been created",
    text: `Hello ${input.user_name},\n\nYour account has been created.\nLogin: ${input.user_email}\nPassword: ${password}\n\nPlease change your password after first login.`,
  })

  return { id, password }
}

export const updateUserStatusService = async (organizationId: number, id: number, status: string) => {
  const statuses = await findUserStatuses()
  if (!statuses.includes(status)) throw new HttpError(400, "Invalid status")

  await withTransaction(async (conn) => {
    const limit = await lockOrganizationLimit(conn, organizationId)
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    if (user.user_status === status) return
    if (status === "active" && (await countActiveUsers(conn, organizationId)) >= limit) {
      throw new HttpError(409, LIMIT_MESSAGE)
    }
    await updateUserStatus(conn, id, status)
    if (status !== "active") await revokeUserSessions(conn, id)
  })
}

export const deleteUserService = async (organizationId: number, id: number) => {
  await withTransaction(async (conn) => {
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    await softDeleteUser(conn, id)
    await revokeUserSessions(conn, id)
  })
}

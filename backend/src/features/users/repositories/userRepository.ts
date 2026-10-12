import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import pool from "../../../config/database"

import type { CreateUserRecord, UserListItem } from "../usersTypes"

export const findUsersByOrganization = async (organizationId: number) => {
  const [rows] = await pool.execute<(RowDataPacket & UserListItem)[]>(
    `SELECT u.id, u.user_code, u.user_name, u.user_email, u.user_phone, u.role_id, r.user_role,
            u.user_status, u.temple_id, t.temp_name, u.created_at
     FROM users u
     JOIN default_roles r ON r.id = u.role_id
     LEFT JOIN temples t ON t.id = u.temple_id
     WHERE u.organization_id = ? AND u.role_id IN (3, 4) AND u.deleted_at IS NULL
     ORDER BY u.id DESC`,
    [organizationId],
  )
  return rows
}

export const findUserInOrganization = async (conn: PoolConnection, id: number, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id, user_status FROM users
     WHERE id = ? AND organization_id = ? AND role_id IN (3, 4) AND deleted_at IS NULL
     FOR UPDATE`,
    [id, organizationId],
  )
  return rows[0] as { id: number; user_status: string } | undefined
}

export const lockOrganizationLimit = async (conn: PoolConnection, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT org_default_users FROM organizations WHERE id = ? FOR UPDATE`,
    [organizationId],
  )
  return Number(rows[0]?.org_default_users ?? 0)
}

export const getOrganizationLimit = async (organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT org_default_users FROM organizations WHERE id = ?`,
    [organizationId],
  )
  return Number(rows[0]?.org_default_users ?? 0)
}

export const countActiveUsers = async (conn: PoolConnection | typeof pool, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(id) AS total FROM users
     WHERE organization_id = ? AND role_id IN (3, 4) AND user_status = 'active' AND deleted_at IS NULL`,
    [organizationId],
  )
  return Number(rows[0]?.total ?? 0)
}

export const findTemplesByOrganization = async (organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, temp_name FROM temples WHERE organization_id = ? AND deleted_at IS NULL ORDER BY temp_name ASC`,
    [organizationId],
  )
  return rows as { id: number; temp_name: string }[]
}

export const isTempleInOrganization = async (conn: PoolConnection, templeId: number, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id FROM temples WHERE id = ? AND organization_id = ? AND deleted_at IS NULL`,
    [templeId, organizationId],
  )
  return rows.length > 0
}

export const findUserStatuses = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'user_status'`,
  )
  const columnType = String(rows[0]?.COLUMN_TYPE ?? "")
  return [...columnType.matchAll(/'([^']+)'/g)].map((match) => match[1])
}

export const isEmailOrPhoneTaken = async (conn: PoolConnection, email: string, phone: string) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id FROM users WHERE deleted_at IS NULL AND (user_email = ? OR user_phone = ?) LIMIT 1`,
    [email, phone],
  )
  return rows.length > 0
}

export const insertUser = async (conn: PoolConnection, data: CreateUserRecord) => {
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO users (organization_id, temple_id, user_code, user_name, user_email, user_phone,
       user_password_hash, role_id, user_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.organization_id,
      data.temple_id,
      data.user_code,
      data.user_name,
      data.user_email,
      data.user_phone,
      data.user_password_hash,
      data.role_id,
      data.user_status,
    ],
  )
  return result.insertId
}

export const updateUserStatus = async (conn: PoolConnection, id: number, status: string) => {
  await conn.execute(`UPDATE users SET user_status = ?, updated_at = NOW() WHERE id = ?`, [status, id])
}

export const softDeleteUser = async (conn: PoolConnection, id: number) => {
  await conn.execute(`UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?`, [id])
}

export const revokeUserSessions = async (conn: PoolConnection, id: number) => {
  await conn.execute(`UPDATE user_auth_sessions SET revoked = 1 WHERE user_id = ? AND revoked = 0`, [id])
}

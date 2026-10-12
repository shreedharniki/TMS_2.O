


import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

import type {
  CreateTemplePayload,
  Temple,
  UpdateTemplePayload,
} from "../templeTypes"
import {
  TempleDuplicateError,
  type TempleUniqueField,
} from "../validations/templeErrors";
interface TempleRow extends Temple, RowDataPacket {}

interface TempleCountRow extends RowDataPacket {
  total: number
}

/**
 * Values accepted by mysql2 execute().
 */
type MySqlValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer


  
const uniqueTempleFields: TempleUniqueField[] = [
  "temp_name",
  "temp_registration_number",
  "temp_gst_number",
  "temp_email",
  "temp_phone",
  "temp_slug",
];

export async function assertTempleUnique(
  connection: PoolConnection,
  organizationId: number,
  field: TempleUniqueField,
  value: string | null | undefined,
  excludeTempleId?: number,
): Promise<void> {
  if (!uniqueTempleFields.includes(field)) {
    throw new Error("Invalid temple unique field");
  }

  const normalizedValue = value?.trim();

  // Blank optional fields do not need duplicate checking.
  if (!normalizedValue) {
    return;
  }

  const comparisonValue =
    field === "temp_email"
      ? normalizedValue.toLowerCase()
      : normalizedValue;

  const sql = `
    SELECT id
    FROM temples
    WHERE organization_id = ?
      AND deleted_at IS NULL
      AND LOWER(TRIM(${field})) = LOWER(TRIM(?))
      ${excludeTempleId !== undefined ? "AND id <> ?" : ""}
    LIMIT 1
  `;

  const params: (number | string)[] = [
    organizationId,
    comparisonValue,
  ];

  if (excludeTempleId !== undefined) {
    params.push(excludeTempleId);
  }

  const [rows] = await connection.execute<RowDataPacket[]>(
    sql,
    params,
  );

  if (rows.length > 0) {
    throw new TempleDuplicateError(field);
  }
}

/**
 * =========================================================
 * CREATE TEMPLE
 * =========================================================
 */
export async function createTemple(
  connection: PoolConnection,
  organizationId: number,
  data: CreateTemplePayload,
): Promise<number> {
  const sql = `
    INSERT INTO temples (
      organization_id,
      temp_name,
      temp_img_name,
      temp_legal_name,
      temp_registration_number,
      temp_gst_number,
      temp_email,
      temp_phone,
      temp_address_line1,
      temp_address_line2,
      temp_city,
      temp_state,
      temp_country,
      temp_pincode,
      temp_lat,
      temp_lng,
      temp_slug,
      temp_is_primary,
      temp_status,
      temp_timezone
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const values: MySqlValue[] = [
    organizationId,
    data.temp_name,
    data.temp_img_name ?? null,
    data.temp_legal_name ?? null,
    data.temp_registration_number ?? null,
    data.temp_gst_number ?? null,
    data.temp_email ?? null,
    data.temp_phone ?? null,
    data.temp_address_line1 ?? null,
    data.temp_address_line2 ?? null,
    data.temp_city ?? null,
    data.temp_state ?? null,
    data.temp_country ?? "India",
    data.temp_pincode ?? null,
    data.temp_lat ?? null,
    data.temp_lng ?? null,
    data.temp_slug ?? null,
    data.temp_is_primary ? 1 : 0,
    data.temp_status ?? "active",
    data.temp_timezone ?? "Asia/Kolkata",
  ]

  const [result] =
    await connection.execute<ResultSetHeader>(
      sql,
      values,
    )

  return result.insertId
}

/**
 * =========================================================
 * COUNT ACTIVE TEMPLES
 * =========================================================
 *
 * Soft-deleted temples are NOT counted.
 */
export async function countTemples(
  connection: PoolConnection,
  organizationId: number,
): Promise<number> {
  const sql = `
    SELECT COUNT(*) AS total
    FROM temples
    WHERE organization_id = ?
      AND deleted_at IS NULL
  `

  const [rows] =
    await connection.execute<TempleCountRow[]>(
      sql,
      [organizationId],
    )

  return Number(rows[0]?.total ?? 0)
}

/**
 * =========================================================
 * FIND ALL TEMPLES
 * =========================================================
 */
export async function findAllTemples(
  connection: PoolConnection,
  organizationId: number,
): Promise<Temple[]> {
  const sql = `
    SELECT
      id,
      organization_id,
      temp_name,
      temp_img_name,
      temp_legal_name,
      temp_registration_number,
      temp_gst_number,
      temp_email,
      temp_phone,
      temp_address_line1,
      temp_address_line2,
      temp_city,
      temp_state,
      temp_country,
      temp_pincode,
      temp_lat,
      temp_lng,
      temp_slug,
      temp_is_primary,
      temp_status,
      temp_timezone,
      created_at,
      updated_at,
      deleted_at
    FROM temples
    WHERE organization_id = ?
      AND deleted_at IS NULL
    ORDER BY id DESC
  `

  const [rows] =
    await connection.execute<TempleRow[]>(
      sql,
      [organizationId],
    )

  return rows
}

/**
 * =========================================================
 * FIND TEMPLE BY ID
 * =========================================================
 */
export async function findTempleById(
  connection: PoolConnection,
  organizationId: number,
  id: number,
): Promise<Temple | null> {
  const sql = `
    SELECT
      id,
      organization_id,
      temp_name,
      temp_img_name,
      temp_legal_name,
      temp_registration_number,
      temp_gst_number,
      temp_email,
      temp_phone,
      temp_address_line1,
      temp_address_line2,
      temp_city,
      temp_state,
      temp_country,
      temp_pincode,
      temp_lat,
      temp_lng,
      temp_slug,
      temp_is_primary,
      temp_status,
      temp_timezone,
      created_at,
      updated_at,
      deleted_at
    FROM temples
    WHERE id = ?
      AND organization_id = ?
      AND deleted_at IS NULL
    LIMIT 1
  `

  const [rows] =
    await connection.execute<TempleRow[]>(
      sql,
      [id, organizationId],
    )

  return rows[0] ?? null
}

/**
 * =========================================================
 * UPDATE TEMPLE
 * =========================================================
 */
export async function updateTemple(
  connection: PoolConnection,
  organizationId: number,
  id: number,
  data: UpdateTemplePayload,
): Promise<boolean> {
  const fields: string[] = []
  const values: MySqlValue[] = []

  const allowedFields:
    Array<keyof UpdateTemplePayload> = [
      "temp_name",
      "temp_img_name",
      "temp_legal_name",
      "temp_registration_number",
      "temp_gst_number",
      "temp_email",
      "temp_phone",
      "temp_address_line1",
      "temp_address_line2",
      "temp_city",
      "temp_state",
      "temp_country",
      "temp_pincode",
      "temp_lat",
      "temp_lng",
      "temp_slug",
      "temp_is_primary",
      "temp_status",
      "temp_timezone",
    ]

  for (const field of allowedFields) {
    const value = data[field]

    if (value !== undefined) {
      fields.push(`${field} = ?`)

      if (field === "temp_is_primary") {
        values.push(value ? 1 : 0)
      } else {
        values.push(value as MySqlValue)
      }
    }
  }

  if (fields.length === 0) {
    return false
  }

  values.push(id)
  values.push(organizationId)

  const sql = `
    UPDATE temples
    SET ${fields.join(", ")}
    WHERE id = ?
      AND organization_id = ?
      AND deleted_at IS NULL
  `

  const [result] =
    await connection.execute<ResultSetHeader>(
      sql,
      values,
    )

  return result.affectedRows > 0
}

/**
 * =========================================================
 * SOFT DELETE TEMPLE
 * =========================================================
 */
export async function softDeleteTemple(
  connection: PoolConnection,
  organizationId: number,
  id: number,
): Promise<boolean> {
  const sql = `
    UPDATE temples
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND organization_id = ?
      AND deleted_at IS NULL
  `

  const [result] =
    await connection.execute<ResultSetHeader>(
      sql,
      [id, organizationId],
    )

  return result.affectedRows > 0
}
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import type {
  ActiveSubscription,
  CartItem,
  CartItemType,
  CatalogItem,
  CreateOrderInput,
  CreateOrderItemInput,
  OrgBilling,
  UpcomingPlan,
} from "../cartTypes"

type Executor = Pool | PoolConnection

type Row<T> = T & RowDataPacket

const CATALOG_SQL: Record<CartItemType, string> = {
  plan: `
    SELECT
      'plan' AS item_type, id AS plan_id, NULL AS bundle_id,
      plan_name AS item_name, plan_code AS item_code, plan_type AS license_type,
      plan_duration_months AS duration_months, plan_quantity AS quantity,
      plan_price AS unit_price, plan_gst_percentage AS gst_percentage, plan_total_price AS line_total,
      JSON_OBJECT(
        'module_id', module_id, 'plan_name', plan_name, 'plan_code', plan_code,
        'plan_description', plan_description, 'plan_type', plan_type,
        'plan_quantity', plan_quantity, 'plan_duration_months', plan_duration_months,
        'plan_amc_price', plan_amc_price, 'plan_amc_duration_months', plan_amc_duration_months,
        'plan_amc_gst_percentage', plan_amc_gst_percentage
      ) AS snapshot
    FROM subscription_plans
    WHERE id = ? AND plan_status = 'active'
  `,
  bundle: `
    SELECT
      'bundle' AS item_type, NULL AS plan_id, b.id AS bundle_id,
      b.bundle_name AS item_name, b.bundle_code AS item_code, b.bundle_type AS license_type,
      b.bundle_duration_months AS duration_months, NULL AS quantity,
      b.bundle_price AS unit_price, b.bundle_gst_percentage AS gst_percentage, b.bundle_total_price AS line_total,
      JSON_OBJECT(
        'bundle_name', b.bundle_name, 'bundle_code', b.bundle_code, 'bundle_type', b.bundle_type,
        'bundle_duration_months', b.bundle_duration_months,
        'bundle_amc_price', b.bundle_amc_price, 'bundle_amc_duration_months', b.bundle_amc_duration_months,
        'bundle_amc_gst_percentage', b.bundle_amc_gst_percentage,
        'plans', JSON_EXTRACT(COALESCE((
          SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', p.id, 'module_id', p.module_id, 'plan_name', p.plan_name,
            'plan_code', p.plan_code, 'plan_quantity', p.plan_quantity
          ))
          FROM subscription_bundle_items bi
          JOIN subscription_plans p ON p.id = bi.plan_id
          WHERE bi.bundle_id = b.id
        ), '[]'), '$')
      ) AS snapshot
    FROM subscription_bundles b
    WHERE b.id = ? AND b.bundle_status = 'active'
  `,
}

const CART_ITEM_COLUMNS = `
  id, item_type, plan_id, bundle_id, item_name, item_code, license_type, quantity,
  unit_price, gst_percentage, gst_amount, line_total
`

export const cartRepository = {
  async findActiveCartId(ex: Executor, userId: number, lock = false) {
    const [rows] = await ex.execute<Row<{ id: number }>[]>(
      `SELECT id FROM cart WHERE user_id = ? AND cart_status = 'active' ORDER BY id DESC LIMIT 1 ${lock ? "FOR UPDATE" : ""}`,
      [userId],
    )
    return rows[0]?.id ?? null
  },

  async createCart(ex: Executor, organizationId: number, userId: number) {
    const [result] = await ex.execute<ResultSetHeader>(
      `INSERT INTO cart (organization_id, user_id) VALUES (?, ?)`,
      [organizationId, userId],
    )
    return result.insertId
  },

  async listItems(ex: Executor, cartId: number) {
    const [rows] = await ex.execute<Row<CartItem>[]>(
      `SELECT ${CART_ITEM_COLUMNS} FROM cart_items WHERE cart_id = ? ORDER BY id`,
      [cartId],
    )
    return rows
  },

  async findCatalogItem(ex: Executor, type: CartItemType, id: number) {
    const [rows] = await ex.execute<Row<CatalogItem>[]>(CATALOG_SQL[type], [id])
    return rows[0] ?? null
  },

  async upsertItem(ex: Executor, cartId: number, line: CatalogItem) {
    await ex.execute(
      `
      INSERT INTO cart_items (
        cart_id, item_type, plan_id, bundle_id, item_name, item_code, license_type,
        quantity, unit_price, gst_percentage, gst_amount, line_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        item_name = VALUES(item_name), item_code = VALUES(item_code),
        license_type = VALUES(license_type), quantity = VALUES(quantity),
        unit_price = VALUES(unit_price), gst_percentage = VALUES(gst_percentage),
        gst_amount = VALUES(gst_amount), line_total = VALUES(line_total)
      `,
      [
        cartId, line.item_type, line.plan_id, line.bundle_id, line.item_name, line.item_code,
        line.license_type, line.quantity, line.unit_price, line.gst_percentage, line.gst_amount, line.line_total,
      ],
    )
  },

  async deleteItems(ex: Executor, cartId: number, ids: number[]) {
    if (ids.length === 0) return
    await ex.query(`DELETE FROM cart_items WHERE cart_id = ? AND id IN (?)`, [cartId, ids])
  },

  async touchCart(ex: Executor, cartId: number) {
    await ex.execute(`UPDATE cart SET reminder_sent_at = NULL, updated_at = NOW() WHERE id = ?`, [cartId])
  },

  async discardCart(ex: Executor, userId: number) {
    await ex.execute(`UPDATE cart SET cart_status = 'abandoned' WHERE user_id = ? AND cart_status = 'active'`, [userId])
  },

  async listCartsToRemind(ex: Executor) {
    const [rows] = await ex.execute<Row<{ id: number; user_name: string; user_email: string }>[]>(
      `
      SELECT c.id, u.user_name, u.user_email
      FROM cart c
      JOIN users u ON u.id = c.user_id
      WHERE c.cart_status = 'active'
        AND c.reminder_sent_at IS NULL
        AND c.updated_at <= NOW() - INTERVAL 10 MINUTE
        AND u.deleted_at IS NULL
        AND u.user_email IS NOT NULL AND u.user_email <> ''
        AND EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id)
      `,
    )
    return rows
  },

  async markReminded(ex: Executor, cartId: number) {
    const [result] = await ex.execute<ResultSetHeader>(
      `UPDATE cart SET reminder_sent_at = NOW(), updated_at = updated_at WHERE id = ? AND reminder_sent_at IS NULL`,
      [cartId],
    )
    return result.affectedRows > 0
  },

  async markOrdered(ex: Executor, cartId: number, orderId: number) {
    await ex.execute(
      `UPDATE cart SET cart_status = 'ordered', order_id = ?, ordered_at = NOW() WHERE id = ?`,
      [orderId, cartId],
    )
  },

  async findBilling(ex: Executor, organizationId: number) {
    const [rows] = await ex.execute<Row<OrgBilling>[]>(
      `
      SELECT
        org_name, COALESCE(NULLIF(org_legal_name, ''), org_name) AS billing_name, org_gst_number,
        org_email, org_phone, org_address_line1, org_address_line2,
        org_city, org_state, org_country, org_pincode
      FROM organizations
      WHERE id = ? AND deleted_at IS NULL
      `,
      [organizationId],
    )
    return rows[0] ?? null
  },

  async findUserName(ex: Executor, userId: number) {
    const [rows] = await ex.execute<Row<{ user_name: string }>[]>(
      `SELECT user_name FROM users WHERE id = ?`,
      [userId],
    )
    return rows[0]?.user_name ?? ""
  },

  async createOrder(ex: Executor, data: CreateOrderInput) {
    const { billing } = data
    const [result] = await ex.execute<ResultSetHeader>(
      `
      INSERT INTO orders (
        organization_id, organization_name, placed_by_name, order_number,
        order_status, payment_status, payment_method,
        manual_payment_mode, manual_payment_reference, manual_payment_date, manual_payment_recorded_by_name,
        subtotal, total_gst_amount, grand_total, currency,
        billing_name, billing_gst_number, billing_email, billing_phone,
        billing_address_line1, billing_address_line2, billing_city, billing_state, billing_country, billing_pincode,
        note
      )
      VALUES (?, ?, ?, ?, 'placed', 'pending', 'manual', ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.organization_id, billing.org_name, data.placed_by_name, data.order_number,
        data.payment_mode, data.transaction_number, data.payment_date, data.placed_by_name,
        data.subtotal, data.total_gst_amount, data.grand_total,
        billing.billing_name, billing.org_gst_number, billing.org_email, billing.org_phone,
        billing.org_address_line1, billing.org_address_line2, billing.org_city, billing.org_state,
        billing.org_country, billing.org_pincode,
        data.remarks || null,
      ],
    )
    return result.insertId
  },

  async createOrderItem(ex: Executor, { order_id, line, start_date, end_date }: CreateOrderItemInput) {
    await ex.execute(
      `
      INSERT INTO order_items (
        order_id, item_type, plan_id, bundle_id, item_name, item_code, module_data, license_type,
        quantity, start_date, end_date, unit_price, gst_percentage, gst_amount, line_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        order_id, line.item_type, line.plan_id, line.bundle_id, line.item_name, line.item_code, line.snapshot,
        line.license_type, line.quantity, start_date, end_date,
        line.unit_price, line.gst_percentage, line.gst_amount, line.line_total,
      ],
    )
  },

  async listUpcoming(ex: Executor, organizationId: number) {
    const [rows] = await ex.execute<Row<UpcomingPlan>[]>(
      `
      SELECT
        oi.id, o.order_number, o.order_status, o.payment_status,
        DATE_FORMAT(o.placed_at, '%Y-%m-%d') AS placed_on,
        oi.item_type, oi.plan_id, oi.bundle_id, oi.item_name, oi.license_type,
        DATE_FORMAT(oi.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(oi.end_date, '%Y-%m-%d') AS end_date,
        oi.line_total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN org_subscriptions os ON os.id = oi.org_subscription_id
      WHERE o.organization_id = ?
        AND o.order_status <> 'cancelled'
        AND o.payment_status <> 'failed'
        AND oi.item_type <> 'amc'
        AND (oi.end_date IS NULL OR oi.end_date >= CURDATE())
        AND (oi.org_subscription_id IS NULL OR os.start_date > CURDATE())
      ORDER BY oi.start_date, oi.id
      `,
      [organizationId],
    )
    return rows
  },

  async listActiveSubscriptions(ex: Executor, organizationId: number) {
    const [rows] = await ex.execute<Row<ActiveSubscription>[]>(
      `
      SELECT
        os.id, os.subscription_type, os.plan_id, os.bundle_id, os.license_type,
        DATE_FORMAT(os.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(os.expiry_date, '%Y-%m-%d') AS expiry_date,
        oi.line_total AS amount_paid
      FROM org_subscriptions os
      LEFT JOIN order_items oi ON oi.org_subscription_id = os.id
      WHERE os.organization_id = ?
        AND os.subscription_status = 'active'
        AND os.start_date <= CURDATE()
        AND (os.expiry_date IS NULL OR os.expiry_date >= CURDATE())
      ORDER BY os.start_date DESC, os.id DESC
      `,
      [organizationId],
    )
    return rows
  },
}

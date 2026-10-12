import type { PoolConnection } from "mysql2/promise"

import db from "../../../config/database"
import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { cartRepository } from "../repositories/cartRepository"
import type { AddCartItemInput, CartItem, CartItemType, CatalogItem, CheckoutInput, PlacedOrder } from "../cartTypes"

interface CartUser {
  id: number
  organization_id: number
}

const round = (value: number) => Math.round(value * 100) / 100

const nullableNumber = (value: unknown) => (value === null ? null : Number(value))

const toCartItem = (row: CartItem): CartItem => ({
  ...row,
  quantity: nullableNumber(row.quantity),
  unit_price: Number(row.unit_price),
  gst_percentage: Number(row.gst_percentage),
  gst_amount: Number(row.gst_amount),
  line_total: Number(row.line_total),
})

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

const addMonths = (date: string, months: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCMonth(value.getUTCMonth() + Math.round(months))
  return value.toISOString().slice(0, 10)
}

const loadCatalogItem = async (conn: PoolConnection, type: CartItemType, id: number): Promise<CatalogItem | null> => {
  const row = await cartRepository.findCatalogItem(conn, type, id)
  if (!row) return null
  const unitPrice = Number(row.unit_price)
  const lineTotal = Number(row.line_total)
  return {
    ...row,
    duration_months: nullableNumber(row.duration_months),
    quantity: nullableNumber(row.quantity),
    unit_price: unitPrice,
    gst_percentage: Number(row.gst_percentage),
    gst_amount: round(lineTotal - unitPrice),
    line_total: lineTotal,
  }
}

const listItems = async (conn: PoolConnection | typeof db, cartId: number | null) =>
  cartId ? (await cartRepository.listItems(conn, cartId)).map(toCartItem) : []

export const getCart = async (user: CartUser) => listItems(db, await cartRepository.findActiveCartId(db, user.id))

export const addCartItem = (user: CartUser, input: AddCartItemInput) =>
  withTransaction(async (conn) => {
    const type: CartItemType = input.plan_id ? "plan" : "bundle"
    const line = await loadCatalogItem(conn, type, Number(input.plan_id ?? input.bundle_id))
    if (!line) throw new HttpError(404, `This ${type} is not available`)

    const cartId =
      (await cartRepository.findActiveCartId(conn, user.id, true)) ??
      (await cartRepository.createCart(conn, user.organization_id, user.id))

    await cartRepository.deleteItems(conn, cartId, input.replace_ids)
    await cartRepository.upsertItem(conn, cartId, line)
    await cartRepository.touchCart(conn, cartId)
    return listItems(conn, cartId)
  })

export const removeCartItem = (user: CartUser, itemId: number) =>
  withTransaction(async (conn) => {
    const cartId = await cartRepository.findActiveCartId(conn, user.id, true)
    if (cartId) {
      await cartRepository.deleteItems(conn, cartId, [itemId])
      await cartRepository.touchCart(conn, cartId)
    }
    return listItems(conn, cartId)
  })

export const checkout = (user: CartUser, input: CheckoutInput) =>
  withTransaction(async (conn): Promise<PlacedOrder> => {
    const cartId = await cartRepository.findActiveCartId(conn, user.id, true)
    const items = await listItems(conn, cartId)
    if (!cartId || items.length === 0) throw new HttpError(400, "Your cart is empty")

    const lines: CatalogItem[] = []
    for (const item of items) {
      const line = await loadCatalogItem(conn, item.item_type, Number(item.plan_id ?? item.bundle_id))
      if (!line) throw new HttpError(409, `${item.item_name} is no longer available. Remove it from your cart.`)
      await cartRepository.upsertItem(conn, cartId, line)
      lines.push(line)
    }

    const billing = await cartRepository.findBilling(conn, user.organization_id)
    if (!billing) throw new HttpError(404, "Organization not found")

    const subtotal = round(lines.reduce((sum, line) => sum + line.unit_price, 0))
    const grandTotal = round(lines.reduce((sum, line) => sum + line.line_total, 0))
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now()}`

    const orderId = await cartRepository.createOrder(conn, {
      ...input,
      organization_id: user.organization_id,
      order_number: orderNumber,
      placed_by_name: await cartRepository.findUserName(conn, user.id),
      subtotal,
      total_gst_amount: round(grandTotal - subtotal),
      grand_total: grandTotal,
      billing,
    })

    const startDate = addDays(input.payment_date, 1)

    for (const line of lines) {
      await cartRepository.createOrderItem(conn, {
        order_id: orderId,
        line,
        start_date: startDate,
        end_date:
          line.license_type === "subscription" && line.duration_months
            ? addMonths(startDate, line.duration_months)
            : null,
      })
    }

    await cartRepository.markOrdered(conn, cartId, orderId)

    return {
      id: orderId,
      order_number: orderNumber,
      grand_total: grandTotal,
      payment_mode: input.payment_mode,
      transaction_number: input.transaction_number,
      payment_date: input.payment_date,
    }
  })

export const getActiveSubscriptions = async (user: CartUser) =>
  (await cartRepository.listActiveSubscriptions(db, user.organization_id)).map((row) => ({
    ...row,
    amount_paid: nullableNumber(row.amount_paid),
  }))

export const getUpcomingPlans = async (user: CartUser) =>
  (await cartRepository.listUpcoming(db, user.organization_id)).map((row) => ({
    ...row,
    line_total: Number(row.line_total),
  }))

export const discardCart = (user: CartUser) => cartRepository.discardCart(db, user.id)

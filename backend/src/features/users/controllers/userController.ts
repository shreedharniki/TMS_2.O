import type { Request, Response } from "express"
import type { ZodType } from "zod"

import { HttpError } from "../../../utils/httpError"

import { createUserSchema, updateUserStatusSchema } from "../validations/userValidation"
import {
  createUserService,
  deleteUserService,
  getUserLimitService,
  listStatusesService,
  listTemplesService,
  listUsersService,
  updateUserStatusService,
} from "../services/userService"

const organizationId = (req: Request) => Number(req.user?.organization_id)

const userId = (req: Request) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid user ID")
  return id
}

const parse = <T>(schema: ZodType<T>, body: unknown): T => {
  const result = schema.safeParse(body)
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid input")
  return result.data
}

export const getUsers = async (req: Request, res: Response) => {
  res.json({ success: true, data: await listUsersService(organizationId(req)) })
}

export const getUserLimit = async (req: Request, res: Response) => {
  res.json({ success: true, data: await getUserLimitService(organizationId(req)) })
}

export const getUserTemples = async (req: Request, res: Response) => {
  res.json({ success: true, data: await listTemplesService(organizationId(req)) })
}

export const getUserStatuses = async (_req: Request, res: Response) => {
  res.json({ success: true, data: await listStatusesService() })
}

export const postUser = async (req: Request, res: Response) => {
  const data = await createUserService(organizationId(req), parse(createUserSchema, req.body))
  res.status(201).json({ success: true, message: "User created successfully", data })
}

export const patchUserStatus = async (req: Request, res: Response) => {
  const { user_status } = parse(updateUserStatusSchema, req.body)
  await updateUserStatusService(organizationId(req), userId(req), user_status)
  res.json({ success: true, message: "User status updated successfully" })
}

export const removeUser = async (req: Request, res: Response) => {
  await deleteUserService(organizationId(req), userId(req))
  res.json({ success: true, message: "User deleted successfully" })
}

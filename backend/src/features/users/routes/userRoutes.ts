import { Router, type NextFunction, type Request, type Response } from "express"

import { authenticate } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { ORG_ADMIN_ROLE_ID } from "../../../utils/scope"

import {
  getUserLimit,
  getUserStatuses,
  getUserTemples,
  getUsers,
  patchUserStatus,
  postUser,
  removeUser,
} from "../controllers/userController"

const requireOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role_id !== ORG_ADMIN_ROLE_ID || !req.user.organization_id) {
    return res.status(403).json({ success: false, message: "Only organization admins can manage users" })
  }
  next()
}

const router = Router()

router.use(authenticate, requireOrgAdmin)

router.get("/", asyncHandler(getUsers))
router.get("/limit", asyncHandler(getUserLimit))
router.get("/temples", asyncHandler(getUserTemples))
router.get("/statuses", asyncHandler(getUserStatuses))
router.post("/", asyncHandler(postUser))
router.patch("/:id/status", asyncHandler(patchUserStatus))
router.delete("/:id", asyncHandler(removeUser))

export default router

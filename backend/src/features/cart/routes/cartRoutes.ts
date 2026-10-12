import { Router, type NextFunction, type Request, type Response } from "express"

import { authenticate } from "../../../middleware/auth.middleware"
import { asyncHandler } from "../../../utils/asyncHandler"
import { ORG_ADMIN_ROLE_ID } from "../../../utils/scope"
import { validationMiddleware } from "../../submodule/validations/validation"
import {
  addCartItemController,
  checkoutController,
  discardCartController,
  getCartController,
  getSubscriptionsController,
  getUpcomingController,
  removeCartItemController,
} from "../controllers/cartController"
import { addCartItemSchema, checkoutSchema } from "../validations/cartValidation"

const requireOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role_id !== ORG_ADMIN_ROLE_ID) {
    res.status(403).json({ success: false, message: "Only organization admins can purchase plans" })
    return
  }
  next()
}

const router = Router()

router.use(authenticate, requireOrgAdmin)

router.get("/", asyncHandler(getCartController))
router.delete("/", asyncHandler(discardCartController))
router.post("/items", validationMiddleware(addCartItemSchema), asyncHandler(addCartItemController))
router.delete("/items/:id", asyncHandler(removeCartItemController))
router.post("/checkout", validationMiddleware(checkoutSchema), asyncHandler(checkoutController))
router.get("/subscriptions", asyncHandler(getSubscriptionsController))
router.get("/upcoming", asyncHandler(getUpcomingController))

export default router

import { Router } from "express"

import {
  createTempleController,
  deleteTempleController,
  getTempleController,
  getTemplesController,
  updateTempleController,
} from "../controllers/templeController"

import { authenticate } from "../../../middleware/auth.middleware"

const router = Router()

router.use(authenticate)

router.post(
  "/",
  createTempleController,
)

router.get(
  "/",
  getTemplesController,
)

router.get(
  "/:id",
  getTempleController,
)

router.put(
  "/:id",
  updateTempleController,
)

router.delete(
  "/:id",
  deleteTempleController,
)

export default router
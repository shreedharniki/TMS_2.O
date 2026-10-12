
import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";

import {
  createDeityController,
  deleteDeityController,
  getDeitiesController,
  getDeityController,
  updateDeityController,
} from "../controllers/deityController";

const router = Router();

router.use(authenticate);

router.get("/", getDeitiesController);
router.get("/:id", getDeityController);
router.post("/", createDeityController);
router.put("/:id", updateDeityController);
router.delete("/:id", deleteDeityController);

export default router;
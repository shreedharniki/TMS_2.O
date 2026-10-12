import { Router } from "express";

import {
  createPaymentMethodController,
  deletePaymentMethodController,
  getPaymentMethodController,
  getPaymentMethodsController,
  updatePaymentMethodController,
} from "../controllers/paymentMethodController";

import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getPaymentMethodsController
);

router.get(
  "/:id",
  authenticate,
  getPaymentMethodController
);

router.post(
  "/",
  authenticate,
  createPaymentMethodController
);

router.put(
  "/:id",
  authenticate,
  updatePaymentMethodController
);

router.delete(
  "/:id",
  authenticate,
  deletePaymentMethodController
);

export default router;
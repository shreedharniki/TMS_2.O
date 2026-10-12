import { Router } from "express"
import { httpsRedirect } from "../middleware/httpsRedirect.middleware";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from '../features/auth/routes/auth.routes';
// import organizationRoutes from "../features/organizations/routes/organizationRoutes"
import moduleRoutes from "../features/modules/routes/moduleRoutes"
import donationRoutes from "../features/donations/routes/donationRoutes"
import hundiRoutes from "../features/hundi/routes/hundiRoutes"
import defineHundiRoutes from "../features/hundi/routes/defineHundiRoutes"
import hundiBankDepositRoutes from "../features/hundi/routes/hundiBankDepositRoutes"
import inventoryRoutes from "../features/inventory/routes/inventoryRoutes"
import inventoryUsedRoutes from "../features/inventory/routes/inventoryUsedRoutes"

import subModuleRoutes from "../features/submodule/routes/subModuleRoutes"
import subscriptionPlanRoutes from "../features/subscription_plans/routes/subscriptionPlanRoutes";
import subscriptionBundleRoutes from "../features/subscription_bundles/routes/subscriptionBundleRoutes";
import organizationRoutes from "../features/organizations/routes/organizationRoutes"
import systemDefaultsRoutes from "../features/settings/routes/systemDefaultsRoutes"
import roleRoutes from "../features/role/routes/roleRoutes"
import cartRoutes from "../features/cart/routes/cartRoutes"
import templeRoutes from "../features/temple/routes/templeRoutes"
import deityRoutes from "../features/diaties/routes/deityRoutes";

import paymentMethodRoutes from "../features/payment_methods/routes/paymentMethodRoutes";
import userRoutes from "../features/users/routes/userRoutes"
const router = Router()

router.use(httpsRedirect);
router.use(cors({ origin: process.env.CLIENT_URL, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true }));
router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use('/auth', authRoutes);
router.use('/v1', moduleRoutes)
router.use('/v1', donationRoutes)
router.use('/v1', hundiRoutes)
router.use('/v1', defineHundiRoutes)
router.use('/v1', hundiBankDepositRoutes)
router.use('/v1', inventoryRoutes)
router.use('/v1', inventoryUsedRoutes)

router.use("/v1/sub-modules", subModuleRoutes)
router.use(
  "/v1/subscription-plans",
  subscriptionPlanRoutes,
);
router.use(
  "/v1/subscription-bundles",
  subscriptionBundleRoutes,
);

router.use(
  "/v1/organizations",
  organizationRoutes,
)
router.use(
  "/v1/system-defaults",
  systemDefaultsRoutes,
)
router.use(
  "/v1/roles",
  roleRoutes,
)
router.use("/v1/cart", cartRoutes)
router.use(
  "/v1/temples",
  templeRoutes,
)
router.use("/v1/deities", deityRoutes);

router.use(
  "/v1/payment-methods",
  paymentMethodRoutes
);
router.use("/v1/org-users", userRoutes)
export default router

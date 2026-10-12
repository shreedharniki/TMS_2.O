import type {
  Request,
  Response,
} from "express";

import {
  createPaymentMethodService,
  deletePaymentMethodService,
  getPaymentMethodService,
  getPaymentMethodsService,
  updatePaymentMethodService,
} from "../services/paymentMethodService";

import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../validations/paymentMethodValidation";

import {
  handlePaymentMethodError,
} from "../validations/paymentMethodErrors";

const getOrganizationId = (
  req: Request
): number => {
  const organizationId =
    req.user?.organization_id;

  if (!organizationId) {
    throw new Error(
      "Organization ID not found"
    );
  }

  return organizationId;
};

const getId = (
  req: Request
): number => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Invalid payment method ID"
    );
  }

  return id;
};

export const createPaymentMethodController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const organizationId =
        getOrganizationId(req);

      const parsed =
        createPaymentMethodSchema.safeParse(
          req.body
        );

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Invalid payment method data",
        });
        return;
      }

      const paymentMethod =
        await createPaymentMethodService({
          ...parsed.data,
          organization_id:
            organizationId,
        });

      res.status(201).json({
        success: true,
        message:
          "Payment method created successfully",
        data: paymentMethod,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Organization ID not found"
      ) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const handled =
        handlePaymentMethodError(error);

      res.status(handled.statusCode).json({
        success: false,
        message: handled.message,
      });
    }
  };

export const getPaymentMethodsController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const organizationId =
        getOrganizationId(req);

      const paymentMethods =
        await getPaymentMethodsService(
          organizationId
        );

      res.status(200).json({
        success: true,
        message:
          "Payment methods fetched successfully",
        data: paymentMethods,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Organization ID not found"
      ) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const handled =
        handlePaymentMethodError(error);

      res.status(handled.statusCode).json({
        success: false,
        message: handled.message,
      });
    }
  };

export const getPaymentMethodController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const organizationId =
        getOrganizationId(req);

      const id = getId(req);

      const paymentMethod =
        await getPaymentMethodService(
          id,
          organizationId
        );

      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          message:
            "Payment method not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Payment method fetched successfully",
        data: paymentMethod,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Organization ID not found" ||
          error.message ===
            "Invalid payment method ID"
        )
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const handled =
        handlePaymentMethodError(error);

      res.status(handled.statusCode).json({
        success: false,
        message: handled.message,
      });
    }
  };

export const updatePaymentMethodController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const organizationId =
        getOrganizationId(req);

      const id = getId(req);

      const parsed =
        updatePaymentMethodSchema.safeParse(
          req.body
        );

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Invalid payment method data",
        });
        return;
      }

      const paymentMethod =
        await updatePaymentMethodService(
          id,
          organizationId,
          parsed.data
        );

      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          message:
            "Payment method not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Payment method updated successfully",
        data: paymentMethod,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Organization ID not found" ||
          error.message ===
            "Invalid payment method ID"
        )
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const handled =
        handlePaymentMethodError(error);

      res.status(handled.statusCode).json({
        success: false,
        message: handled.message,
      });
    }
  };

export const deletePaymentMethodController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const organizationId =
        getOrganizationId(req);

      const id = getId(req);

      const deleted =
        await deletePaymentMethodService(
          id,
          organizationId
        );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message:
            "Payment method not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Payment method deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Organization ID not found" ||
          error.message ===
            "Invalid payment method ID"
        )
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const handled =
        handlePaymentMethodError(error);

      res.status(handled.statusCode).json({
        success: false,
        message: handled.message,
      });
    }
  };
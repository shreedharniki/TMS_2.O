
import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";

import {
  createDeityService,
  deleteDeityService,
  getDeitiesService,
  getDeityService,
  updateDeityService,
} from "../services/deityService";

import {
  createDeitySchema,
  updateDeitySchema,
} from "../validations/deityValidation";

import { handleDeityError } from "../validations/deityErrors";

function getOrganizationId(req: Request): number {
  const organizationId = req.user?.organization_id;

  if (
    typeof organizationId !== "number" ||
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new Error("Organization ID not found");
  }

  return organizationId;
}

function getId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid deity ID");
  }

  return id;
}

function sendControllerError(
  res: Response,
  error: unknown,
  action: string
) {
  console.error(`${action} deity error:`, error);

  if (
    error instanceof Error &&
    error.message === "Organization ID not found"
  ) {
    return res.status(401).json({
      success: false,
      message: "Organization ID not found",
    });
  }

  if (
    error instanceof Error &&
    error.message === "Invalid deity ID"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid deity ID",
    });
  }

  const { statusCode, message } = handleDeityError(error);

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

/**
 * POST /api/v1/deities
 */
export const createDeityController = async (
  req: Request,
  res: Response
) => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const parsed = createDeitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const deity = await createDeityService(connection, {
      ...parsed.data,
      organization_id: organizationId,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Deity created successfully",
      data: deity,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendControllerError(res, error, "Create");
  } finally {
    connection?.release();
  }
};

/**
 * GET /api/v1/deities
 */
export const getDeitiesController = async (
  req: Request,
  res: Response
) => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    connection = await pool.getConnection();

    const deities = await getDeitiesService(
      connection,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Deities fetched successfully",
      data: deities,
    });
  } catch (error) {
    return sendControllerError(res, error, "Get all");
  } finally {
    connection?.release();
  }
};

/**
 * GET /api/v1/deities/:id
 */
export const getDeityController = async (
  req: Request,
  res: Response
) => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const deity = await getDeityService(
      connection,
      id,
      organizationId
    );

    if (!deity) {
      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deity fetched successfully",
      data: deity,
    });
  } catch (error) {
    return sendControllerError(res, error, "Get by ID");
  } finally {
    connection?.release();
  }
};

/**
 * PUT /api/v1/deities/:id
 */
export const updateDeityController = async (
  req: Request,
  res: Response
) => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);
    const parsed = updateDeitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const deity = await updateDeityService(
      connection,
      id,
      organizationId,
      parsed.data
    );

    if (!deity) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Deity updated successfully",
      data: deity,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendControllerError(res, error, "Update");
  } finally {
    connection?.release();
  }
};

/**
 * DELETE /api/v1/deities/:id
 * Performs a soft delete.
 */
export const deleteDeityController = async (
  req: Request,
  res: Response
) => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const deleted = await deleteDeityService(
      connection,
      id,
      organizationId
    );

    if (!deleted) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Deity deleted successfully",
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendControllerError(res, error, "Delete");
  } finally {
    connection?.release();
  }
};
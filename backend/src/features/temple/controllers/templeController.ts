

import type { Request, Response } from "express"

import pool from "../../../config/database"

import { handleTempleError } from "../validations/templeErrors"

import {
  createTempleService,
  deleteTempleService,
  getTempleService,
  getTemplesService,
  updateTempleService,
} from "../services/templeService"

import {
  createTempleSchema,
  updateTempleSchema,
} from "../validations/templeValidation"


/* =========================================================
   GET ORGANIZATION ID
========================================================= */

function getOrganizationId(req: Request): number {
  const organizationId = req.user?.organization_id

  if (!organizationId) {
    throw new Error("Organization ID not found")
  }

  const id = Number(organizationId)

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid organization ID")
  }

  return id
}


/* =========================================================
   GET TEMPLE ID
========================================================= */

function getId(req: Request): number {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid temple ID")
  }

  return id
}


/* =========================================================
   CREATE TEMPLE
========================================================= */

export async function createTempleController(
  req: Request,
  res: Response,
) {
  const connection = await pool.getConnection()

  try {
    /* ---------------------------------------------
       Organization
    --------------------------------------------- */

    const organizationId = getOrganizationId(req)


    /* ---------------------------------------------
       Validation
    --------------------------------------------- */

    const validation =
      createTempleSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      })
    }


    /* ---------------------------------------------
       Transaction
    --------------------------------------------- */

    await connection.beginTransaction()


    /* ---------------------------------------------
       Create
    --------------------------------------------- */

    const temple =
      await createTempleService(
        connection,
        organizationId,
        validation.data,
      )


    /* ---------------------------------------------
       Commit
    --------------------------------------------- */

    await connection.commit()


    return res.status(201).json({
      success: true,
      message: "Temple created successfully",
      data: temple,
    })
  } catch (error) {

    /* ---------------------------------------------
       Rollback only if transaction was started
    --------------------------------------------- */

    try {
      await connection.rollback()
    } catch {
      // Ignore rollback errors
    }


    console.error(
      "Create temple error:",
      error,
    )


    return handleTempleError(error, res)
  } finally {
    connection.release()
  }
}


/* =========================================================
   GET ALL TEMPLES
========================================================= */

export async function getTemplesController(
  req: Request,
  res: Response,
) {
  const connection = await pool.getConnection()

  try {

    /* ---------------------------------------------
       Organization
    --------------------------------------------- */

    const organizationId =
      getOrganizationId(req)


    /* ---------------------------------------------
       Fetch temples
    --------------------------------------------- */

    const temples =
      await getTemplesService(
        connection,
        organizationId,
      )


    return res.status(200).json({
      success: true,
      message: "Temples fetched successfully",
      data: temples,
    })
  } catch (error) {

    console.error(
      "Get temples error:",
      error,
    )


    return handleTempleError(error, res)
  } finally {
    connection.release()
  }
}


/* =========================================================
   GET SINGLE TEMPLE
========================================================= */

export async function getTempleController(
  req: Request,
  res: Response,
) {
  const connection = await pool.getConnection()

  try {

    /* ---------------------------------------------
       Organization
    --------------------------------------------- */

    const organizationId =
      getOrganizationId(req)


    /* ---------------------------------------------
       Temple ID
    --------------------------------------------- */

    const id =
      getId(req)


    /* ---------------------------------------------
       Fetch temple
    --------------------------------------------- */

    const temple =
      await getTempleService(
        connection,
        organizationId,
        id,
      )


    if (!temple) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      })
    }


    return res.status(200).json({
      success: true,
      message: "Temple fetched successfully",
      data: temple,
    })
  } catch (error) {

    console.error(
      "Get temple error:",
      error,
    )


    return handleTempleError(error, res)
  } finally {
    connection.release()
  }
}


/* =========================================================
   UPDATE TEMPLE
========================================================= */

export async function updateTempleController(
  req: Request,
  res: Response,
) {
  const connection = await pool.getConnection()

  try {

    /* ---------------------------------------------
       Organization
    --------------------------------------------- */

    const organizationId =
      getOrganizationId(req)


    /* ---------------------------------------------
       Temple ID
    --------------------------------------------- */

    const id =
      getId(req)


    /* ---------------------------------------------
       Validation
    --------------------------------------------- */

    const validation =
      updateTempleSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      })
    }


    /* ---------------------------------------------
       Transaction
    --------------------------------------------- */

    await connection.beginTransaction()


    /* ---------------------------------------------
       Update
    --------------------------------------------- */

    const temple =
      await updateTempleService(
        connection,
        organizationId,
        id,
        validation.data,
      )


    /* ---------------------------------------------
       Not found
    --------------------------------------------- */

    if (!temple) {

      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      })
    }


    /* ---------------------------------------------
       Commit
    --------------------------------------------- */

    await connection.commit()


    return res.status(200).json({
      success: true,
      message: "Temple updated successfully",
      data: temple,
    })
  } catch (error) {

    try {
      await connection.rollback()
    } catch {
      // Ignore rollback errors
    }


    console.error(
      "Update temple error:",
      error,
    )


    return handleTempleError(error, res)
  } finally {
    connection.release()
  }
}


/* =========================================================
   DELETE TEMPLE
========================================================= */

export async function deleteTempleController(
  req: Request,
  res: Response,
) {
  const connection = await pool.getConnection()

  try {

    /* ---------------------------------------------
       Organization
    --------------------------------------------- */

    const organizationId =
      getOrganizationId(req)


    /* ---------------------------------------------
       Temple ID
    --------------------------------------------- */

    const id =
      getId(req)


    /* ---------------------------------------------
       Transaction
    --------------------------------------------- */

    await connection.beginTransaction()


    /* ---------------------------------------------
       Delete
    --------------------------------------------- */

    const deleted =
      await deleteTempleService(
        connection,
        organizationId,
        id,
      )


    /* ---------------------------------------------
       Not found
    --------------------------------------------- */

    if (!deleted) {

      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      })
    }


    /* ---------------------------------------------
       Commit
    --------------------------------------------- */

    await connection.commit()


    return res.status(200).json({
      success: true,
      message: "Temple deleted successfully",
    })
  } catch (error) {

    try {
      await connection.rollback()
    } catch {
      // Ignore rollback errors
    }


    console.error(
      "Delete temple error:",
      error,
    )


    return handleTempleError(error, res)
  } finally {
    connection.release()
  }
}


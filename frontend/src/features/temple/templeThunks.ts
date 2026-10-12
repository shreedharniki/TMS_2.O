



import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

import { templeService } from "./services/templeService"

import type {
  Temple,
  TempleFormData,
} from "./templeTypes"

/**
 * Get a readable error message from Axios or normal errors.
 */
function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message

    if (typeof message === "string") {
      return message
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

/**
 * Fetch all temples
 */
export const fetchTemples = createAsyncThunk<
  Temple[],
  void,
  { rejectValue: string }
>(
  "temples/fetchTemples",
  async (_, { rejectWithValue }) => {
    try {
      return await templeService.getTemples()
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch temples",
        ),
      )
    }
  },
)

/**
 * Fetch single temple
 */
export const fetchTemple = createAsyncThunk<
  Temple,
  number,
  { rejectValue: string }
>(
  "temples/fetchTemple",
  async (id, { rejectWithValue }) => {
    try {
      return await templeService.getTemple(id)
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch temple",
        ),
      )
    }
  },
)

/**
 * Create temple
 */
export const createTemple = createAsyncThunk<
  Temple,
  TempleFormData,
  { rejectValue: string }
>(
  "temples/createTemple",
  async (
    payload,
    { rejectWithValue },
  ) => {
    try {
      return await templeService.createTemple(
        payload,
      )
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create temple",
        ),
      )
    }
  },
)

/**
 * Update temple
 */
// export const updateTemple = createAsyncThunk<
//   Temple,
//   {
//     id: number
//     data: Partial<TempleFormData>
//   },
//   { rejectValue: string }
// >(
//   "temples/updateTemple",
//   async (
//     { id, data },
//     { rejectWithValue },
//   ) => {
//     try {
//       return await templeService.updateTemple(
//         id,
//         data,
//       )
//     } catch (error: unknown) {
//       return rejectWithValue(
//         getErrorMessage(
//           error,
//           "Failed to update temple",
//         ),
//       )
//     }
//   },
// )
export const updateTemple = createAsyncThunk<
  Temple,
  {
    id: number
    data: Partial<TempleFormData>
  },
  {
    rejectValue: string
  }
>(
  "temples/updateTemple",
  async (
    { id, data },
    { rejectWithValue },
  ) => {
    try {
      console.log(
        "THUNK UPDATE:",
        id,
        data,
      )

      const temple =
        await templeService.updateTemple(
          id,
          data,
        )

      console.log(
        "THUNK UPDATE RESPONSE:",
        temple,
      )

      return temple
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update temple",
        ),
      )
    }
  },
)
/**
 * Delete temple
 */
export const deleteTemple = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "temples/deleteTemple",
  async (
    id,
    { rejectWithValue },
  ) => {
    try {
      await templeService.deleteTemple(id)

      return id
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete temple",
        ),
      )
    }
  },
)
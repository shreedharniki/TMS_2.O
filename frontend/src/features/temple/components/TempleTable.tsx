
"use client"

import { useEffect, useState } from "react"

import {
  List,
  LayoutGrid,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react"

import { NavLink } from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import type { AppDispatch } from "@/app/store"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Button } from "@/components/ui/button"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
  selectTempleDeleting,
} from "../templeSelectors"

import {
  fetchTemples,
  deleteTemple,
} from "../templeThunks"

import type { Temple } from "../templeTypes"

const PAGE_SIZE = 10

export default function TempleTable() {
  const dispatch = useDispatch<AppDispatch>()

  /* ================================================================
     REDUX DATA
     ================================================================ */

  const temples =
    useSelector(selectTemples) ?? []

  const loading = useSelector(
    selectTempleLoading,
  )

  const error = useSelector(
    selectTempleError,
  )

  const deleting = useSelector(
    selectTempleDeleting,
  )

  /* ================================================================
     LOCAL STATE
     ================================================================ */

  const [currentPage, setCurrentPage] =
    useState(1)

  const [view, setView] = useState<
    "list" | "grid"
  >("list")

  /* ================================================================
     DATA
     ================================================================ */

  const total = temples.length

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  )

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  )

  const paginatedTemples =
    temples.slice(
      (safeCurrentPage - 1) * PAGE_SIZE,
      safeCurrentPage * PAGE_SIZE,
    )

  /* ================================================================
     FETCH TEMPLES
     ================================================================ */

  useEffect(() => {
    void dispatch(fetchTemples())
  }, [dispatch])

  /* ================================================================
     PAGINATION
     ================================================================ */

  const handlePageChange = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return
    }

    setCurrentPage(page)
  }

  /* ================================================================
     DELETE TEMPLE
     ================================================================ */

  const handleDelete = async (
    id: number,
  ) => {
    const result = await dispatch(
      deleteTemple(id),
    )

    if (
      deleteTemple.rejected.match(
        result,
      )
    ) {
      console.error(result.payload)
      return
    }

    void dispatch(fetchTemples())
  }

  /* ================================================================
     LOADING
     ================================================================ */

  if (
    loading &&
    temples.length === 0
  ) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading temples...
        </p>
      </div>
    )
  }

  /* ================================================================
     ERROR
     ================================================================ */

  if (
    error &&
    temples.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          {error}
        </p>

        <Button
          className="mt-4 cursor-pointer"
          onClick={() => {
            void dispatch(
              fetchTemples(),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ================================================================
     DISPLAY RANGE
     ================================================================ */

  const firstItem =
    total === 0
      ? 0
      : (safeCurrentPage - 1) *
      PAGE_SIZE +
      1

  const lastItem = Math.min(
    safeCurrentPage * PAGE_SIZE,
    total,
  )

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="w-full space-y-4">

      {/* ============================================================
          HEADER
          ============================================================ */}

      <div className="flex items-center justify-between">

        <div>
          <NavLink to="/temples/add">
            <Button className="cursor-pointer">
              Add Temple
            </Button>
          </NavLink>
        </div>

        {/* LIST / GRID TOGGLE */}

        <div className="flex items-center gap-1 rounded-md border p-1">

          <Button
            className="cursor-pointer"
            type="button"
            variant={
              view === "list"
                ? "default"
                : "ghost"
            }
            size="icon"
            onClick={() =>
              setView("list")
            }
            title="List View"
          >
            <List className="size-4" />
          </Button>

          <Button
            className="cursor-pointer"
            type="button"
            variant={
              view === "grid"
                ? "default"
                : "ghost"
            }
            size="icon"
            onClick={() =>
              setView("grid")
            }
            title="Grid View"
          >
            <LayoutGrid className="size-4" />
          </Button>

        </div>
      </div>

      {/* ============================================================
          LIST VIEW
          ============================================================ */}

      {view === "list" && (
        <div className="overflow-hidden rounded-md border">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Sl.no
                </TableHead>

                <TableHead>
                  Temple
                </TableHead>

                <TableHead>
                  Legal Name
                </TableHead>

                <TableHead>
                  Registration No.
                </TableHead>

                <TableHead>
                  Location
                </TableHead>

                <TableHead>
                  Phone
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Primary
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {paginatedTemples.length ===
                0 ? (
                <TableRow>

                  <TableCell
                    colSpan={9}
                    className="h-24 text-center"
                  >
                    No temples found.
                  </TableCell>

                </TableRow>
              ) : (
                paginatedTemples.map(
                  (
                    temple: Temple,
                    index,
                  ) => (
                    <TableRow
                      key={temple.id}
                    >

                      {/* Sl No */}

                      <TableCell>
                        {(safeCurrentPage -
                          1) *
                          PAGE_SIZE +
                          index +
                          1}
                      </TableCell>

                      {/* Temple */}

                      <TableCell>
                        <div>

                          <p className="font-medium">
                            {
                              temple.temp_name
                            }
                          </p>

                        </div>
                      </TableCell>

                      {/* Legal Name */}

                      <TableCell>
                        {
                          temple.temp_legal_name ||
                          "-"
                        }
                      </TableCell>

                      {/* Registration */}

                      <TableCell>
                        {
                          temple.temp_registration_number ||
                          "-"
                        }
                      </TableCell>

                      {/* Location */}

                      <TableCell>
                        <div>

                          <p>
                            {
                              temple.temp_city ||
                              "-"
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              temple.temp_state ||
                              "-"
                            }
                          </p>

                        </div>
                      </TableCell>

                      {/* Phone */}

                      <TableCell>
                        {
                          temple.temp_phone ||
                          "-"
                        }
                      </TableCell>

                      {/* Status */}

                      <TableCell>

                        <span
                          className={
                            temple.temp_status ===
                              "active"
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 capitalize"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 capitalize"
                          }
                        >
                          {
                            temple.temp_status
                          }
                        </span>

                      </TableCell>

                      {/* Primary */}

                      <TableCell>
                        {temple.temp_is_primary
                          ? "Yes"
                          : "No"}
                      </TableCell>

                      {/* Actions */}

                      <TableCell>

                        <div className="flex justify-end gap-1">

                          {/* View */}

                          <NavLink
                            to={`/temples/view/${temple.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                              className="cursor-pointer"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </NavLink>

                          {/* Edit */}

                          <NavLink
                            to={`/temples/edit/${temple.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              className="cursor-pointer"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </NavLink>

                          {/* Delete */}

                          <DeleteTempleDialog
                            temple={temple}
                            deleting={
                              deleting
                            }
                            onDelete={
                              handleDelete
                            }
                          />

                        </div>

                      </TableCell>

                    </TableRow>
                  ),
                )
              )}

            </TableBody>

          </Table>

        </div>
      )}

      {/* ============================================================
          GRID VIEW
          ============================================================ */}

      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {paginatedTemples.length ===
            0 ? (
            <div className="col-span-full rounded-md border p-8 text-center">

              <p className="text-sm text-muted-foreground">
                No temples found.
              </p>

            </div>
          ) : (
            paginatedTemples.map(
              (
                temple: Temple,
                index,
              ) => (
                <div
                  key={temple.id}
                  className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >

                  {/* Card Header */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs text-muted-foreground">
                        #
                        {(safeCurrentPage -
                          1) *
                          PAGE_SIZE +
                          index +
                          1}
                      </p>

                      <h3 className="mt-1 truncate font-semibold">
                        {
                          temple.temp_name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          temple.temp_legal_name ||
                          "-"
                        }
                      </p>

                    </div>

                    <span
                      className={
                        temple.temp_status ===
                          "active"
                          ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 capitalize"
                          : "shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 capitalize"
                      }
                    >
                      {
                        temple.temp_status
                      }
                    </span>

                  </div>

                  {/* Main Details */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        City
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          temple.temp_city ||
                          "-"
                        }
                      </p>

                    </div>

                    <div className="rounded-md bg-muted/50 p-3">

                      <p className="text-xs text-muted-foreground">
                        Phone
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          temple.temp_phone ||
                          "-"
                        }
                      </p>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        Registration
                      </span>

                      <span className="font-medium">
                        {
                          temple.temp_registration_number ||
                          "-"
                        }
                      </span>

                    </div>

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        State
                      </span>

                      <span className="font-medium">
                        {
                          temple.temp_state ||
                          "-"
                        }
                      </span>

                    </div>

                    <div className="flex justify-between gap-3">

                      <span className="text-muted-foreground">
                        Primary
                      </span>

                      <span className="font-medium">
                        {temple.temp_is_primary
                          ? "Yes"
                          : "No"}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="mt-5 flex justify-end gap-2 border-t pt-4">

                    {/* View */}

                    <NavLink
                      to={`/temples/view/${temple.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </Button>
                    </NavLink>

                    {/* Edit */}

                    <NavLink
                      to={`/temples/edit/${temple.id}`}
                    >
                      <Button
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                    </NavLink>

                    {/* Delete */}

                    <DeleteTempleDialog
                      temple={temple}
                      deleting={
                        deleting
                      }
                      onDelete={
                        handleDelete
                      }
                      grid
                    />

                  </div>

                </div>
              ),
            )
          )}

        </div>
      )}

      {/* ============================================================
          PAGINATION
          ============================================================ */}

      {total > 0 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {total}{" "}
            temples

          </div>

          <Pagination className="mx-0 w-auto">

            <PaginationContent>

              {/* Previous */}

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      safeCurrentPage >
                      1
                    ) {
                      handlePageChange(
                        safeCurrentPage -
                        1,
                      )
                    }
                  }}
                  className={
                    safeCurrentPage ===
                      1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

              {/* Pages */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => {
                  const page =
                    index + 1

                  return (
                    <PaginationItem
                      key={page}
                    >

                      <PaginationLink
                        href="#"
                        className="cursor-pointer"
                        isActive={
                          safeCurrentPage ===
                          page
                        }
                        onClick={(
                          event,
                        ) => {
                          event.preventDefault()

                          handlePageChange(
                            page,
                          )
                        }}
                      >
                        {page}
                      </PaginationLink>

                    </PaginationItem>
                  )
                },
              )}

              {/* Next */}

              <PaginationItem>

                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()

                    if (
                      safeCurrentPage <
                      totalPages
                    ) {
                      handlePageChange(
                        safeCurrentPage +
                        1,
                      )
                    }
                  }}
                  className={
                    safeCurrentPage ===
                      totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

            </PaginationContent>

          </Pagination>

        </div>
      )}

    </div>
  )
}

/* ================================================================
   DELETE DIALOG
   ================================================================ */

function DeleteTempleDialog({
  temple,
  deleting,
  onDelete,
  grid = false,
}: {
  temple: Temple
  deleting: boolean
  onDelete: (id: number) => void
  grid?: boolean
}) {
  return (
    <AlertDialog>

      <AlertDialogTrigger
        render={
          <Button
            variant={
              grid
                ? "ghost"
                : "ghost"
            }
            size={
              grid
                ? "icon"
                : "icon"
            }
            title="Delete"
            className="cursor-pointer"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
      />

      <AlertDialogContent size="sm">

        <AlertDialogHeader>

          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Trash2 className="size-5" />
          </AlertDialogMedia>

          <AlertDialogTitle>
            Delete Temple?
          </AlertDialogTitle>

          <AlertDialogDescription>

            Are you sure you want to
            delete{" "}

            <span className="font-semibold text-foreground">
              {temple.temp_name}
            </span>

            ? This action cannot be
            undone.

          </AlertDialogDescription>

        </AlertDialogHeader>

        <AlertDialogFooter>

          <AlertDialogCancel
            variant="outline"
            className="cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            disabled={deleting}
            onClick={() =>
              void onDelete(
                temple.id,
              )
            }
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </AlertDialogAction>

        </AlertDialogFooter>

      </AlertDialogContent>

    </AlertDialog>
  )
}


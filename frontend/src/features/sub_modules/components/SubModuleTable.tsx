







"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react"

import {
  NavLink,
} from "react-router-dom"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import type {
  AppDispatch,
} from "@/app/store"

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
  Button,
} from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  selectSubModules,
  selectSubModulesError,
  selectSubModulesLoading,
  selectSubModulesPagination,
} from "../submoduleSelectors"

import {
  fetchSubModules,
  removeSubModule,
} from "../submoduleThunks"

import type {
  SubModulePermission,
} from "../submoduleTypes"

/* ========================================================================== */
/* ROLES                                                                      */
/* ========================================================================== */

import {
  fetchRoles,
} from "../../roles/roleThunks"

import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../../roles/roleSelectors"

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const PAGE_SIZE = 10

/* ========================================================================== */
/* PERMISSION HELPER                                                          */
/* ========================================================================== */

const getPermission = (
  permissions: SubModulePermission[] | undefined,
  roleId: number,
): number => {
  return (
    permissions?.find(
      (permission) =>
        Number(permission.role_id) ===
        Number(roleId),
    )?.permission ?? 0
  )
}

/* ========================================================================== */
/* PERMISSION LABEL                                                           */
/* ========================================================================== */

const getPermissionLabel = (
  permission: number,
): string => {
  const labels: Record<number, string> = {
    0: "Read",
    1: "Read + Delete",
    2: "Read + Edit",
    3: "Read + Edit + Delete",
    4: "Read + Add",
    5: "Read + Add + Delete",
    6: "Read + Add + Edit",
    7: "Full Access",
  }

  return (
    labels[permission] ??
    "No Access"
  )
}

/* ========================================================================== */
/* PERMISSION BADGE                                                           */
/* ========================================================================== */

function PermissionBadge({
  permission,
}: {
  permission: number
}) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      {getPermissionLabel(permission)}
    </span>
  )
}

/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

function StatusBadge({
  status,
}: {
  status: "active" | "inactive"
}) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
      }
    >
      {status.charAt(0).toUpperCase() +
        status.slice(1)}
    </span>
  )
}

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ModulesTable() {
  const dispatch =
    useDispatch<AppDispatch>()

  /* ======================================================================== */
  /* SUB MODULES                                                              */
  /* ======================================================================== */

  const modules =
    useSelector(selectSubModules)

  const loading =
    useSelector(selectSubModulesLoading)

  const error =
    useSelector(selectSubModulesError)

  const pagination =
    useSelector(
      selectSubModulesPagination,
    )

  /* ======================================================================== */
  /* ROLES                                                                    */
  /* ======================================================================== */

  const roles =
    useSelector(selectRoles)

  const rolesLoading =
    useSelector(selectRolesLoading)

  const rolesError =
    useSelector(selectRolesError)

  /* ======================================================================== */
  /* LOCAL STATE                                                              */
  /* ======================================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [
    view,
    setView,
  ] = useState<
    "list" | "grid"
  >("list")

  /* ======================================================================== */
  /* FETCH SUB MODULES                                                        */
  /* ======================================================================== */

  useEffect(() => {
    void dispatch(
      fetchSubModules({
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    )
  }, [
    dispatch,
    currentPage,
  ])

  /* ======================================================================== */
  /* FETCH ROLES                                                              */
  /* ======================================================================== */

  useEffect(() => {
    void dispatch(fetchRoles())
  }, [dispatch])

  /* ======================================================================== */
  /* PAGE CHANGE                                                              */
  /* ======================================================================== */

  const handlePageChange = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > pagination.totalPages
    ) {
      return
    }

    setCurrentPage(page)
  }

  /* ======================================================================== */
  /* DELETE                                                                   */
  /* ======================================================================== */

  const handleDelete = async (
    id: number,
  ) => {
    const result =
      await dispatch(
        removeSubModule(id),
      )

    if (
      removeSubModule.rejected.match(
        result,
      )
    ) {
      console.error(
        "Delete failed:",
        result.payload,
      )

      return
    }

    /*
     * If the last item of the current page
     * was deleted, move to previous page.
     */

    if (
      modules.length === 1 &&
      currentPage > 1
    ) {
      setCurrentPage(
        (page) => page - 1,
      )

      return
    }

    /*
     * Refresh current page.
     */

    void dispatch(
      fetchSubModules({
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    )
  }

  /* ======================================================================== */
  /* LOADING                                                                  */
  /* ======================================================================== */

  if (
    (loading ||
      rolesLoading) &&
    modules.length === 0
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading sub modules...
        </p>
      </div>
    )
  }

  /* ======================================================================== */
  /* ROLE ERROR                                                               */
  /* ======================================================================== */

  if (
    rolesError &&
    roles.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load roles.
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {rolesError}
        </p>

        <Button
          className="mt-4"
          onClick={() => {
            void dispatch(
              fetchRoles(),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ======================================================================== */
  /* SUB MODULE ERROR                                                         */
  /* ======================================================================== */

  if (
    error &&
    modules.length === 0
  ) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          {error}
        </p>

        <Button
          className="mt-4"
          onClick={() => {
            void dispatch(
              fetchSubModules({
                page: currentPage,
                limit: PAGE_SIZE,
              }),
            )
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  /* ======================================================================== */
  /* PAGINATION INFO                                                          */
  /* ======================================================================== */

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1

  const lastItem =
    Math.min(
      pagination.page *
        pagination.limit,
      pagination.total,
    )

  /* ======================================================================== */
  /* TOTAL TABLE COLUMNS                                                      */
  /* ======================================================================== */

  /*
   * Fixed columns:
   *
   * 1. Sl.no
   * 2. Sub Module Name
   * 3. Code
   * 4. Module ID
   * 5. Status
   * 6. Actions
   *
   * Dynamic columns:
   *
   * roles.length
   */

  const totalColumns =
    6 + roles.length

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <div className="w-full space-y-4">

      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="flex items-center justify-between gap-4">

        {/* ADD BUTTON */}

        <NavLink to="/submodule/add">
          <Button className="cursor-pointer">
            Add Sub Module
          </Button>
        </NavLink>

        {/* LIST / GRID */}

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

      {/* ================================================================== */}
      {/* LIST VIEW                                                          */}
      {/* ================================================================== */}

      {view === "list" && (
        <div className="overflow-x-auto rounded-md border">

          <Table className="min-w-[1200px]">

            {/* ============================================================ */}
            {/* TABLE HEADER                                                  */}
            {/* ============================================================ */}

            <TableHeader>

              <TableRow>

                {/* SL NO */}

                <TableHead>
                  Sl.no
                </TableHead>

                {/* NAME */}

                <TableHead>
                  Sub Module Name
                </TableHead>

                {/* CODE */}

                <TableHead>
                 Sub Module Code
                </TableHead>

                {/* MODULE ID */}

                <TableHead>
                  Module ID
                </TableHead>

                {/* ====================================================== */}
                {/* DYNAMIC ROLE HEADERS                                    */}
                {/* ====================================================== */}

                {roles.map(
                  (role) => (
                    <TableHead
                      key={role.id}
                      className="whitespace-nowrap"
                    >
                      {role.user_role_name}
                    </TableHead>
                  ),
                )}

                {/* STATUS */}

                <TableHead>
                  Status
                </TableHead>

                {/* ACTIONS */}

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>

            {/* ============================================================ */}
            {/* TABLE BODY                                                    */}
            {/* ============================================================ */}

            <TableBody>

              {/* ======================================================== */}
              {/* EMPTY                                                     */}
              {/* ======================================================== */}

              {modules.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={
                      totalColumns
                    }
                    className="h-24 text-center"
                  >
                    No sub modules found.
                  </TableCell>

                </TableRow>

              ) : (

                /* ======================================================== */
                /* MODULES                                                   */
                /* ======================================================== */

                modules.map(
                  (
                    module,
                    index,
                  ) => {

                    return (
                      <TableRow
                        key={
                          module.id
                        }
                      >

                        {/* ================================================= */}
                        {/* SL NO                                             */}
                        {/* ================================================= */}

                        <TableCell>
                          {(pagination.page -
                            1) *
                            pagination.limit +
                            index +
                            1}
                        </TableCell>

                        {/* ================================================= */}
                        {/* NAME                                              */}
                        {/* ================================================= */}

                        <TableCell className="font-medium capitalize">
                          {module.sub_module_name}
                        </TableCell>

                        {/* ================================================= */}
                        {/* CODE                                              */}
                        {/* ================================================= */}

                        <TableCell className="capitalize" >
                          {module.sub_module_code}
                        </TableCell>

                        {/* ================================================= */}
                        {/* MODULE ID                                         */}
                        {/* ================================================= */}

                        <TableCell>
                          {module.module_id}
                        </TableCell>

                        {/* ================================================= */}
                        {/* DYNAMIC ROLE PERMISSIONS                         */}
                        {/* ================================================= */}

                        {roles.map(
                          (role) => {

                            const permission =
                              getPermission(
                                module.permissions,
                                Number(
                                  role.id,
                                ),
                              )

                            return (
                              <TableCell
                                key={
                                  role.id
                                }
                              >
                                <PermissionBadge
                                  permission={
                                    permission
                                  }
                                />
                              </TableCell>
                            )
                          },
                        )}

                        {/* ================================================= */}
                        {/* STATUS                                            */}
                        {/* ================================================= */}

                        <TableCell>
                          <StatusBadge
                            status={
                              module.sub_module_status
                            }
                          />
                        </TableCell>

                        {/* ================================================= */}
                        {/* ACTIONS                                           */}
                        {/* ================================================= */}

                        <TableCell>
                          <div className="flex justify-end gap-1">

                            {/* EDIT */}

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              className="cursor-pointer"
                            >
                              <NavLink
                                to={`/submodule/edit/${module.id}`}
                              >
                                <Pencil className="size-4" />
                              </NavLink>
                            </Button>

                            {/* DELETE */}

                            <AlertDialog>

                              <AlertDialogTrigger
                           
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent
                                size="sm"
                              >

                                <AlertDialogHeader>

                                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

                                    <Trash2 className="size-5" />

                                  </AlertDialogMedia>

                                  <AlertDialogTitle>
                                    Delete Sub Module?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>

                                    Are you sure
                                    you want to
                                    delete{" "}

                                    <span className="font-semibold text-foreground">
                                      {
                                        module.sub_module_name
                                      }
                                    </span>

                                    ? This action
                                    cannot be
                                    undone.

                                  </AlertDialogDescription>

                                </AlertDialogHeader>

                                <AlertDialogFooter>

                                  <AlertDialogCancel
                                    className="cursor-pointer"
                                    variant="outline"
                                  >
                                    Cancel
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    className="cursor-pointer"
                                    variant="destructive"
                                    onClick={() =>
                                      void handleDelete(
                                        module.id,
                                      )
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>

                                </AlertDialogFooter>

                              </AlertDialogContent>

                            </AlertDialog>

                          </div>
                        </TableCell>

                      </TableRow>
                    )
                  },
                )
              )}

            </TableBody>

          </Table>

        </div>
      )}

      {/* ================================================================== */}
      {/* GRID VIEW                                                          */}
      {/* ================================================================== */}

      {view === "grid" && (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {modules.length === 0 ? (

            <div className="col-span-full rounded-md border p-8 text-center">

              <p className="text-sm text-muted-foreground">
                No sub modules found.
              </p>

            </div>

          ) : (

            modules.map(
              (
                module,
                index,
              ) => {

                return (
                  <div
                    key={module.id}
                    className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >

                    {/* ================================================= */}
                    {/* CARD HEADER                                        */}
                    {/* ================================================= */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-xs text-muted-foreground">
                          #
                          {(pagination.page -
                            1) *
                            pagination.limit +
                            index +
                            1}
                        </p>

                        <h3 className="mt-1 truncate font-semibold">
                          {
                            module.sub_module_name
                          }
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            module.sub_module_code
                          }
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          module.sub_module_status
                        }
                      />

                    </div>

                    {/* ================================================= */}
                    {/* DETAILS                                            */}
                    {/* ================================================= */}

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between gap-3">

                        <span className="text-muted-foreground">
                          Module ID
                        </span>

                        <span className="font-medium">
                          {
                            module.module_id
                          }
                        </span>

                      </div>

                      <div className="flex justify-between gap-3">

                        <span className="text-muted-foreground">
                          Display Order
                        </span>

                        <span className="font-medium">
                          {
                            module.display_order
                          }
                        </span>

                      </div>

                      <div className="flex justify-between gap-3">

                        <span className="text-muted-foreground">
                          Note
                        </span>

                        <span className="max-w-[180px] truncate font-medium">
                          {
                            module.note ??
                            "-"
                          }
                        </span>

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* DYNAMIC PERMISSIONS                                */}
                    {/* ================================================= */}

                    <div className="mt-4">

                      <p className="mb-2 text-sm font-medium">
                        Permissions
                      </p>

                      <div className="grid grid-cols-2 gap-2">

                        {roles.map(
                          (role) => {

                            const permission =
                              getPermission(
                                module.permissions,
                                Number(
                                  role.id,
                                ),
                              )

                            return (
                              <div
                                key={
                                  role.id
                                }
                                className="rounded-md bg-muted/50 p-2"
                              >

                                <p className="text-xs text-muted-foreground">
                                  {
                                    role.user_role_name
                                  }
                                </p>

                                <p className="mt-1 text-xs font-medium">
                                  {
                                    getPermissionLabel(
                                      permission,
                                    )
                                  }
                                </p>

                              </div>
                            )
                          },
                        )}

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* ACTIONS                                           */}
                    {/* ================================================= */}

                    <div className="mt-5 flex justify-end gap-2 border-t pt-4">

                      {/* EDIT */}

                      <Button
                        size="sm"
                        className="cursor-pointer"
                       
                      >
                        <NavLink
                          to={`/submodule/edit/${module.id}`}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </NavLink>
                      </Button>

                      {/* DELETE */}

                      <AlertDialog>

                        <AlertDialogTrigger
                      
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="cursor-pointer"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent
                          size="sm"
                        >

                          <AlertDialogHeader>

                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">

                              <Trash2 className="size-5" />

                            </AlertDialogMedia>

                            <AlertDialogTitle>
                              Delete Sub Module?
                            </AlertDialogTitle>

                            <AlertDialogDescription>

                              Are you sure
                              you want to
                              delete{" "}

                              <span className="font-semibold text-foreground">
                                {
                                  module.sub_module_name
                                }
                              </span>

                              ? This action
                              cannot be
                              undone.

                            </AlertDialogDescription>

                          </AlertDialogHeader>

                          <AlertDialogFooter>

                            <AlertDialogCancel
                              className="cursor-pointer"
                              variant="outline"
                            >
                              Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() =>
                                void handleDelete(
                                  module.id,
                                )
                              }
                            >
                              Delete
                            </AlertDialogAction>

                          </AlertDialogFooter>

                        </AlertDialogContent>

                      </AlertDialog>

                    </div>

                  </div>
                )
              },
            )

          )}

        </div>
      )}

      {/* ================================================================== */}
      {/* PAGINATION                                                         */}
      {/* ================================================================== */}

      {pagination.total > 0 && (

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          {/* SHOWING */}

          <div className="text-sm text-muted-foreground">

            Showing{" "}
            {firstItem}{" "}
            to{" "}
            {lastItem}{" "}
            of{" "}
            {pagination.total}{" "}
            sub modules

          </div>

          {/* PAGINATION */}

          <Pagination className="mx-0 w-auto">

            <PaginationContent>

              {/* ======================================================== */}
              {/* PREVIOUS                                                 */}
              {/* ======================================================== */}

              <PaginationItem>

                <PaginationPrevious
                  href="#"
                  onClick={(event) => {

                    event.preventDefault()

                    if (
                      pagination.page >
                      1
                    ) {
                      handlePageChange(
                        pagination.page -
                          1,
                      )
                    }

                  }}
                  className={
                    pagination.page ===
                    1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

              </PaginationItem>

              {/* ======================================================== */}
              {/* PAGE NUMBERS                                              */}
              {/* ======================================================== */}

              {Array.from(
                {
                  length:
                    pagination.totalPages,
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
                        isActive={
                          pagination.page ===
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

              {/* ======================================================== */}
              {/* NEXT                                                      */}
              {/* ======================================================== */}

              <PaginationItem>

                <PaginationNext
                  href="#"
                  onClick={(event) => {

                    event.preventDefault()

                    if (
                      pagination.page <
                      pagination.totalPages
                    ) {
                      handlePageChange(
                        pagination.page +
                          1,
                      )
                    }

                  }}
                  className={
                    pagination.page ===
                    pagination.totalPages
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
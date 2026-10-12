
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { AppDispatch, RootState } from "@/app/store";

import { Button } from "@/components/ui/button";

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
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples } from "../../temple/templeSelectors";

import {
  selectDeities,
  selectDeitiesDeleting,
  selectDeitiesError,
  selectDeitiesLoading,
} from "../deitySelectors";

import { deleteDeity, fetchDeities } from "../deityThunks";



const ITEMS_PER_PAGE = 10;

type ViewMode = "list" | "grid";

function StatusBadge({
  status,
}: {
  status: "active" | "inactive";
}) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
      }
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DefaultBadge({
  value,
}: {
  value: "yes" | "no";
}) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      {value === "yes" ? "Default" : "No"}
    </span>
  );
}

export default function DeitiesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const deities = useSelector((state: RootState) =>
    selectDeities(state),
  );

  const loading = useSelector((state: RootState) =>
    selectDeitiesLoading(state),
  );

  const deleting = useSelector((state: RootState) =>
    selectDeitiesDeleting(state),
  );

  const error = useSelector((state: RootState) =>
    selectDeitiesError(state),
  );

  const temples = useSelector((state: RootState) =>
    selectTemples(state),
  );

  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch deities and temples when the component mounts.
  useEffect(() => {
    void dispatch(fetchDeities());
    void dispatch(fetchTemples());
  }, [dispatch]);

  // const deityList = deities ?? [];
  const deityList = useMemo(
  () => deities ?? [],
  [deities],
);

  // Create a lookup map for temple names.
  const templeNames = useMemo(
    () =>
      new Map(
        (temples ?? []).map((temple) => [
          Number(temple.id),
          temple.temp_name,
        ]),
      ),
    [temples],
  );

  // Pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(deityList.length / ITEMS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedDeities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return deityList.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [deityList, currentPage]);

  // Keep the current page valid if a deity is deleted.
  // useEffect(() => {
  //   if (page > totalPages) {
  //     setPage(totalPages);
  //   }
  // }, [page, totalPages]);

  // Delete deity.
  async function handleDelete(id: number) {
    setDeletingId(id);

    try {
      await dispatch(deleteDeity(id)).unwrap();

      if (
        paginatedDeities.length === 1 &&
        currentPage > 1
      ) {
        setPage(currentPage - 1);
      }
    } catch (deleteError: unknown) {
      console.error("Failed to delete deity:", deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  // Initial loading state.
  if (loading && deityList.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading deities...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Deities
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage deities for your temples.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
          className="cursor-pointer"
            type="button"
            onClick={() => navigate("/deities/add")}
          >
            Add Deity
          </Button>

          {/* List/Grid view toggle */}
          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button

            className="cursor-pointer"
              type="button"
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              title="List View"
              aria-label="List view"
              onClick={() => setView("list")}
            >
              <List className="size-4" />
            </Button>

            <Button
            className="cursor-pointer"
              type="button"
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              title="Grid View"
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1050px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sl.no</TableHead>
                <TableHead>Temple Name</TableHead>
                <TableHead>Deity Name</TableHead>
                <TableHead>Code</TableHead>
                {/* <TableHead>Default</TableHead>
                <TableHead>Display Order</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedDeities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center"
                  >
                    No deities found. Add your first deity.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeities.map((deity, index) => (
                  <TableRow key={deity.id}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE +
                        index +
                        1}
                    </TableCell>

                    <TableCell className="capitalize">
                      {templeNames.get(
                        Number(deity.temple_id),
                      ) ?? `Temple #${deity.temple_id}`}
                    </TableCell>

                    <TableCell className="capitalize">
                      <div className="font-medium">
                        {deity.deity_name}
                      </div>

                      {deity.deity_description && (
                        <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                          {deity.deity_description}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="capitalize">
                      {deity.deity_code}
                    </TableCell>

                    {/* <TableCell>
                      <DefaultBadge
                        value={deity.deity_is_default}
                      />
                    </TableCell> */}

                    {/* <TableCell>
                      {deity.deity_display_order}
                    </TableCell> */}

                    <TableCell>
                      <StatusBadge
                        status={deity.deity_status}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {/* Edit */}
                        <Button
                        className="cursor-pointer"
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Edit deity"
                          aria-label={`Edit ${deity.deity_name}`}
                          onClick={() =>
                            navigate(
                              `/deities/edit/${deity.id}`,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                        {/* Delete confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger >
                            <Button
                            className="cursor-pointer"
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Delete deity"
                              aria-label={`Delete ${deity.deity_name}`}
                              disabled={
                                deletingId === Number(deity.id) ||
                                Boolean(deleting)
                              }
                            >
                              <Trash2 className="size-4 text-destructive cursor-pointer" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                                <Trash2 className="size-5" />
                              </AlertDialogMedia>

                              <AlertDialogTitle>
                                Delete Deity?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-foreground">
                                  {deity.deity_name}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel
                              className="cursor-pointer"
                                variant="outline"
                                disabled={deletingId !== null}
                              >
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                              className="cursor-pointer"
                                variant="destructive"
                                disabled={
                                  deletingId !== null ||
                                  Boolean(deleting)
                                }
                                onClick={() =>
                                  void handleDelete(
                                    Number(deity.id),
                                  )
                                }
                              >
                                {deletingId === Number(deity.id)
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedDeities.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center text-sm text-muted-foreground">
              No deities found. Add your first deity.
            </div>
          ) : (
            paginatedDeities.map((deity, index) => (
              <div
                key={deity.id}
                className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      #
                      {(currentPage - 1) * ITEMS_PER_PAGE +
                        index +
                        1}
                    </p>

                    <h3 className="mt-1 truncate font-semibold">
                      {deity.deity_name}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Code: {deity.deity_code}
                    </p>
                  </div>

                  <StatusBadge
                    status={deity.deity_status}
                  />
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Temple
                    </span>

                    <span className="text-right font-medium">
                      {templeNames.get(
                        Number(deity.temple_id),
                      ) ?? `Temple #${deity.temple_id}`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Default
                    </span>

                    <DefaultBadge
                      value={deity.deity_is_default}
                    />
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Display Order
                    </span>

                    <span className="font-medium">
                      {deity.deity_display_order}
                    </span>
                  </div>

                  {deity.deity_description && (
                    <div>
                      <p className="text-muted-foreground">
                        Description
                      </p>

                      <p className="mt-1 line-clamp-2">
                        {deity.deity_description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                  {/* Edit */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      navigate(`/deities/edit/${deity.id}`)
                    }
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>

                  {/* Delete confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Delete deity"
                        aria-label={`Delete ${deity.deity_name}`}
                        disabled={
                          deletingId === Number(deity.id) ||
                          Boolean(deleting)
                        }
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                          <Trash2 className="size-5" />
                        </AlertDialogMedia>

                        <AlertDialogTitle>
                          Delete Deity?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <span className="font-semibold text-foreground">
                            {deity.deity_name}
                          </span>
                          ? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel
                          variant="outline"
                          disabled={deletingId !== null}
                        >
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          variant="destructive"
                          disabled={
                            deletingId !== null ||
                            Boolean(deleting)
                          }
                          onClick={() =>
                            void handleDelete(Number(deity.id))
                          }
                        >
                          {deletingId === Number(deity.id)
                            ? "Deleting..."
                            : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {deityList.length === 0
            ? "Showing 0 deities"
            : `Showing ${
                (currentPage - 1) * ITEMS_PER_PAGE + 1
              }–${Math.min(
                currentPage * ITEMS_PER_PAGE,
                deityList.length,
              )} of ${deityList.length} deities`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1),
              )
            }
          >
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </Button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(totalPages, current + 1),
              )
            }
          >
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


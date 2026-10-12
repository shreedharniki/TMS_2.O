
"use client"

import { useState } from "react"
import { LayoutGrid, List, Pencil, Trash2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import type { AppDispatch } from "@/app/store"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { PaymentMethod } from "../paymentMethodTypes"
import { deletePaymentMethod } from "../PaymentMethodThunks"

interface PaymentMethodsTableProps {
  items: PaymentMethod[]
  loading: boolean
  onRefresh: () => void
}

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
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function DefaultBadge({
  value,
}: {
  value: "yes" | "no"
}) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      {value === "yes" ? "Default" : "No"}
    </span>
  )
}

export default function PaymentMethodTable({
  items,
  loading,
  onRefresh,
}: PaymentMethodsTableProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [view, setView] = useState<"list" | "grid">("list")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number) {
    setDeletingId(id)

    try {
      await dispatch(deletePaymentMethod(id)).unwrap()
      onRefresh()
    } catch (error) {
      console.error("Failed to delete payment method:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading payment methods...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <Button
          className="cursor-pointer"
          onClick={() => navigate("/payment-method/add")}
        >
          Add Payment Method
        </Button>

        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            type="button"
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            title="List View"
            className="cursor-pointer"
            onClick={() => setView("list")}
          >
            <List className="size-4" />
          </Button>

          <Button
            type="button"
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            title="Grid View"
            className="cursor-pointer"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sl.no</TableHead>
                <TableHead>Temple Name</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Type</TableHead>
                {/* <TableHead>Default</TableHead>
                <TableHead>Display Order</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No payment methods found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    {/* <TableCell>{item.temple_id}</TableCell> */}
                    <TableCell>{item.temple_name}</TableCell>
                    <TableCell className="font-medium">
                      {item.payment_method}
                    </TableCell>

                    <TableCell className="capitalize">
                      {item.payment_method_type}
                    </TableCell>

                    {/* <TableCell>
                      <DefaultBadge value={item.is_default} />
                    </TableCell> */}

                    {/* <TableCell>{item.display_order}</TableCell> */}

                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {/* EDIT */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/payment-method/edit/${item.id}`)
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                        {/* DELETE */}
                        <AlertDialog>
                          <AlertDialogTrigger >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              className="cursor-pointer"
                              disabled={deletingId === item.id}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                                <Trash2 className="size-5" />
                              </AlertDialogMedia>

                              <AlertDialogTitle>
                                Delete Payment Method?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-foreground">
                                  {item.payment_method}
                                </span>
                                ? This action cannot be undone.
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
                                disabled={deletingId === item.id}
                                onClick={() => void handleDelete(item.id)}
                              >
                                {deletingId === item.id
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

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <div className="col-span-full rounded-md border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No payment methods found.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      #{index + 1}
                    </p>

                    <h3 className="mt-1 truncate font-semibold">
                      {item.payment_method}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {item.payment_method_type}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                {/* DETAILS */}
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Temple Name</span>
                    {/* <span className="font-medium">{item.temple_id}</span> */}
                    <span className="font-medium">{item.temple_name}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Default</span>
                    <DefaultBadge value={item.is_default} />
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Display Order
                    </span>
                    <span className="font-medium">
                      {item.display_order}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Remark</span>
                    <span className="max-w-[180px] truncate text-right font-medium">
                      {item.remark || "-"}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/payment-method/edit/${item.id}`)
                    }
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="cursor-pointer"
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                          <Trash2 className="size-5" />
                        </AlertDialogMedia>

                        <AlertDialogTitle>
                          Delete Payment Method?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <span className="font-semibold text-foreground">
                            {item.payment_method}
                          </span>
                          ? This action cannot be undone.
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
                          disabled={deletingId === item.id}
                          onClick={() => void handleDelete(item.id)}
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
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
    </div>
  )
}


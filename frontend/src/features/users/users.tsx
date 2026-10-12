import { List, LayoutGrid, Trash2, ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useUsersList } from "./useUsersList"
import { STATUS_BADGE, capitalize, type UserApiRow } from "./usersTypes"

function StatusSelect({
  user,
  statuses,
  disabled,
  onChange,
}: {
  user: UserApiRow
  statuses: string[]
  disabled: boolean
  onChange: (user: UserApiRow, status: string) => void
}) {
  return (
    <Select value={user.user_status} onValueChange={(value) => onChange(user, String(value))} disabled={disabled}>
      <SelectTrigger size="sm" className={`border-0 ${STATUS_BADGE[user.user_status] ?? ""}`}>
        <SelectValue>{(value: string) => capitalize(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {capitalize(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function Users() {
  const {
    users,
    limit,
    limitReached,
    statuses,
    isLoading,
    currentPage,
    view,
    setView,
    updatingId,
    totalPages,
    startIndex,
    endIndex,
    currentUsers,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleStatusChange,
    handleDelete,
  } = useUsersList()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage temple admins and users
            {limit && ` · ${limit.used} of ${limit.limit} active users`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {limitReached ? (
            <Tooltip>
              <TooltipTrigger render={<span tabIndex={0} className="inline-flex cursor-not-allowed" />}>
                <Button disabled>Add User</Button>
              </TooltipTrigger>
              <TooltipContent>User limit exceeded. Suspend or deactivate a user, or buy more users.</TooltipContent>
            </Tooltip>
          ) : (
            <Button render={<Link to="/org-users/add" />}>Add User</Button>
          )}

          {limit && limitReached && (
            <Button variant="outline" render={<Link to="/pricing" />}>
              <ShoppingCart /> Buy Users
            </Button>
          )}

          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button variant={view === "list" ? "default" : "ghost"} size="icon" onClick={() => setView("list")} title="List View">
              <List className="size-4" />
            </Button>
            <Button variant={view === "grid" ? "default" : "ghost"} size="icon" onClick={() => setView("grid")} title="Grid View">
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No users created yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Users you create for your temples will show up here.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <>
          {view === "list" && (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl.no</TableHead>
                    <TableHead>User Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Temple</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{user.user_code}</TableCell>
                      <TableCell>{user.user_name}</TableCell>
                      <TableCell>{user.temp_name ?? "-"}</TableCell>
                      <TableCell>{user.user_email ?? "-"}</TableCell>
                      <TableCell>{user.user_phone ?? "-"}</TableCell>
                      <TableCell>{user.user_role}</TableCell>
                      <TableCell>
                        <StatusSelect user={user} statuses={statuses} disabled={updatingId === user.id} onChange={handleStatusChange} />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm" title="Delete user" onClick={() => handleDelete(user)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {view === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentUsers.map((user, index) => (
                <div key={user.id} className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">#{startIndex + index + 1}</p>
                      <h3 className="mt-1 truncate font-semibold">{user.user_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{user.user_code}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusSelect user={user} statuses={statuses} disabled={updatingId === user.id} onChange={handleStatusChange} />
                      <Button variant="ghost" size="icon-sm" title="Delete user" onClick={() => handleDelete(user)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Temple</span>
                      <span className="font-medium">{user.temp_name ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium">{user.user_role}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Email</span>
                      <span className="truncate font-medium">{user.user_email ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{user.user_phone ?? "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handlePrevPage()
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === index + 1}
                      onClick={(event) => {
                        event.preventDefault()
                        handlePageChange(index + 1)
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handleNextPage()
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}

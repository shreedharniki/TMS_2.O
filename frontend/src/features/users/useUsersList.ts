import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { PAGE_SIZE, apiMessage, type UserApiRow, type UserLimit } from "./usersTypes"

export function useUsersList() {
  const [users, setUsers] = useState<UserApiRow[]>([])
  const [limit, setLimit] = useState<UserLimit | null>(null)
  const [statuses, setStatuses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState<"list" | "grid">("list")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  function loadLimit() {
    return api.get("/v1/org-users/limit").then((res) => setLimit(res.data?.data ?? null))
  }

  useEffect(() => {
    Promise.all([api.get("/v1/org-users"), api.get("/v1/org-users/statuses"), loadLimit()])
      .then(([usersRes, statusRes]) => {
        setUsers(usersRes.data?.data ?? [])
        setStatuses(statusRes.data?.data ?? [])
      })
      .catch(() => showCmtToast("expiry", "Failed to load users. Please try again."))
      .finally(() => setIsLoading(false))
  }, [])

  const limitReached = !limit || limit.remaining <= 0
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentUsers = users.slice(startIndex, endIndex)

  function handleStatusChange(user: UserApiRow, status: string) {
    if (status === user.user_status) return
    setUpdatingId(user.id)
    api
      .patch(`/v1/org-users/${user.id}/status`, { user_status: status })
      .then(() => {
        setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, user_status: status } : item)))
        showCmtToast("success", "User status updated.")
        return loadLimit()
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to update status.")))
      .finally(() => setUpdatingId(null))
  }

  function handleDelete(user: UserApiRow) {
    if (!window.confirm(`Delete user ${user.user_name}? This cannot be undone.`)) return
    api
      .delete(`/v1/org-users/${user.id}`)
      .then(() => {
        setUsers((prev) => prev.filter((item) => item.id !== user.id))
        showCmtToast("success", "User deleted successfully.")
        return loadLimit()
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to delete the user.")))
  }

  return {
    users,
    limit,
    limitReached,
    statuses,
    isLoading,
    currentPage: safePage,
    view,
    setView,
    updatingId,
    totalPages,
    startIndex,
    endIndex,
    currentUsers,
    handlePageChange: setCurrentPage,
    handlePrevPage: () => setCurrentPage((page) => Math.max(1, page - 1)),
    handleNextPage: () => setCurrentPage((page) => Math.min(totalPages, page + 1)),
    handleStatusChange,
    handleDelete,
  }
}

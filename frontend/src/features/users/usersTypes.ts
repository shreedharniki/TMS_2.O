import { Building2, UserRound, ClipboardCheck } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const PAGE_SIZE = 11

export interface UserApiRow {
  id: number
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_role: string
  user_status: string
  temple_id: number
  temp_name: string | null
  created_at: string
}

export interface UserLimit {
  limit: number
  used: number
  remaining: number
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface AddUserForm {
  templeId: string
  userName: string
  userEmail: string
  userPhone: string
  roleId: string
  userStatus: string
}

export type FormErrors = Record<string, string>

export const emptyAddUserForm = (): AddUserForm => ({
  templeId: "",
  userName: "",
  userEmail: "",
  userPhone: "",
  roleId: "",
  userStatus: "active",
})

export const ROLE_OPTIONS = [
  { value: "3", label: "Temple Admin" },
  { value: "4", label: "User" },
]

export const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-700",
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const ADD_USER_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Temple", subLabel: "Assign a temple", icon: Building2 },
  { id: 2, label: "User Details", subLabel: "Contact, role and status", icon: UserRound },
  { id: 3, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]

export const apiMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback

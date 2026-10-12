export interface UserListItem {
  id: number
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_role: string
  user_status: string
  temple_id: number
  temp_name: string
  created_at: string
}

export interface UserLimit {
  limit: number
  used: number
  remaining: number
}

export interface CreateUserInput {
  temple_id: number
  user_name: string
  user_email: string
  user_phone: string
  role_id: number
  user_status: string
}

export interface CreateUserRecord extends CreateUserInput {
  organization_id: number
  user_code: string
  user_password_hash: string
}

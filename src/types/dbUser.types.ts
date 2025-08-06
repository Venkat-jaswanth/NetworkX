import type { Database } from './supabase.types'

export type userRole = Database['public']['Enums']['user_role']

export type DbUser = Database['public']['Tables']['db_user']['Row']
export type InsertDbUser = Database['public']['Tables']['db_user']['Insert']
export type UpdateDbUser = Database['public']['Tables']['db_user']['Update']


import type { Database } from './supabase.types'

export type userRole = Database['public']['Enums']['user_role']

export type DbUser = Database['public']['Tables']['db_user']['Row']
export type InsertDbUser = Database['public']['Tables']['db_user']['Insert']
export type UpdateDbUser = Database['public']['Tables']['db_user']['Update']

export type Education = Database['public']['Tables']['Education']['Row']
export type InsertEducation = Database['public']['Tables']['Education']['Insert']
export type UpdateEducation = Database['public']['Tables']['Education']['Update']

export type WorkExperience = Database['public']['Tables']['WorkExperience']['Row']
export type InsertWorkExperience = Database['public']['Tables']['WorkExperience']['Insert']
export type UpdateWorkExperience = Database['public']['Tables']['WorkExperience']['Update']
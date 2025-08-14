import type { User } from '@supabase/supabase-js'
import type { Database } from './supabase.types'


export type userRole = Database['public']['Enums']['user_role']

export type DbUser = Database['public']['Tables']['Users']['Row']
export type InsertDbUser = Database['public']['Tables']['Users']['Insert']
export type UpdateDbUser = Database['public']['Tables']['Users']['Update']

export type AppUser = DbUser & User

export type Education = Database['public']['Tables']['Education']['Row']
export type InsertEducation = Database['public']['Tables']['Education']['Insert']
export type UpdateEducation = Database['public']['Tables']['Education']['Update']

export type WorkExperience = Database['public']['Tables']['WorkExperience']['Row']
export type InsertWorkExperience = Database['public']['Tables']['WorkExperience']['Insert']
export type UpdateWorkExperience = Database['public']['Tables']['WorkExperience']['Update']

export type Follow = Database['public']['Tables']['Follows']['Row']
export type InsertFollow = Database['public']['Tables']['Follows']['Insert']
export type UpdateFollow = Database['public']['Tables']['Follows']['Update']

export type Message = Database['public']['Tables']['Messages']['Row']
export type InsertMessage = Database['public']['Tables']['Messages']['Insert']
export type UpdateMessage = Database['public']['Tables']['Messages']['Update']
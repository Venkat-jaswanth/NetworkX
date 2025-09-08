import type { User } from '@supabase/supabase-js'
import type { Database } from './supabase.types'


export type userRole = Database['public']['Enums']['user_role']

export type DbUser = Database['public']['Tables']['Users']['Row']
export type InsertDbUser = Database['public']['Tables']['Users']['Insert']
export type UpdateDbUser = Database['public']['Tables']['Users']['Update']

export type AppUser = DbUser & User & {
  education: Education[]
  workExperience: WorkExperience[]
}

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

export type MessageWithUsers = Message & {
  sender: DbUser
  receiver: DbUser
}

// New domain types (from Database schema)
export type FeedPost = Database['public']['Tables']['FeedPosts']['Row']
export type InsertFeedPost = Database['public']['Tables']['FeedPosts']['Insert']
export type FeedLike = Database['public']['Tables']['FeedLikes']['Row']
export type FeedComment = Database['public']['Tables']['FeedComments']['Row']
export type InsertFeedComment = Database['public']['Tables']['FeedComments']['Insert']

export type InterviewPost = Database['public']['Tables']['InterviewPosts']['Row']
export type InsertInterviewPost = Database['public']['Tables']['InterviewPosts']['Insert']

export type Resource = Database['public']['Tables']['Resources']['Row']
export type InsertResource = Database['public']['Tables']['Resources']['Insert']
export type ResourceView = Database['public']['Tables']['ResourceViews']['Row']

export type Opportunity = Database['public']['Tables']['Opportunities']['Row']
export type InsertOpportunity = Database['public']['Tables']['Opportunities']['Insert']
export type OpportunityView = Database['public']['Tables']['OpportunityViews']['Row']

export type Roadmap = Database['public']['Tables']['Roadmaps']['Row']
export type InsertRoadmap = Database['public']['Tables']['Roadmaps']['Insert']
export type RoadmapStep = Database['public']['Tables']['RoadmapSteps']['Row']
export type InsertRoadmapStep = Database['public']['Tables']['RoadmapSteps']['Insert']

export type MentorProfile = Database['public']['Tables']['MentorProfiles']['Row']
export type InsertMentorProfile = Database['public']['Tables']['MentorProfiles']['Insert']
export type MentorRequest = Database['public']['Tables']['MentorRequests']['Row']
export type InsertMentorRequest = Database['public']['Tables']['MentorRequests']['Insert']

export type MentorProfileWithUser = MentorProfile & {
  Users: {
    full_name: string
    profile_picture_url: string | null
  }
}

export type MentorRequestWithUser = MentorRequest & {
  requester: {
    full_name: string
    profile_picture_url: string | null
  }
}

export type Notification = Database['public']['Tables']['Notifications']['Row']

// Filters
export type ResourceFilters = { category?: string; tags?: string[]; search?: string }
export type OpportunityFilters = { type?: string; location?: string; seniority?: string; tags?: string[]; search?: string }
export type InterviewFilters = { company?: string; difficulty?: 'easy'|'medium'|'hard'; outcome?: 'selected'|'rejected'|'pending'|'n/a' }

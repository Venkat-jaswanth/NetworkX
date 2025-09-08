export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      Education: {
        Row: {
          degree: string
          field_of_study: string
          graduation_year: number
          id: string
          institution_name: string
          user_id: string
        }
        Insert: {
          degree: string
          field_of_study: string
          graduation_year: number
          id?: string
          institution_name: string
          user_id: string
        }
        Update: {
          degree?: string
          field_of_study?: string
          graduation_year?: number
          id?: string
          institution_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Education_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      FeedComments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FeedComments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "FeedPosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FeedComments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      FeedLikes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "FeedLikes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "FeedPosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FeedLikes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      FeedPosts: {
        Row: {
          author_id: string | null
          body: string
          comment_count: number
          created_at: string
          id: string
          like_count: number
          media_url: string | null
          tags: string[] | null
          title: string | null
          visibility: string
        }
        Insert: {
          author_id?: string | null
          body: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_url?: string | null
          tags?: string[] | null
          title?: string | null
          visibility?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_url?: string | null
          tags?: string[] | null
          title?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "FeedPosts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      InterviewPosts: {
        Row: {
          author_id: string | null
          body: string
          company: string
          created_at: string
          difficulty: string | null
          id: string
          outcome: string | null
          role: string
          tags: string[] | null
        }
        Insert: {
          author_id?: string | null
          body: string
          company: string
          created_at?: string
          difficulty?: string | null
          id?: string
          outcome?: string | null
          role: string
          tags?: string[] | null
        }
        Update: {
          author_id?: string | null
          body?: string
          company?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          outcome?: string | null
          role?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "InterviewPosts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      MentorProfiles: {
        Row: {
          availability: string | null
          created_at: string
          expertise: string[] | null
          headline: string | null
          hourly_rate: number | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "MentorProfiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      MentorRequests: {
        Row: {
          created_at: string
          id: string
          mentor_id: string | null
          message: string | null
          requester_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id?: string | null
          message?: string | null
          requester_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string | null
          message?: string | null
          requester_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "MentorRequests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MentorRequests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Messages: {
        Row: {
          body: string
          created_at: string
          id: number
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: number
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Opportunities: {
        Row: {
          company_name: string
          created_at: string
          id: string
          location: string | null
          seniority: string | null
          tags: string[] | null
          title: string
          type: string | null
          url: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          location?: string | null
          seniority?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          url?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          location?: string | null
          seniority?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      OpportunityViews: {
        Row: {
          last_seen_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "OpportunityViews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          tags: string[] | null
          title: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          tags?: string[] | null
          title: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      ResourceViews: {
        Row: {
          last_seen_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ResourceViews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Roadmaps: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      RoadmapSteps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          resource_ids: string[] | null
          roadmap_id: string | null
          step_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          resource_ids?: string[] | null
          roadmap_id?: string | null
          step_index: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          resource_ids?: string[] | null
          roadmap_id?: string | null
          step_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "RoadmapSteps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "Roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      Users: {
        Row: {
          bio: string
          created_at: string
          full_name: string
          id: string
          is_mentor: boolean | null
          is_seeking_mentor: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: Json
        }
        Insert: {
          bio: string
          created_at?: string
          full_name: string
          id: string
          is_mentor?: boolean | null
          is_seeking_mentor?: boolean | null
          profile_picture_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: Json
        }
        Update: {
          bio?: string
          created_at?: string
          full_name?: string
          id?: string
          is_mentor?: boolean | null
          is_seeking_mentor?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: Json
        }
        Relationships: []
      }
      WorkExperience: {
        Row: {
          company_name: string
          end_date: string | null
          id: string
          job_title: string
          start_date: string
          user_id: string
        }
        Insert: {
          company_name: string
          end_date?: string | null
          id?: string
          job_title: string
          start_date: string
          user_id: string
        }
        Update: {
          company_name?: string
          end_date?: string | null
          id?: string
          job_title?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "WorkExperience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "Student" | "Professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["Student", "Professional"],
    },
  },
} as const

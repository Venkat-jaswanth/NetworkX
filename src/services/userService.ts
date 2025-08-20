import { supabase } from "@/lib/supabase";
import type { InsertDbUser, InsertEducation, InsertWorkExperience, AppUser, DbUser } from "@/types/app.types";
import { getAuthUser } from "./authService";

export interface UserSearchResult {
  id: string;
  full_name: string;
  profile_picture_url: string | null;
}

interface CreateDbUser {
  user: InsertDbUser;
  education: InsertEducation;
  workExperience?: InsertWorkExperience;
}

export async function createDbUser(user: CreateDbUser) {
  // Insert user into Users table first
  const { error } = await supabase.from('Users').insert(user.user);
  if (error) throw error;

  if (user.education) {
    const { error: educationError } = await supabase.from('Education').insert({
      ...user.education,
      user_id: user.user.id
    });
    if (educationError) throw educationError;
  }
  
  if (user.workExperience) {
    const { error: workExperienceError } = await supabase.from('WorkExperience').insert({
      ...user.workExperience,
      user_id: user.user.id
    });
    if (workExperienceError) throw workExperienceError;
  }
}

export async function dbUserExists(): Promise<boolean> {
  const authUser = await getAuthUser();
  const { data: dbUser, error } = await supabase.from('Users').select('*').eq('id', authUser?.id).single();
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('User not found error');
      return false; // User not found
    }
    throw error; // Other errors
  }
  console.log('User found');
  return dbUser !== null;
}

export async function getAppUser(): Promise<AppUser> {
  const authUser = await getAuthUser();
  const { data, error } = await supabase.from('Users').select('*').eq('id', authUser?.id).single();
  const { data: education, error: educationError } = await supabase.from('Education').select('*').eq('user_id', authUser?.id).order('graduation_year', { ascending: false });
  const { data: workExperience, error: workExperienceError } = await supabase.from('WorkExperience').select('*').eq('user_id', authUser?.id).order('start_date', { ascending: false });
  if (error || educationError || workExperienceError) throw error || educationError || workExperienceError;
  const dbUser = data as DbUser;
  
  return { 
    ...authUser, 
    ...dbUser, 
    education: education || [], 
    workExperience: workExperience || [] 
  };
}

// Search users by name only (no email column in Users table)
export async function searchUsers(query: string, limit: number = 20): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];
  
  const { data, error } = await supabase
    .from('Users')
    .select('id, full_name, profile_picture_url')
    .ilike('full_name', `%${query}%`)
    .limit(limit);
  
  console.log(data);
  if (error) throw error;
  return data || [];
}

// Get search suggestions (for real-time search)
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<UserSearchResult[]> {
  if (!query.trim() || query.length < 2) return [];
  
  const { data, error } = await supabase
    .from('Users')
    .select('id, full_name, profile_picture_url')
    .ilike('full_name', `%${query}%`)
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// Get user by ID with complete profile data
export async function getProfileById(userId: string): Promise<any> {
  const { data: user, error: userError } = await supabase
    .from('Users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError) {
    if (userError.code === 'PGRST116') {
      return null; // User not found
    }
    throw userError;
  }

  // Fetch education data
  const { data: education, error: educationError } = await supabase
    .from('Education')
    .select('*')
    .eq('user_id', userId)
    .order('graduation_year', { ascending: false });

  // Fetch work experience data
  const { data: workExperience, error: workExperienceError } = await supabase
    .from('WorkExperience')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (educationError || workExperienceError) {
    throw educationError || workExperienceError;
  }

  return {
    ...user,
    education: education || [],
    workExperience: workExperience || []
  };
}

// Helper functions for managing multiple education records
export async function addEducation(education: InsertEducation): Promise<void> {
  const { error } = await supabase.from('Education').insert(education);
  if (error) throw error;
}

export async function updateEducation(id: string, updates: Partial<InsertEducation>): Promise<void> {
  const { error } = await supabase.from('Education').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteEducation(id: string): Promise<void> {
  const { error } = await supabase.from('Education').delete().eq('id', id);
  if (error) throw error;
}

// Helper functions for managing multiple work experience records
export async function addWorkExperience(workExperience: InsertWorkExperience): Promise<void> {
  const { error } = await supabase.from('WorkExperience').insert(workExperience);
  if (error) throw error;
}

export async function updateWorkExperience(id: string, updates: Partial<InsertWorkExperience>): Promise<void> {
  const { error } = await supabase.from('WorkExperience').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteWorkExperience(id: string): Promise<void> {
  const { error } = await supabase.from('WorkExperience').delete().eq('id', id);
  if (error) throw error;
}

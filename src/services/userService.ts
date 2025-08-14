import { supabase } from "@/lib/supabase";
import type { InsertDbUser, InsertEducation, InsertWorkExperience, AppUser, DbUser } from "@/types/app.types";
import { getAuthUser } from "./authService";

export async function createDbUser(user: InsertDbUser, education?: InsertEducation, workExperience?: InsertWorkExperience) {
  const { error } = await supabase.from('Users').insert(user);
  if (error) throw error;

  if (education) {
    const { error: educationError } = await supabase.from('Education').insert(education);
    if (educationError) throw educationError;
  }
  if (workExperience) {
    const { error: workExperienceError } = await supabase.from('WorkExperience').insert(workExperience);
    if (workExperienceError) throw workExperienceError;
  }
}

export async function dbUserExists(id: string): Promise<boolean> {
  const { data: dbUser, error } = await supabase.from('Users').select('*').eq('id', id).single();
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
  if (error) throw error;
  const dbUser = data as DbUser;
  return { ...authUser, ...dbUser };
}

import { supabase } from "@/lib/supabase";
import type { InsertDbUser } from "@/types/dbUser.types";
import type { DbUser } from "@/types/dbUser.types";

export async function createDbUser(user: InsertDbUser) {
  const { error } = await supabase.from('db_user').insert(user);
  if (error) throw error;
}

export async function getDbUser(id: string): Promise<DbUser> {
  const { data: dbUser, error } = await supabase.from('db_user').select('*').eq('id', id).single();
  if (error) throw error;
  return dbUser;
}

export async function dbUserExists(id: string): Promise<boolean> {
  const { data: dbUser, error } = await supabase.from('db_user').select('*').eq('id', id).single();
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
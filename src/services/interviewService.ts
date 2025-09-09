import { supabase } from '@/lib/supabase';
import type { InterviewPost, InsertInterviewPost, InterviewFilters } from '@/types/app.types';

export async function listInterviewPosts(filters: InterviewFilters = {}): Promise<InterviewPost[]> {
  let query = supabase
    .from('InterviewPosts')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.company) query = query.ilike('company', `%${filters.company}%`);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.outcome) query = query.eq('outcome', filters.outcome);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getInterviewPost(id: string): Promise<InterviewPost> {
  const { data, error } = await supabase
    .from('InterviewPosts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as InterviewPost;
}

export async function createInterviewPost(payload: Partial<InterviewPost>): Promise<InterviewPost> {
  // Ensure required fields are present
  if (!payload.body || !payload.company || !payload.role) {
    throw new Error('Missing required fields: body, company, and role are required');
  }
  
  const { data, error } = await supabase
    .from('InterviewPosts')
    .insert(payload as InsertInterviewPost)
    .select('*')
    .single();
  if (error) throw error;
  return data as InterviewPost;
}


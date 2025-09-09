import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';
import type { MentorProfile, MentorProfileWithUser, MentorRequest, MentorRequestWithUser } from '@/types/app.types';

export async function searchMentors(params: { expertise?: string[]; availability?: string } = {}): Promise<MentorProfileWithUser[]> {
  let query = supabase
    .from('MentorProfiles')
    .select(`
      *,
      Users!inner(
        full_name,
        profile_picture_url
      )
    `)
    .order('created_at', { ascending: false });

  if (params.expertise && params.expertise.length) {
    query = query.overlaps('expertise', params.expertise); // at least one overlap
  }
  if (params.availability) {
    query = query.eq('availability', params.availability);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertMentorProfile(payload: Partial<MentorProfile>): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('MentorProfiles')
    .upsert({ ...payload, user_id: user.id });
  if (error) throw error;
}

export async function createMentorRequest(mentorId: string, message: string): Promise<MentorRequest> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('MentorRequests')
    .insert({ requester_id: user.id, mentor_id: mentorId, message })
    .select('*')
    .single();
  if (error) throw error;
  return data as MentorRequest;
}

export async function listIncomingRequests(): Promise<MentorRequestWithUser[]> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('MentorRequests')
    .select(`
      *,
      requester:Users!requester_id(
        full_name,
        profile_picture_url
      )
    `)
    .eq('mentor_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  // Filter out requests where requester is null
  return (data || []).filter((request): request is MentorRequestWithUser => 
    request.requester !== null
  );
}

export async function respondMentorRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
  const { error } = await supabase
    .from('MentorRequests')
    .update({ status })
    .eq('id', requestId);
  if (error) throw error;
}

export async function getPendingRequestsCount(): Promise<number> {
  const user = await getAuthUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from('MentorRequests')
    .select('*', { count: 'exact', head: true })
    .eq('mentor_id', user.id)
    .eq('status', 'pending');
  if (error) throw error;
  return count || 0;
}


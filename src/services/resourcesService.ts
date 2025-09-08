import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';
import type { Resource, ResourceView, ResourceFilters } from '@/types/app.types';

export async function listResources(filters: ResourceFilters = {}): Promise<Resource[]> {
  let query = supabase
    .from('Resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.tags && filters.tags.length) {
    // tags is a text[] column; contains requires all tags to be present
    query = query.contains('tags', filters.tags);
  }
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${q},description.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markResourcesSeen(): Promise<void> {
  const user = await getAuthUser();
  if (!user) return;
  const { error } = await supabase
    .from('ResourceViews')
    .upsert({ user_id: user.id, last_seen_at: new Date().toISOString() } as Partial<ResourceView>)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function getNewResourcesCount(): Promise<number> {
  const user = await getAuthUser();
  if (!user) return 0;

  const { data: viewRow, error: viewErr } = await supabase
    .from('ResourceViews')
    .select('last_seen_at')
    .eq('user_id', user.id)
    .single();

  if (viewErr && viewErr.code !== 'PGRST116') throw viewErr;
  if (!viewRow?.last_seen_at) return 0; // if first visit, no badge

  const { count, error } = await supabase
    .from('Resources')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', viewRow.last_seen_at as string);

  if (error) throw error;
  return count || 0;
}


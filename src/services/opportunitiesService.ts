import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';
import type { Opportunity, OpportunityView, OpportunityFilters } from '@/types/app.types';

export async function listOpportunities(filters: OpportunityFilters = {}): Promise<Opportunity[]> {
  let query = supabase
    .from('Opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.seniority) query = query.eq('seniority', filters.seniority);
  if (filters.tags && filters.tags.length) query = query.contains('tags', filters.tags);
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${q},company_name.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markOpportunitiesSeen(): Promise<void> {
  const user = await getAuthUser();
  if (!user) return;
  const { error } = await supabase
    .from('OpportunityViews')
    .upsert({ user_id: user.id, last_seen_at: new Date().toISOString() } as Partial<OpportunityView>)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function getNewOpportunitiesCount(): Promise<number> {
  const user = await getAuthUser();
  if (!user) return 0;
  const { data: viewRow, error: viewErr } = await supabase
    .from('OpportunityViews')
    .select('last_seen_at')
    .eq('user_id', user.id)
    .single();
  if (viewErr && viewErr.code !== 'PGRST116') throw viewErr;
  if (!viewRow?.last_seen_at) return 0;

  const { count, error } = await supabase
    .from('Opportunities')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', viewRow.last_seen_at as string);
  if (error) throw error;
  return count || 0;
}


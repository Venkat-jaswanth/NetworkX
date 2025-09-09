import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: any;
  read_at: string | null;
  created_at: string;
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('Notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Filter out notifications where user_id is null and ensure type safety
  return (data || []).filter((notification): notification is Notification => 
    notification.user_id !== null
  );
}

export async function getUnreadCount(): Promise<number> {
  const user = await getAuthUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('Notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) throw error;
  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('Notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function markAllAsRead(): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('Notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) throw error;
}

export async function createNotification(
  userId: string, 
  type: string, 
  payload: any
): Promise<void> {
  const { error } = await supabase
    .from('Notifications')
    .insert({
      user_id: userId,
      type,
      payload
    });

  if (error) throw error;
}

// Badge counts for sidebar
export async function getBadgeCounts(): Promise<{
  resources: number;
  opportunities: number;
  mentorRequests: number;
  notifications: number;
}> {
  const user = await getAuthUser();
  if (!user) return { resources: 0, opportunities: 0, mentorRequests: 0, notifications: 0 };

  const [resourcesResult, opportunitiesResult, mentorRequestsResult, notificationsResult] = await Promise.all([
    // New resources since last visit
    supabase
      .from('Resources')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', await getLastResourcesVisit()),
    
    // New opportunities since last visit  
    supabase
      .from('Opportunities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', await getLastOpportunitiesVisit()),
    
    // Pending mentor requests
    supabase
      .from('MentorRequests')
      .select('*', { count: 'exact', head: true })
      .eq('mentor_id', user.id)
      .eq('status', 'pending'),
    
    // Unread notifications
    supabase
      .from('Notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
  ]);

  return {
    resources: resourcesResult.count || 0,
    opportunities: opportunitiesResult.count || 0,
    mentorRequests: mentorRequestsResult.count || 0,
    notifications: notificationsResult.count || 0
  };
}

async function getLastResourcesVisit(): Promise<string> {
  const user = await getAuthUser();
  if (!user) return new Date().toISOString();

  const { data } = await supabase
    .from('ResourceViews')
    .select('last_seen_at')
    .eq('user_id', user.id)
    .single();

  return data?.last_seen_at || new Date(0).toISOString();
}

async function getLastOpportunitiesVisit(): Promise<string> {
  const user = await getAuthUser();
  if (!user) return new Date().toISOString();

  const { data } = await supabase
    .from('OpportunityViews')
    .select('last_seen_at')
    .eq('user_id', user.id)
    .single();

  return data?.last_seen_at || new Date(0).toISOString();
}

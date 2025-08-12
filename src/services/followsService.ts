import { supabase } from "@/lib/supabase";
import type { Follow } from "@/types/User.types";
import { getUser } from "./authService";

// Follow a user (authenticated - current user follows someone)
export async function followUser(followingId: string): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('Follows')
    .insert({
      follower_id: user.id,
      following_id: followingId
    });
  
  if (error) throw error;
}

// Unfollow a user (authenticated - current user unfollows someone)
export async function unfollowUser(followingId: string): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('Follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);
  
  if (error) throw error;
}

// Check if current user is following another user (authenticated)
export async function isFollowing(followingId: string): Promise<boolean> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return false; // Not following
    }
    throw error;
  }
  
  return data !== null;
}

// Get mutual followers between current user and another user (authenticated)
export async function getMutualFollowers(otherUserId: string): Promise<Follow[]> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .or(`and(follower_id.eq.${user.id},following_id.eq.${otherUserId}),and(follower_id.eq.${otherUserId},following_id.eq.${user.id})`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
} 

// Get all users that a specific user is following
export async function getFollowing(followerId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .eq('follower_id', followerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get all users following a specific user
export async function getFollowers(followingId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .eq('following_id', followingId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get follower count for a specific user
export async function getFollowerCount(followingId: string): Promise<number> {
  const { count, error } = await supabase
    .from('Follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', followingId);
  
  if (error) throw error;
  return count || 0;
}

// Get following count for a specific user
export async function getFollowingCount(followerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('Follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', followerId);
  
  if (error) throw error;
  return count || 0;
}
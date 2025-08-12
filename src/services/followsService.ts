import { supabase } from "@/lib/supabase";
import type { Follow } from "@/types/User.types";

// Follow a user
export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('Follows')
    .insert({
      follower_id: followerId,
      following_id: followingId
    });
  
  if (error) throw error;
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('Follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  
  if (error) throw error;
}

// Check if user A is following user B
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('Follows')
    .select('follower_id')
    .eq('follower_id', followerId)
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

// Get all users that a user is following
export async function getFollowing(userId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get all users following a user
export async function getFollowers(userId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get follower count for a user
export async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('Follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);
  
  if (error) throw error;
  return count || 0;
}

// Get following count for a user
export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('Follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);
  
  if (error) throw error;
  return count || 0;
}

// Get mutual followers (users who follow each other)
export async function getMutualFollowers(userId1: string, userId2: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('Follows')
    .select('*')
    .or(`and(follower_id.eq.${userId1},following_id.eq.${userId2}),and(follower_id.eq.${userId2},following_id.eq.${userId1})`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
} 
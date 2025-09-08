import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';
import type { FeedPost, FeedComment } from '@/types/app.types';

export async function getFeed(params: { scope: 'public' | 'following'; limit?: number } = { scope: 'public' }): Promise<FeedPost[]> {
  const limit = params.limit ?? 25;
  const user = await getAuthUser();

  let query = supabase
    .from('FeedPosts')
    .select(`
      *,
      author:Users!author_id(
        id,
        full_name,
        profile_picture_url,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.scope === 'public') {
    query = query.eq('visibility', 'public');
  } else {
    // Following scope: posts by followed users or self; visibility either public or followers
    if (!user) return [];
    const { data: follows, error: fErr } = await supabase
      .from('Follows')
      .select('following_id')
      .eq('follower_id', user.id);
    if (fErr) throw fErr;
    const authorIds = [user.id, ...(follows?.map(f => f.following_id) ?? [])];
    if (authorIds.length === 0) return [];
    query = query.in('author_id', authorIds).in('visibility', ['public', 'followers']);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createFeedPost(payload: { title?: string; body: string; tags?: string[]; visibility?: 'public'|'followers'; media_url?: string }): Promise<FeedPost> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('FeedPosts')
    .insert({
      author_id: user.id,
      title: payload.title ?? null,
      body: payload.body,
      tags: payload.tags ?? [],
      visibility: payload.visibility ?? 'public',
      media_url: payload.media_url ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as FeedPost;
}

export async function toggleLike(postId: string): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing, error: exErr } = await supabase
    .from('FeedLikes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (exErr && exErr.code !== 'PGRST116') throw exErr;

  if (existing) {
    const { error: delErr } = await supabase
      .from('FeedLikes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (delErr) throw delErr;
  } else {
    const { error: insErr } = await supabase
      .from('FeedLikes')
      .insert({ post_id: postId, user_id: user.id });
    if (insErr) throw insErr;
  }
}

export async function getComments(postId: string): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('FeedComments')
    .select(`
      *,
      user:Users!user_id(
        id,
        full_name,
        profile_picture_url,
        role
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addComment(postId: string, body: string): Promise<FeedComment> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('FeedComments')
    .insert({ post_id: postId, user_id: user.id, body })
    .select(`
      *,
      user:Users!user_id(
        id,
        full_name,
        profile_picture_url,
        role
      )
    `)
    .single();
  if (error) throw error;
  return data as FeedComment;
}

export async function checkUserLikedPost(postId: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('FeedLikes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getFeedWithLikeStatus(params: { scope: 'public' | 'following'; limit?: number } = { scope: 'public' }) {
  const posts = await getFeed(params);
  const user = await getAuthUser();

  if (!user) {
    return posts.map(post => ({ ...post, isLikedByUser: false }));
  }

  // Get like status for all posts in a single query
  const postIds = posts.map(p => p.id);
  const { data: likes, error } = await supabase
    .from('FeedLikes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  if (error) throw error;

  const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

  return posts.map(post => ({
    ...post,
    isLikedByUser: likedPostIds.has(post.id)
  }));
}


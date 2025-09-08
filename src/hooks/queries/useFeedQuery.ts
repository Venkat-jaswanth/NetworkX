import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, getFeedWithLikeStatus, createFeedPost, toggleLike, getComments, addComment } from '@/services/feedService';
import type { FeedComment } from '@/types/app.types';

export const useFeedQuery = (scope: 'public' | 'following' = 'public') => {
  return useQuery({
    queryKey: ['feed', scope],
    queryFn: () => getFeedWithLikeStatus({ scope }),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });
};

export const useCommentsQuery = (postId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['feed', 'comments', postId],
    queryFn: () => getComments(postId),
    enabled: options?.enabled ?? true,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) => addComment(postId, body),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });
};


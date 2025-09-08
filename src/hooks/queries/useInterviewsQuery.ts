import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listInterviewPosts, getInterviewPost, createInterviewPost } from '@/services/interviewService';
import type { InterviewFilters } from '@/types/app.types';

export const useInterviewsQuery = (filters: InterviewFilters) => {
  return useQuery({
    queryKey: ['interviews', filters],
    queryFn: () => listInterviewPosts(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useInterviewDetailQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => getInterviewPost(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInterviewPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
};


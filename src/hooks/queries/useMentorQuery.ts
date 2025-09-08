import { useQuery } from '@tanstack/react-query';
import { searchMentors, listIncomingRequests, getPendingRequestsCount } from '@/services/mentorService';

export const useMentorSearch = (filters: { expertise?: string[]; availability?: string }) => {
  return useQuery({
    queryKey: ['mentors', 'search', filters],
    queryFn: () => searchMentors(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useIncomingMentorRequests = () => {
  return useQuery({
    queryKey: ['mentors', 'requests', 'incoming'],
    queryFn: () => listIncomingRequests(),
    staleTime: 30 * 1000,
  });
};

export const usePendingMentorRequestsCount = () => {
  return useQuery({
    queryKey: ['mentors', 'requests', 'count'],
    queryFn: () => getPendingRequestsCount(),
    staleTime: 30 * 1000,
  });
};


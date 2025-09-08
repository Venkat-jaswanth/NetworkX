import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions, searchUsers, getProfileById } from '@/services/userService';

export const searchSuggestionsQueryOptions = (query: string) => ({
  queryKey: ['search', 'suggestions', query],
  queryFn: () => getSearchSuggestions(query),
  enabled: query.trim().length >= 2,
  staleTime: 30 * 1000, // 30 seconds
});

export const searchUsersQueryOptions = (query: string) => ({
  queryKey: ['search', 'users', query],
  queryFn: () => searchUsers(query),
  enabled: query.trim().length > 0,
  staleTime: 60 * 1000, // 1 minute
});

export const userProfileQueryOptions = (userId: string | null) => ({
  queryKey: ['search', 'profile', userId],
  queryFn: () => getProfileById(userId!),
  enabled: !!userId,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

export const useSearchSuggestionsQuery = (query: string) => {
  return useQuery(searchSuggestionsQueryOptions(query));
};

export const useSearchUsersQuery = (query: string) => {
  return useQuery(searchUsersQueryOptions(query));
};

export const useUserProfileQuery = (userId: string | null) => {
  return useQuery(userProfileQueryOptions(userId));
};

// Helper hook for search page prefetch - loads initial search suggestions
export const useSearchInitialQuery = () => {
  return useQuery({
    queryKey: ['search', 'initial'],
    queryFn: async () => {
      // Return some initial state or popular suggestions
      return { initialized: true };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

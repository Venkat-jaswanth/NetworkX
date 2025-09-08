import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './queries/useAuthQuery';
import { profileQueryOptions } from './queries/useProfileQuery';
import { conversationsQueryOptions } from './queries/useConversationsQuery';

export const useHoverPrefetch = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();

  const prefetchProfile = () => {
    if (!user?.id) return;
    queryClient.prefetchQuery(profileQueryOptions(user.id));
  };

  const prefetchMessages = () => {
    if (!user?.id) return;
    queryClient.prefetchQuery(conversationsQueryOptions(user));
  };

  const prefetchSearch = () => {
    queryClient.prefetchQuery({
      queryKey: ['search', 'initial'],
      queryFn: async () => ({ initialized: true }),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchFeed = () => {
    queryClient.prefetchQuery({
      queryKey: ['feed', 'public'],
      queryFn: async () => {
        const { getFeed } = await import('@/services/feedService');
        return getFeed({ scope: 'public' });
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchInterviews = () => {
    queryClient.prefetchQuery({
      queryKey: ['interviews', {}],
      queryFn: async () => {
        const { listInterviewPosts } = await import('@/services/interviewService');
        return listInterviewPosts({});
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchResources = () => {
    queryClient.prefetchQuery({
      queryKey: ['resources', {}],
      queryFn: async () => {
        const { listResources } = await import('@/services/resourcesService');
        return listResources({});
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchOpportunities = () => {
    queryClient.prefetchQuery({
      queryKey: ['opportunities', {}],
      queryFn: async () => {
        const { listOpportunities } = await import('@/services/opportunitiesService');
        return listOpportunities({});
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchRoadmaps = () => {
    console.log('🚀 Prefetching Roadmaps data...');
    queryClient.prefetchQuery({
      queryKey: ['roadmaps'],
      queryFn: async () => {
        console.log('📊 Loading roadmaps data from service...');
        const { listRoadmaps } = await import('@/services/roadmapsService');
        return listRoadmaps();
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchFindMentor = () => {
    console.log('🚀 Prefetching Find Mentor data...');
    queryClient.prefetchQuery({
      queryKey: ['mentors', 'search', {}],
      queryFn: async () => {
        console.log('👥 Loading mentors data from service...');
        const { searchMentors } = await import('@/services/mentorService');
        return searchMentors({});
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchProfile,
    prefetchMessages,
    prefetchSearch,
    prefetchFeed,
    prefetchInterviews,
    prefetchResources,
    prefetchOpportunities,
    prefetchRoadmaps,
    prefetchFindMentor,
  };
};

import { useQuery } from '@tanstack/react-query';
import { getAppUser } from '@/services/userService';
import { getFollowerCount, getFollowingCount } from '@/services/followsService';
import { useAuthQuery } from './useAuthQuery';

export const homeQueryOptions = (userId: string | undefined) => ({
  queryKey: ['home', 'dashboard', userId],
  queryFn: async () => {
    if (!userId) throw new Error('User ID required');
    
    const [appUser, followerCount, followingCount] = await Promise.all([
      getAppUser(),
      getFollowerCount(userId),
      getFollowingCount(userId),
    ]);
    
    return { 
      user: appUser, 
      stats: { 
        followers: followerCount, 
        following: followingCount 
      } 
    };
  },
  enabled: !!userId,
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const useHomeQuery = () => {
  const { data: authUser } = useAuthQuery();
  return useQuery(homeQueryOptions(authUser?.id));
};

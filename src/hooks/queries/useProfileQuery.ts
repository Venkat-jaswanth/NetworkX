import { useQuery } from '@tanstack/react-query';
import { useAuthQuery } from './useAuthQuery';
import { getFollowerCount, getFollowingCount } from '@/services/followsService';
import { getAppUser } from '@/services/userService';

export const profileQueryOptions = (userId: string | undefined) => ({
  queryKey: ['profile', 'current', userId],
  queryFn: async () => {
    const [appUser, followerCount, followingCount] = await Promise.all([
      getAppUser(),
      getFollowerCount(userId!),
      getFollowingCount(userId!),
    ]);
    return { user: appUser, followerCount, followingCount };
  },
  enabled: !!userId,
});

export const useProfileQuery = () => {
  const { data: authUser } = useAuthQuery();
  return useQuery(profileQueryOptions(authUser?.id));
}; 
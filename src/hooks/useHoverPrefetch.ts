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

  return {
    prefetchProfile,
    prefetchMessages,
  };
};

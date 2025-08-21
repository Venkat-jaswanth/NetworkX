import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './useAuthQuery';
import { getUnreadMessageCount, getConversationsWithDetails, subscribeToMessages } from '@/services/messagesService';
import type { User } from '@supabase/supabase-js';

export const conversationsQueryOptions = (user: User | undefined | null) => ({
  queryKey: ['conversations', user?.id],
  queryFn: async () => {
    const [conversations, totalUnreadCount] = await Promise.all([
      getConversationsWithDetails(user!),
      getUnreadMessageCount(user!),
    ]);
    return { conversations, totalUnreadCount };
  },
  enabled: !!user,
});

export const useConversationsQuery = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(user.id, {
      channelName: `conversations:${user.id}`,
      onNewMessage: () => {
        // Update conversations list when any new message arrives
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      },
      
      onMessageUpdate: () => {
        // Update conversations list when any message is updated
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      },
    });

    return unsubscribe;
  }, [user?.id, queryClient]);

  return useQuery(conversationsQueryOptions(user));
}; 
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './useAuthQuery';
import { getConversation, markConversationAsRead, subscribeToMessages } from '@/services/messagesService';
import type { Message } from '@/types/app.types';
import type { User } from '@supabase/supabase-js';

export const messagesQueryOptions = (user: User | undefined | null, conversationId: string | null) => ({
  queryKey: ['messages', conversationId, user?.id],
  queryFn: async () => {
    const messages = await getConversation(user!, conversationId!);
    await markConversationAsRead(user!, conversationId!);
    return messages;
  },
  enabled: !!user && !!conversationId,
}); 

export const useMessagesQuery = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();

  // Real-time subscription for specific conversation messages
  useEffect(() => {
    if (!user?.id || !conversationId) return;

    const unsubscribe = subscribeToMessages(user.id, {
      channelName: `messages:${conversationId}`,
      onNewMessage: (newMessage) => {
        const messageConversationId = newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id;
        if (conversationId === messageConversationId) {
          queryClient.setQueryData(['messages', conversationId, user.id], (oldMessages?: Message[]) => {
            return [...(oldMessages ?? []), newMessage];
          });
        }
      },
      
      onMessageUpdate: (updatedMessage) => {
        // Update messages if this conversation is affected
        const messageConversationId = updatedMessage.sender_id === user.id ? updatedMessage.receiver_id : updatedMessage.sender_id;
        if (conversationId === messageConversationId) {
          queryClient.setQueryData(['messages', conversationId, user.id], (oldMessages?: Message[]) =>
            (oldMessages ?? []).map(m => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      },  
    });

    return unsubscribe;
  }, [user?.id, conversationId, queryClient]);

  return useQuery(messagesQueryOptions(user, conversationId));
}; 
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './queries/useAuthQuery';
import { useConversationsQuery } from './queries/useConversationsQuery';
import { useMessagesQuery } from './queries/useMessagesQuery';
import {
  sendMessage as sendMessageService,
} from '@/services/messagesService';

export const useMessages = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();
  
  // React Query for data fetching
  const conversationsQuery = useConversationsQuery();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const messagesQuery = useMessagesQuery(activeConversation);

  // Extract data from queries
  const conversations = conversationsQuery.data?.conversations ?? [];
  const messages = messagesQuery.data ?? [];
  const unreadCount = conversationsQuery.data?.totalUnreadCount ?? 0;
  const loading = conversationsQuery.isLoading;

  // Function to refresh specific conversation
  const loadConversation = (userId: string) => {
    setActiveConversation(userId);
    queryClient.invalidateQueries({ queryKey: ['messages', userId] });
  };

  // Send message
  const sendMessage = useCallback(async (receiverId: string, body: string) => {
    if (!user?.id || !body.trim()) return;
    
    try {
      await sendMessageService(user, receiverId, body);
      // Live updates will handle the rest
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user?.id]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [user?.id]);

  return {
    conversations,
    messages,
    activeConversation,
    // unreadCount,
    loading,
    sendMessage,
    loadConversation,
    setActiveConversation
  };
};

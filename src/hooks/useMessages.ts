import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  sendMessage as sendMessageService,
  subscribeToMessages,
  getUnreadMessageCount,
  getConversationsWithDetails,
  getConversation,
  markConversationAsRead,
} from '@/services/messagesService';
import type { Message } from '@/types/app.types';

interface ConversationUser {
  id: string;
  full_name: string;
  profile_picture_url: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Load initial conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const totalUnreadCount = await getUnreadMessageCount(user);
      const conversations = await getConversationsWithDetails(user);

      setConversations(conversations);
      setUnreadCount(totalUnreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setLoading(false);
    }
  }, [user]);

  const loadConversation = useCallback(async (userId: string) => {
    if (!user?.id) return;

    try {
      const conversationMessages = await getConversation(user, userId);
      setMessages(conversationMessages);
      setActiveConversation(userId);
      
      // Mark conversation as read
      await markConversationAsRead(user, userId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [user?.id]);

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
    loadConversation(receiverId);
  }, [user?.id, activeConversation]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    setSubscriptionError(null);

    try {
      const unsubscribe = subscribeToMessages(user.id, {
        onNewMessage: (newMessage) => {
        // Update active conversation if it matches
        if (activeConversation &&
            (newMessage.sender_id === activeConversation ||
             newMessage.receiver_id === activeConversation)) {
            loadConversation(newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id);
        }
      },
      
      onMessageUpdate: (updatedMessage) => {
        if (activeConversation &&
            (updatedMessage.sender_id === activeConversation ||
             updatedMessage.receiver_id === activeConversation)) {
            loadConversation(updatedMessage.sender_id === user.id ? updatedMessage.receiver_id : updatedMessage.sender_id);
        }
      },
      onMessageDelete: (messageId) => {
        console.log('Delete callback triggered for messageId:', messageId);
        // Get the conversation info from current messages before filtering
        const deletedMessage = messages.find(message => message.id === messageId);
        if (deletedMessage) {
          const conversationId = deletedMessage.sender_id === user.id ? deletedMessage.receiver_id : deletedMessage.sender_id;
          console.log('Reloading conversation:', conversationId);
          loadConversation(conversationId);
        }
      },
    });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to set up real-time subscription:', error);
      setSubscriptionError(error instanceof Error ? error.message : 'Unknown subscription error');
      return () => {};
    }
  }, [user?.id, activeConversation, loadConversations]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id, loadConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    unreadCount,
    loading,
    subscriptionError,
    sendMessage,
    loadConversation,
    loadConversations,
    setActiveConversation
  };
};

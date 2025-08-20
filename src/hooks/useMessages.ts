import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  sendMessage as sendMessageService,
  getConversation,
  getAuthUserConversations,
  subscribeToMessages,
  markConversationAsRead,
  getUnreadMessageCount,
  processMessagesToConversations,
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

  // Load initial conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const allMessages = await getAuthUserConversations();
      const totalUnreadCount = await getUnreadMessageCount();
      
      const processedConversations = await processMessagesToConversations(allMessages, user.id);
      
      setConversations(processedConversations as ConversationUser[]);
      setUnreadCount(totalUnreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setLoading(false);
    }
  }, [user?.id]);

  // Load conversation messages
  const loadConversation = useCallback(async (userId: string) => {
    if (!user?.id) return;
    
    try {
      const conversationMessages = await getConversation(userId);
      setMessages(conversationMessages);
      setActiveConversation(userId);
      
      // Mark conversation as read
      await markConversationAsRead(userId);
      
      // Update unread count
      const newUnreadCount = await getUnreadMessageCount();
      setUnreadCount(newUnreadCount);
      
      // Update conversations to reflect read status
      await loadConversations();
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [user?.id, loadConversations]);

  // Send message
  const sendMessage = useCallback(async (receiverId: string, body: string) => {
    if (!user?.id || !body.trim()) return;
    
    try {
      const newMessage = await sendMessageService(receiverId, body);
      
      // Optimistic update for active conversation
      if (activeConversation && 
          (receiverId === activeConversation || user.id === activeConversation)) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      // Update conversations list
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user?.id, activeConversation, loadConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(user.id, {
      onNewMessage: (newMessage) => {
        // Update conversations list
        loadConversations();
        
        // Update active conversation if it matches
        if (activeConversation && 
            (newMessage.sender_id === activeConversation || 
             newMessage.receiver_id === activeConversation)) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Update unread count if we're the receiver
        if (newMessage.receiver_id === user.id) {
          setUnreadCount(prev => prev + 1);
        }
      },
      onMessageUpdate: (updatedMessage) => {
        // Handle message updates (e.g., read status)
        setMessages(prev => 
          prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
        
        // Reload conversations to update read status
        loadConversations();
      },
      onMessageDelete: (messageId) => {
        // Remove deleted message from active conversation
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Reload conversations
        loadConversations();
      }
    });

    return unsubscribe;
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
    sendMessage,
    loadConversation,
    loadConversations,
    setActiveConversation
  };
};

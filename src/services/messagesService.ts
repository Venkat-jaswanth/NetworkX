import { supabase } from "@/lib/supabase";
import type { Message, MessageWithUsers } from "@/types/app.types";
import type { User } from "@supabase/supabase-js";

// Type definition for conversation user
interface ConversationUser {
  id: string;
  full_name: string;
  profile_picture_url: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Send a message
export async function sendMessage(user: User, receiverId: string, body: string): Promise<Message> {
  const { data, error } = await supabase
    .from('Messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      body: body,
      read_at: user.id === receiverId ? new Date().toISOString() : null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get conversation between current user and another user
export async function getConversation(user: User, otherUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get all conversations for current user
export async function getUserMessages(user: User): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get unread messages for current user
export async function getUnreadMessages(user: User): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('receiver_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Mark all messages from a sender as read
export async function markConversationAsRead(user: User, senderId: string): Promise<void> {
  const { error } = await supabase
    .from('Messages')
    .update({ read_at: new Date().toISOString() })
    .or(`and(receiver_id.eq.${user.id},sender_id.eq.${senderId}),and(receiver_id.eq.${senderId},sender_id.eq.${user.id})`)
    .is('read_at', null);
  
  if (error) throw error;
}

// Delete a message (only if current user is sender)
export async function deleteMessage(user: User, messageId: number): Promise<void> {
  const { error } = await supabase
    .from('Messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id);
  
  if (error) throw error;
}

// Get unread message count for current user
export async function getUnreadMessageCount(user: User): Promise<number> {
  const { count, error } = await supabase
    .from('Messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .is('read_at', null);
  
  if (error) throw error;
  return count || 0;
}

// Get recent conversations for current user
export async function getRecentConversations(user: User, limit: number = 10): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// NEW: Real-time subscription helpers
export function subscribeToMessages(userId: string, callbacks: {
  onNewMessage: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onMessageDelete?: (messageId: number) => void;
  channelName: string;
}) {
  const channel = supabase
    .channel(callbacks.channelName)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `receiver_id=eq.${userId}`
            },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onNewMessage(message);
      }
    )
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `sender_id=eq.${userId}`
      },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onNewMessage(message);
      }
    )
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onMessageUpdate?.(message);
      }
    )
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Messages',
        filter: `sender_id=eq.${userId}`
      },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onMessageUpdate?.(message);
      }
    )
    .on('postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'Messages',
      },
      (payload) => {
        if (payload.old.receiver_id === userId || payload.old.sender_id === userId) {
          callbacks.onMessageDelete?.(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Get conversations with user details using a single optimized query
export async function getConversationsWithDetails(user: User): Promise<ConversationUser[]> {
  // Single query to get all messages with user details
  const { data, error } = await supabase
    .from('Messages')
    .select(`
      id,
      body,
      created_at,
      read_at,
      sender_id,
      receiver_id,
      sender:Users!Messages_sender_id_fkey(*),
      receiver:Users!Messages_receiver_id_fkey(*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Process data at UI level
  const conversationMap = new Map<string, ConversationUser>();
  
    data.forEach((message: MessageWithUsers) => {
      const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId,
          full_name: otherUser.full_name,
          profile_picture_url: otherUser.profile_picture_url,
          lastMessage: message.body,
          lastMessageTime: message.created_at,
          unreadCount: 0
        });
      }
      
      // Count unread messages
      if (message.receiver_id === user.id && !message.read_at) {
        const conversation = conversationMap.get(otherUserId);
        if (conversation) {
          conversation.unreadCount++;
        }
      }
    });

    return Array.from(conversationMap.values());
  }
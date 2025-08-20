import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/app.types";
import { getAuthUser } from "./authService";

// Send a message
export async function sendMessage(receiverId: string, body: string): Promise<Message> {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from('Messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      body: body
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get conversation between current user and another user
export async function getConversation(otherUserId: string): Promise<Message[]> {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get all conversations for current user
export async function getAuthUserConversations(): Promise<Message[]> {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get unread messages for current user
export async function getUnreadMessages(): Promise<Message[]> {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('receiver_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Mark message as read (only if current user is receiver)
export async function markMessageAsRead(messageId: number): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('Messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('receiver_id', user.id);
  
  if (error) throw error;
}

// Mark all messages from a sender as read
export async function markConversationAsRead(senderId: string): Promise<void> {
  const user = await getAuthUser();

  const { error } = await supabase
    .from('Messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', user.id)
    .eq('sender_id', senderId)
    .is('read_at', null);
  
  if (error) throw error;
}

// Delete a message (only if current user is sender)
export async function deleteMessage(messageId: number): Promise<void> {
  const user = await getAuthUser();

  const { error } = await supabase
    .from('Messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id);
  
  if (error) throw error;
}

// Get message by ID (only if current user is sender or receiver)
export async function getMessage(messageId: number): Promise<Message> {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('id', messageId)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .single();
  
  if (error) throw error;
  return data;
}

// Get unread message count for current user
export async function getUnreadMessageCount(): Promise<number> {
  const user = await getAuthUser();

  const { count, error } = await supabase
    .from('Messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .is('read_at', null);
  
  if (error) throw error;
  return count || 0;
}

// Get recent conversations for current user
export async function getRecentConversations(limit: number = 10): Promise<Message[]> {
  const user = await getAuthUser();

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
}) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'Messages',
        filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`
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
        filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`
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
        filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`
      },
      (payload) => {
        callbacks.onMessageDelete?.(payload.old.id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Helper to get conversation partner ID
export function getConversationPartner(message: Message, currentUserId: string): string {
  return message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
}

// Process messages into conversations with user details
export async function processMessagesToConversations(messages: Message[], currentUserId: string) {
  // Get unique conversation partners
  const peerIds = new Set<string>();
  messages.forEach(m => {
    const other = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
    peerIds.add(other);
  });

  // Import user service here to avoid circular dependency
  const { getProfileById } = await import('./userService');

  // Fetch user details for each conversation partner
  const conversationsData = await Promise.all(
    Array.from(peerIds).map(async (userId) => {
      try {
        const userData = await getProfileById(userId);
        if (!userData) return null;

        // Get messages for this conversation
        const userMessages = messages.filter(m => 
          (m.sender_id === userId && m.receiver_id === currentUserId) ||
          (m.sender_id === currentUserId && m.receiver_id === userId)
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const lastMessage = userMessages[0];
        const unreadCount = userMessages.filter(m => 
          m.receiver_id === currentUserId && !m.read_at
        ).length;

        return {
          id: userId,
          full_name: userData.full_name,
          profile_picture_url: userData.profile_picture_url,
          lastMessage: lastMessage?.body || 'No messages yet',
          lastMessageTime: lastMessage?.created_at || '',
          unreadCount
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    })
  );

  return conversationsData.filter(Boolean);
} 
import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/User.types";

// Send a message
export async function sendMessage(senderId: string, receiverId: string, body: string): Promise<Message> {
  const { data, error } = await supabase
    .from('Messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      body: body
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get conversation between two users
export async function getConversation(userId1: string, userId2: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get unread messages for a user
export async function getUnreadMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('receiver_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Mark message as read
export async function markMessageAsRead(messageId: number): Promise<void> {
  const { error } = await supabase
    .from('Messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);
  
  if (error) throw error;
}

// Mark all messages from a sender as read
export async function markConversationAsRead(userId: string, senderId: string): Promise<void> {
  const { error } = await supabase
    .from('Messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', senderId)
    .is('read_at', null);
  
  if (error) throw error;
}

// Delete a message (only sender can delete)
export async function deleteMessage(messageId: number, senderId: string): Promise<void> {
  const { error } = await supabase
    .from('Messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', senderId);
  
  if (error) throw error;
}

// Get message by ID
export async function getMessage(messageId: number): Promise<Message> {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('id', messageId)
    .single();
  
  if (error) throw error;
  return data;
}

// Get unread message count for a user
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('Messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null);
  
  if (error) throw error;
  return count || 0;
}

// Get recent conversations (last message from each conversation)
export async function getRecentConversations(userId: string, limit: number = 10): Promise<Message[]> {
  // This is a simplified version - in a real app, you might want to use a more complex query
  // to get the actual last message from each conversation
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
} 
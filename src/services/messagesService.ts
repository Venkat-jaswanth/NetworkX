import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/User.types";
import { getUser } from "./authService";

// Send a message
export async function sendMessage(receiverId: string, body: string): Promise<Message> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get all conversations for current user
export async function getUserConversations(): Promise<Message[]> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('Messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id);
  
  if (error) throw error;
}

// Get message by ID (only if current user is sender or receiver)
export async function getMessage(messageId: number): Promise<Message> {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

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
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
} 
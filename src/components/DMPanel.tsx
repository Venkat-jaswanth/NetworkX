import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/services/authService';
import { getAuthUserConversations, getConversation, sendMessage } from '@/services/messagesService';
import type { Message } from '@/types/app.types';
import '@/css/dm.css';

interface DMPanelProps {
  otherUserId?: string; // if provided, open this conversation
  onClose?: () => void;
}

export default function DMPanel({ otherUserId, onClose }: DMPanelProps) {
  const [authUserId, setAuthUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Message[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | undefined>(otherUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const u = await getAuthUser();
      setAuthUserId(u.id);
      const conv = await getAuthUserConversations();
      setConversations(conv);
      setLoading(false);
    })();
  }, []);

  // Load thread when active user changes
  useEffect(() => {
    if (!activeUserId) return;
    (async () => {
      const msgs = await getConversation(activeUserId);
      setMessages(msgs);
      scrollToBottom();
    })();
  }, [activeUserId]);

  // Realtime subscription for new messages to or from me
  useEffect(() => {
    if (!authUserId) return;
    const channel = supabase
      .channel(`dm:${authUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages' }, payload => {
        const msg = payload.new as Message;
        if (msg.sender_id === authUserId || msg.receiver_id === authUserId) {
          // Update conversations preview list
          setConversations(prev => [msg, ...prev]);
          // If current thread matches, append
          if (activeUserId && (msg.sender_id === activeUserId || msg.receiver_id === activeUserId)) {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUserId, activeUserId]);

  const peers = useMemo(() => {
    // Derive list of peer userIds from conversations (naive: take the other side of each message)
    const set = new Set<string>();
    conversations.forEach(m => {
      const other = m.sender_id === authUserId ? m.receiver_id : m.sender_id;
      set.add(other);
    });
    return Array.from(set);
  }, [conversations, authUserId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeUserId) return;
    setInput('');
    await sendMessage(activeUserId, text);
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  if (loading) return null;

  return (
    <div className="dm-container">
      <div className="dm-sidebar">
        <div className="dm-header">
          <h3>Messages</h3>
          {onClose && (
            <button className="dm-close" onClick={onClose}>×</button>
          )}
        </div>
        <div className="dm-peers">
          {peers.length === 0 && <div className="dm-empty">No conversations yet</div>}
          {peers.map(uid => (
            <button
              key={uid}
              className={`dm-peer ${activeUserId === uid ? 'active' : ''}`}
              onClick={() => setActiveUserId(uid)}
            >
              {uid}
            </button>
          ))}
        </div>
      </div>

      <div className="dm-thread">
        {!activeUserId ? (
          <div className="dm-placeholder">Select a conversation</div>
        ) : (
          <>
            <div className="dm-messages" ref={listRef}>
              {messages.map(m => (
                <div key={m.id} className={`dm-msg ${m.sender_id === authUserId ? 'me' : 'them'}`}>
                  <div className="dm-bubble">{m.body}</div>
                </div>
              ))}
            </div>
            <div className="dm-input">
              <input
                placeholder="Write a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="nav-btn primary" onClick={handleSend}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

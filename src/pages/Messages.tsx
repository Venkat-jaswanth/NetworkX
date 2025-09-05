import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthQuery } from '@/hooks/queries/useAuthQuery';
import { useMessages } from '@/hooks/useMessages';
import { FaSearch, FaPaperPlane, FaEllipsisV, FaUser } from 'react-icons/fa';
import '@/css/messages.css';
import Loader from '@/components/Loader';

export default function Messages() {
  const { data: user } = useAuthQuery();
  const {
    conversations,
    messages,
    activeConversation,
    // unreadCount,
    loading,  
    sendMessage,
    loadConversation,
  } = useMessages();
  
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(user => 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeConversation) return;
    
    try {
      await sendMessage(activeConversation, text);
      setInput('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      inputRef.current?.focus();
      // Scroll to bottom after sending
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* <div className="messages-header">
        {unreadCount > 0 && (
          <div className="unread-badge">
            {unreadCount} unread
          </div>
        )}
      </div> */}

      <div className="messages-container">
        <div className="conversations-sidebar">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-state">
                <FaUser className="empty-icon" />
                <h3>No conversations yet</h3>
                <p>Start connecting with other professionals</p>
              </div>
            ) : (
              filteredConversations.map(user => (
                <div
                  key={user.id}
                  className={`conversation-item ${activeConversation === user.id ? 'active' : ''}`}
                  onClick={() => loadConversation(user.id)}
                >
                  <div className="conversation-avatar">
                    {user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt={user.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.full_name.charAt(0)}
                      </div>
                    )}
                    {user.unreadCount > 0 && (
                      <div className="unread-indicator">
                        {user.unreadCount > 9 ? '9+' : user.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{user.full_name}</h4>
                      <span className="conversation-time">
                        {formatTime(user.lastMessageTime)}
                      </span>
                    </div>
                    <p className="conversation-preview">
                      {user.lastMessage.length > 50 
                        ? user.lastMessage.substring(0, 50) + '...' 
                        : user.lastMessage
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-area">
          {!activeConversation ? (
            <div className="chat-placeholder">
              <FaUser className="placeholder-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  {(() => {
                    const conversationUser = conversations.find(u => u.id === activeConversation);
                    return (
                      <>
                        <div className="chat-avatar">
                          {conversationUser?.profile_picture_url ? (
                            <img src={conversationUser.profile_picture_url} alt={conversationUser.full_name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {conversationUser?.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="chat-user-details">
                          <h3>{conversationUser?.full_name}</h3>
                          <span className="chat-status">Online</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="chat-actions">
                  <button className="action-btn">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              <div className="messages-list" ref={listRef}>
                {messages.length === 0 ? (
                  <div className="messages-empty">
                    <p>No messages yet</p>
                    <p>Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`message-item ${m.sender_id === user?.id ? 'sent' : 'received'}`}>
                      <div className="message-bubble">
                        <p>{m.body}</p>
                        <span className="message-time">
                          {formatTime(m.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="message-input">
                <div className="input-container">
                  <textarea
                    ref={inputRef}
                    placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="message-input-field"
                    rows={1}
                  />
                  <button 
                    className="send-button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    title="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

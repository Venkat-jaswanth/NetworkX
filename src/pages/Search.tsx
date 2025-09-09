import { useState, useEffect } from 'react';
import { searchUsers, getSearchSuggestions, type UserSearchResult, getProfileById } from '@/services/userService';
import { useFollowStatus } from '@/hooks/useFollowStatus';
import { sendMessage } from '@/services/messagesService';
import { useAuthQuery } from '@/hooks/queries/useAuthQuery';
import UserProfileCard from '@/components/UserProfileCard';
import UserAvatar from '@/components/UserAvatar';
import UserProfileView from '@/components/UserProfileView';
import '@/css/search.css';

export default function Search() {
  const { data: user } = useAuthQuery();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [busy, setBusy] = useState<string>('');
  const [dmOpenFor, setDmOpenFor] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState<string>('');

  // Refresh data periodically for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (search.trim() && results.length > 0) {
        setRefreshKey(prev => prev + 1);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [search, results.length]);

  // Refresh search results when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && search.trim()) {
      searchUsersHandler();
    }
  }, [refreshKey]);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (search.trim().length >= 2) {
        try {
          const suggestionsData = await getSearchSuggestions(search.trim());
          setSuggestions(suggestionsData);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const searchUsersHandler = async () => {
    setLoadingSearch(true);
    setShowSuggestions(false);
    try {
      const searchResults = await searchUsers(search.trim());
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    setBusy(userId);
    try {
      const { followUser, unfollowUser, isFollowing } = await import('@/services/followsService');
      const currentlyFollowing = await isFollowing(userId);
      
      if (currentlyFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      // Refresh search results to get updated data
      if (search.trim()) {
        const updatedResults = await searchUsers(search.trim());
        setResults(updatedResults);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setBusy('');
    }
  };

  const handleSuggestionClick = (suggestion: UserSearchResult) => {
    setSearch(suggestion.full_name);
    setShowSuggestions(false);
    setResults([suggestion]);
    handleUserSelect(suggestion);
  };

  const handleUserSelect = async (user: UserSearchResult) => {
    setSelectedUser(user);
    setLoadingUserDetails(true);
    setShowSuggestions(false);
    
    try {
      // Fetch detailed user information
      const userDetails = await getProfileById(user.id);
      setSelectedUserDetails(userDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUserDetails(null);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
    setSearch('');
    setResults([]);
  };

  const handleInputFocus = () => {
    if (search.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleMessageClick = (userId: string) => {
    setDmOpenFor(userId);
    setMessageInput('');
  };

  const handleSendDirectMessage = async (userId: string, message: string) => {
    if (!message.trim()) return;
    
    setSendingMessage(userId);
    try {
      await sendMessage(user!, userId, message.trim());
      setMessageInput('');
      // Optionally close the modal after sending
      setTimeout(() => setDmOpenFor(undefined), 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendDirectMessage(userId, messageInput);
    }
  };

    return (
    <div className="search-page-container">
      {selectedUser ? (
        <UserProfileView 
          user={selectedUser}
          userDetails={selectedUserDetails}
          loading={loadingUserDetails}
          isOwnProfile={false}
          onBack={handleBackToSearch}
          onFollowToggle={handleFollowToggle}
          onMessageClick={() => handleMessageClick(selectedUser.id)}
          busy={busy}
          backButtonText="Back to Search"
        />
      ) : (
        <>
          <div className="search-page-header">
            <h1>Search Users</h1>
            <p>Find and connect with other professionals</p>
            {results.length > 0 && (
              <button 
                className="refresh-btn"
                onClick={() => setRefreshKey(prev => prev + 1)}
                title="Refresh results"
              >
                🔄 Refresh
              </button>
            )}
          </div>

          <div className="search-section">
            <div className="search-input-container">
              <div className="search-input-wrapper">
                <input
                  className="search-input"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={e => e.key === 'Enter' && searchUsersHandler()}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map(suggestion => (
                      <div
                        key={suggestion.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <UserAvatar
                          user={suggestion}
                          size="small"
                        />
                        <div className="suggestion-info">
                          <div className="suggestion-name">{suggestion.full_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="search-btn" onClick={searchUsersHandler} disabled={loadingSearch}>
                {loadingSearch ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="search-results">
              {results.length === 0 && !loadingSearch && search.trim() && (
                <div className="no-results">
                  <p>No users found matching your search.</p>
                </div>
              )}
              
              {results.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onFollowToggle={handleFollowToggle}
                  onMessageClick={() => handleMessageClick(user.id)}
                  onUserSelect={handleUserSelect}
                  busy={busy}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {dmOpenFor && (
        <div className="dm-overlay">
          <div className="dm-modal">
            <div className="dm-modal-header">
              <h3>Send Message</h3>
              <button className="close-btn" onClick={() => setDmOpenFor(undefined)}>×</button>
            </div>
            <div className="dm-modal-content">
              <div className="dm-user-info">
                {(() => {
                  const user = results.find(u => u.id === dmOpenFor) || selectedUser;
                  return user ? (
                    <>
                      <UserAvatar
                        user={user}
                        size="medium"
                        className="dm-avatar"
                      />
                      <div className="dm-user-details">
                        <h4>{user.full_name}</h4>
                        <p>Send a direct message</p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              <div className="dm-input-container">
                <textarea
                  className="dm-message-input"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, dmOpenFor)}
                  rows={3}
                />
                                  <div className="dm-actions">
                    <button 
                      className="dm-send-btn"
                      onClick={() => handleSendDirectMessage(dmOpenFor, messageInput)}
                      disabled={!messageInput.trim() || sendingMessage === dmOpenFor}
                    >
                      {sendingMessage === dmOpenFor ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UserCard Component with real-time follow status
function UserCard({ 
  user, 
  onFollowToggle, 
  onMessageClick, 
  onUserSelect,
  busy 
}: { 
  user: UserSearchResult; 
  onFollowToggle: (userId: string) => Promise<void>; 
  onMessageClick: () => void; 
  onUserSelect: (user: UserSearchResult) => Promise<void>;
  busy: string; 
}) {
  const { following, loading, updateFollowStatus } = useFollowStatus(user.id);

  const handleFollowClick = async () => {
    try {
      await onFollowToggle(user.id);
      // Update the local state immediately for better UX
      updateFollowStatus(!following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleCardClick = () => {
    onUserSelect(user);
  };

  const actions = (
    <>
      <button
        className={`action-btn ${following ? 'primary' : 'secondary'}`}
        disabled={busy === user.id || loading}
        onClick={handleFollowClick}
      >
        {busy === user.id ? '...' : loading ? 'Loading...' : following ? 'Following' : 'Follow'}
      </button>
      <button
        className="action-btn secondary"
        onClick={onMessageClick}
      >
        Message
      </button>
    </>
  );

  return (
    <UserProfileCard
      user={user}
      variant="full"
      showBio={false}
      showRole={false}
      onClick={handleCardClick}
      actions={actions}
      className="search-user-card"
    />
  );
}


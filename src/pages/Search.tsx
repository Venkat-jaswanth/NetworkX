import { useState, useEffect } from 'react';
import { searchUsers, getSearchSuggestions, type UserSearchResult, getProfileById } from '@/services/userService';
import { useFollowStatus } from '@/hooks/useFollowStatus';
import { sendMessage } from '@/services/messagesService';
import '@/css/search.css';
import Loader from '@/components/Loader';

export default function Search() {
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
      await sendMessage(userId, message.trim());
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
          onBack={handleBackToSearch}
          onFollowToggle={handleFollowToggle}
          onMessageClick={() => handleMessageClick(selectedUser.id)}
          busy={busy}
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
                        <div className="suggestion-avatar">
                          <div className="avatar-placeholder small">
                            {suggestion.full_name.charAt(0)}
                          </div>
                        </div>
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
                  return (
                    <>
                      <div className="dm-avatar">
                        <div className="avatar-placeholder">
                          {user?.full_name.charAt(0)}
                        </div>
                      </div>
                      <div className="dm-user-details">
                        <h4>{user?.full_name}</h4>
                        <p>Send a direct message</p>
                      </div>
                    </>
                  );
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

  return (
    <div className="user-card" onClick={handleCardClick}>
      <div className="user-avatar">
        <div className="avatar-placeholder">{user.full_name.charAt(0)}</div>
      </div>
      <div className="user-info">
        <h3>{user.full_name}</h3>
        <p className="user-id">{user.id}</p>
      </div>
      <div className="user-actions" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}

// UserProfileView Component - Detailed profile view
function UserProfileView({ 
  user, 
  userDetails, 
  loading, 
  onBack, 
  onFollowToggle, 
  onMessageClick, 
  busy 
}: { 
  user: UserSearchResult; 
  userDetails: any; 
  loading: boolean; 
  onBack: () => void; 
  onFollowToggle: (userId: string) => Promise<void>; 
  onMessageClick: () => void; 
  busy: string; 
}) {
  const { following, loading: followLoading, updateFollowStatus } = useFollowStatus(user.id);

  const handleFollowClick = async () => {
    try {
      await onFollowToggle(user.id);
      updateFollowStatus(!following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-view">
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Search
          </button>
        </div>
        <div className="page-container">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-view">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Search
        </button>
        <div className="profile-actions">
          <button 
            className={`action-btn ${following ? 'primary' : 'secondary'}`}
            disabled={busy === user.id || followLoading} 
            onClick={handleFollowClick}
          >
            {busy === user.id ? '...' : followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
          </button>
          <button 
            className="action-btn secondary" 
            onClick={onMessageClick}
          >
            Message
          </button>
        </div>
      </div>

      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-avatar-large">
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.full_name} />
            ) : (
              <div className="avatar-placeholder-large">
                {user.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="hero-info">
            <h1 className="profile-name">{user.full_name}</h1>
            <p className="profile-role">{userDetails?.role || 'Member'}</p>
            <p className="profile-bio">{userDetails?.bio || 'No bio available'}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="content-grid">
          <div className="content-left">
            <div className="profile-section">
              <h2 className="section-header">About</h2>
              <div className="section-content">
                <p>{userDetails?.bio || 'No information available'}</p>
              </div>
            </div>

            {userDetails?.education && userDetails.education.length > 0 && (
              <div className="profile-section">
                <h2 className="section-header">Education</h2>
                <div className="section-content">
                  <div className="education-list">
                    {userDetails.education.map((edu: any, index: number) => (
                      <div key={index} className="education-item">
                        <div className="education-header">
                          <h3>{edu.degree}</h3>
                        </div>
                        <p className="degree-info">{edu.institution}</p>
                        <p className="graduation-year">{edu.graduation_year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {userDetails?.workExperience && userDetails.workExperience.length > 0 && (
              <div className="profile-section">
                <h2 className="section-header">Work Experience</h2>
                <div className="section-content">
                  <div className="experience-list">
                    {userDetails.workExperience.map((exp: any, index: number) => (
                      <div key={index} className="experience-item">
                        <div className="experience-header">
                          <h3>{exp.job_title}</h3>
                        </div>
                        <p className="company-name">{exp.company_name}</p>
                        <p className="experience-dates">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </p>
                        <p>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="content-right">
            <div className="profile-section">
              <h2 className="section-header">Profile Info</h2>
              <div className="section-content">
                <div className="info-item">
                  <strong>User ID:</strong> {user.id}
                </div>
                <div className="info-item">
                  <strong>Role:</strong> {userDetails?.role || 'Member'}
                </div>
                {userDetails?.location && (
                  <div className="info-item">
                    <strong>Location:</strong> {userDetails.location}
                  </div>
                )}
                {userDetails?.website && (
                  <div className="info-item">
                    <strong>Website:</strong> 
                    <a href={userDetails.website} target="_blank" rel="noopener noreferrer">
                      {userDetails.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

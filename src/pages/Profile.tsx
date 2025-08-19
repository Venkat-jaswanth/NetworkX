import { useEffect, useState } from 'react';
import { getAuthUser } from '@/services/authService';
import { getFollowers, getFollowerCount, getFollowing, getFollowingCount, followUser, unfollowUser, isFollowing } from '@/services/followsService';
import { getAppUser, searchUsers, getSearchSuggestions, type UserSearchResult } from '@/services/userService';
import DMPanel from '@/components/DMPanel';
import '@/css/profile.css';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dmOpenFor, setDmOpenFor] = useState<string | undefined>();
  const [busy, setBusy] = useState<string>('');

  useEffect(() => {
    (async () => {
      const au = await getAuthUser();
      const appUser = await getAppUser();
      setUser(appUser);
      
      const [flw, flwg, flwCnt, flwgCnt] = await Promise.all([
        getFollowers(au.id),
        getFollowing(au.id),
        getFollowerCount(au.id),
        getFollowingCount(au.id),
      ]);
      setFollowers(flw.map(f => f.follower_id));
      setFollowing(flwg.map(f => f.following_id));
      setFollowerCount(flwCnt);
      setFollowingCount(flwgCnt);
    })();
  }, []);

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

  const handleFollowToggle = async (userId: string) => {
    setBusy(userId);
    try {
      const currentlyFollowing = await isFollowing(userId);
      if (currentlyFollowing) {
        await unfollowUser(userId);
        setFollowing(prev => prev.filter(id => id !== userId));
        setFollowerCount(prev => prev); // unchanged
      } else {
        await followUser(userId);
        setFollowing(prev => [userId, ...prev]);
      }
    } finally {
      setBusy('');
    }
  };

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

  const handleSuggestionClick = (suggestion: UserSearchResult) => {
    setSearch(suggestion.full_name);
    setShowSuggestions(false);
    setResults([suggestion]);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Profile</h1>
        <p>Manage your connections and profile</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="card-header">
            <h3>Profile Overview</h3>
          </div>
          <div className="profile-summary">
            <div className="profile-avatar">
              <div className="avatar-placeholder">{user?.full_name?.charAt(0)}</div>
            </div>
            <div className="profile-details">
              <h4>{user?.full_name}</h4>
              <p className="role-badge">{user?.role}</p>
              <p className="bio-text">{user?.bio}</p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h3>Your Connections</h3>
          </div>
          <div className="connections-grid">
            <div className="connection-section">
              <h4>Followers ({followerCount})</h4>
              <div className="connection-list">
                {followers.map(id => (
                  <span key={id} className="connection-tag">{id}</span>
                ))}
              </div>
            </div>
            <div className="connection-section">
              <h4>Following ({followingCount})</h4>
              <div className="connection-list">
                {following.map(id => (
                  <span key={id} className="connection-tag">{id}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="card-header">
          <h3>Search Users</h3>
        </div>
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
          {results.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-avatar">
                <div className="avatar-placeholder">{u.full_name.charAt(0)}</div>
              </div>
              <div className="user-info">
                <h4>{u.full_name}</h4>
                <p className="user-id">{u.id}</p>
              </div>
              <div className="user-actions">
                <button 
                  className="action-btn secondary" 
                  disabled={busy === u.id} 
                  onClick={() => handleFollowToggle(u.id)}
                >
                  {busy === u.id ? '...' : 'Follow'}
                </button>
                <button 
                  className="action-btn primary" 
                  onClick={() => setDmOpenFor(u.id)}
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dmOpenFor && (
        <div className="dm-overlay">
          <div className="dm-modal">
            <div className="dm-modal-header">
              <h3>Direct Message</h3>
              <button className="close-btn" onClick={() => setDmOpenFor(undefined)}>×</button>
            </div>
            <DMPanel otherUserId={dmOpenFor} onClose={() => setDmOpenFor(undefined)} />
          </div>
        </div>
      )}
    </div>
  );
}

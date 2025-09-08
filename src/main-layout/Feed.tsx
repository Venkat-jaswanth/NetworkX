import { useState } from 'react';
import Loader from '@/components/Loader';
import MarkdownEditor from '@/components/MarkdownEditor';
import PostCard from '@/components/PostCard';
import Comment from '@/components/Comment';
import { useFeedQuery, useCreatePost, useToggleLike, useCommentsQuery, useAddComment } from '@/hooks/queries/useFeedQuery';
import { useProfileNavigation } from '@/hooks/useProfileNavigation';
import '@/css/feed.css';

const Feed = () => {
  const [scope, setScope] = useState<'public' | 'following'>('public');
  const { data, isLoading, isError } = useFeedQuery(scope);
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const { navigateToProfile, selectedUserId, selectedUserDetails, isLoading: profileLoading, clearProfile, isViewingProfile } = useProfileNavigation();

  const [body, setBody] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;

    await addComment.mutateAsync({ postId, body: text });
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  const handleUserClick = (userId: string) => {
    navigateToProfile(userId);
  };

  if (isLoading) return <div className="feed-container"><Loader /></div>;
  if (isError) return <div className="feed-container"><p>Failed to load feed.</p></div>;

  // If viewing a profile, show the profile view
  if (isViewingProfile) {
    return (
      <div className="feed-container">
        <UserProfileView
          selectedUserId={selectedUserId}
          selectedUserDetails={selectedUserDetails}
          profileLoading={profileLoading}
          onBack={clearProfile}
        />
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="feed-title-section">
          <h1>Feed</h1>
          <p>See what people are sharing</p>
        </div>
        <div className="feed-scope-toggle">
          <button className="scope-button" onClick={() => setScope('public')} disabled={scope === 'public'}>Public</button>
          <button className="scope-button" onClick={() => setScope('following')} disabled={scope === 'following'}>Following</button>
        </div>
      </div>

      <form
        className="feed-create-post"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          await createPost.mutateAsync({ body });
          setBody('');
        }}
      >
        <MarkdownEditor
          value={body}
          onChange={setBody}
          placeholder="Share something... (supports **bold**, *italic*, `code`, [links](url), and images)"
          rows={4}
          allowImageUpload={true}
        />
        <div className="create-post-actions">
          <button className="post-button" type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      <div className="feed-posts">
        {(data ?? []).map(p => (
          <div key={p.id}>
            <PostCard
              post={p}
              onLike={() => toggleLike.mutate(p.id)}
              onComment={() => toggleComments(p.id)}
              onUserClick={handleUserClick}
              showComments={expandedComments.has(p.id)}
              isLiking={toggleLike.isPending}
            />

            {expandedComments.has(p.id) && (
              <CommentsSection
                postId={p.id}
                commentText={commentTexts[p.id] || ''}
                onCommentTextChange={(text) => setCommentTexts(prev => ({ ...prev, [p.id]: text }))}
                onAddComment={() => handleAddComment(p.id)}
                isAddingComment={addComment.isPending}
                onUserClick={handleUserClick}
              />
            )}
          </div>
        ))}
        {data?.length === 0 && (
          <div className="feed-empty">
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// CommentsSection component
interface CommentsSectionProps {
  postId: string;
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onAddComment: () => void;
  isAddingComment: boolean;
  onUserClick: (userId: string) => void;
}

function CommentsSection({
  postId,
  commentText,
  onCommentTextChange,
  onAddComment,
  isAddingComment,
  onUserClick
}: CommentsSectionProps) {
  const { data: comments, isLoading: commentsLoading } = useCommentsQuery(postId, { enabled: true });

  return (
    <div className="comments-section">
      <div className="comments-header">
        <span className="comments-count">
          {comments?.length || 0} {(comments?.length || 0) === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {commentsLoading ? (
        <Loader />
      ) : (
        <div className="comments-list">
          {(comments ?? []).map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onUserClick={onUserClick}
            />
          ))}
        </div>
      )}

      <div className="comment-form">
        <textarea
          className="comment-input"
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          placeholder="Write a comment... (supports markdown)"
          rows={2}
        />
        <div className="comment-actions">
          <button
            className="comment-button"
            onClick={onAddComment}
            disabled={!commentText.trim() || isAddingComment}
          >
            {isAddingComment ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// UserProfileView Component for viewing user profiles from feed
interface UserProfileViewProps {
  selectedUserId: string | null;
  selectedUserDetails: any;
  profileLoading: boolean;
  onBack: () => void;
}

function UserProfileView({
  selectedUserDetails,
  profileLoading,
  onBack
}: UserProfileViewProps) {
  if (profileLoading) {
    return (
      <div className="profile-view">
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Feed
          </button>
        </div>
        <div className="profile-loading">
          <Loader />
        </div>
      </div>
    );
  }

  if (!selectedUserDetails) {
    return (
      <div className="profile-view">
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Feed
          </button>
        </div>
        <div className="profile-error">
          <h3>Profile not found</h3>
          <p>Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Feed
        </button>
      </div>

      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="feed-profile-avatar">
            {selectedUserDetails.profile_picture_url ? (
              <img
                src={selectedUserDetails.profile_picture_url}
                alt={selectedUserDetails.full_name}
                className="feed-profile-img"
              />
            ) : (
              <div className="feed-avatar-placeholder">
                {selectedUserDetails.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="hero-info">
            <h1 className="profile-name">{selectedUserDetails.full_name}</h1>
            <p className="profile-role">{selectedUserDetails.role || 'Member'}</p>
            <p className="profile-bio">{selectedUserDetails.bio || 'No bio available'}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="content-grid">
          <div className="content-left">
            <div className="profile-section">
              <h2 className="section-header">About</h2>
              <div className="section-content">
                <p>{selectedUserDetails.bio || 'No information available'}</p>
              </div>
            </div>
          </div>

          <div className="content-right">
            <div className="profile-section">
              <h2 className="section-header">Profile Info</h2>
              <div className="section-content">
                <div className="info-item">
                  <strong>Role:</strong> {selectedUserDetails.role || 'Member'}
                </div>
                <div className="info-item">
                  <strong>Member since:</strong> {new Date(selectedUserDetails.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;

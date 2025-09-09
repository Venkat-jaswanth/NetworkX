import { useState } from 'react';
import Loader from '@/components/Loader';
import MarkdownEditor from '@/components/MarkdownEditor';
import PostCard from '@/components/PostCard';
import Comment from '@/components/Comment';
import UserProfileView from '@/components/UserProfileView';
import { useFeedQuery, useCreatePost, useToggleLike, useCommentsQuery, useAddComment } from '@/hooks/queries/useFeedQuery';
import { useProfileNavigation } from '@/hooks/useProfileNavigation';
import '@/css/feed.css';

const Feed = () => {
  const [scope, setScope] = useState<'public' | 'following'>('public');
  const { data, isLoading, isError } = useFeedQuery(scope);
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const { navigateToProfile, selectedUserDetails, isLoading: profileLoading, clearProfile, isViewingProfile } = useProfileNavigation();

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
          user={selectedUserDetails}
          loading={profileLoading}
          isOwnProfile={false}
          onBack={clearProfile}
          backButtonText="Back to Feed"
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


export default Feed;

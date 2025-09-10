import React from 'react';
import UserAvatar from './UserAvatar';
import MarkdownRenderer from './MarkdownRenderer';
import './PostCard.css';

export interface PostCardProps {
  post: {
    id: string;
    title?: string | null;
    body: string;
    media_url?: string | null;
    like_count: number;
    comment_count: number;
    visibility: string;
    created_at: string;
    author?: {
      id: string;
      full_name: string;
      profile_picture_url?: string | null;
      role?: string;
    } | null;
    isLikedByUser?: boolean;
  };
  onLike: () => void;
  onComment: () => void;
  onUserClick?: (userId: string) => void;
  showComments?: boolean;
  isLiking?: boolean;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onUserClick,
  showComments = false,
  isLiking = false,
  className = ''
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleUserClick = () => {
    if (post.author && onUserClick) {
      onUserClick(post.author.id);
    }
  };

  const cardClasses = [
    'post-card',
    className
  ].filter(Boolean).join(' ');

  return (
    <article className={cardClasses}>
      {/* Post Header */}
      <header className="post-card__header">
        <div className="post-card__author" onClick={handleUserClick}>
          <UserAvatar 
            user={post.author || { id: '', full_name: 'Unknown User' }}
            size="medium"
            onClick={onUserClick}
          />
          <div className="post-card__author-info">
            <button
              className="post-card__author-name"
              onClick={handleUserClick}
            >
              {post.author?.full_name || 'Unknown User'}
            </button>
            <div className="post-card__meta">
              {post.author?.role && (
                <span className="post-card__role">{post.author.role}</span>
              )}
              <span className="post-card__timestamp">
                {formatTimeAgo(post.created_at)}
              </span>
              <span className="post-card__visibility">
                {post.visibility === 'public' ? '🌍' : '👥'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div className="post-card__content">
        {post.title && (
          <h3 className="post-card__title">{post.title}</h3>
        )}
        
        <div className="post-card__body">
          <MarkdownRenderer content={post.body} />
        </div>

        {post.media_url && (
          <div className="post-card__media">
            <img 
              src={post.media_url} 
              alt="Post media"
              className="post-card__media-img"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <footer className="post-card__footer">
        <div className="post-card__actions">
          <button 
            className={`post-card__action ${post.isLikedByUser ? 'post-card__action--active' : ''}`}
            onClick={onLike}
            disabled={isLiking}
          >
            <span className="post-card__action-icon">
              {post.isLikedByUser ? `❤️ ${post.like_count} ${post.like_count === 1 ? 'like' : 'likes'}` : `🤍 ${post.like_count} ${post.like_count === 1 ? 'like' : 'likes'}`}
            </span>
          </button>

          <button 
            className={`post-card__action ${showComments ? 'post-card__action--active' : ''}`}
            onClick={onComment}
          >
            <span className="post-card__action-icon">💬</span>
            <span className="post-card__action-text">{post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
          </button>

          <button className="post-card__action post-card__action--secondary">
            <span className="post-card__action-icon">📤</span>
            <span className="post-card__action-text">Share</span>
          </button>
        </div>

        {/* Engagement Summary */}
        {(post.like_count > 0 || post.comment_count > 0) && (
          <div className="post-card__engagement">
            {post.comment_count > 0 && (
              <span className="post-card__engagement-item">
                {/* 💬 {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'} */}
              </span>
            )}
          </div>
        )}
      </footer>
    </article>
  );
};

export default PostCard;

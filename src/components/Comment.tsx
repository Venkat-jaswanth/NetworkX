import React from 'react';
import UserAvatar from './UserAvatar';
import MarkdownRenderer from './MarkdownRenderer';
import './Comment.css';

export interface CommentProps {
  comment: {
    id: string;
    body: string;
    created_at: string;
    user?: {
      id: string;
      full_name: string;
      profile_picture_url?: string | null;
      role?: string;
    } | null;
  };
  onUserClick?: (userId: string) => void;
  className?: string;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onUserClick,
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
    if (comment.user && onUserClick) {
      onUserClick(comment.user.id);
    }
  };

  const commentClasses = [
    'comment',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={commentClasses}>
      <div className="comment__avatar">
        <UserAvatar 
          user={comment.user || { id: '', full_name: 'Unknown User' }}
          size="small"
          onClick={onUserClick}
        />
      </div>
      
      <div className="comment__content">
        <div className="comment__header">
          <button 
            className="comment__author"
            onClick={handleUserClick}
          >
            <span className="comment__author-name">
              {comment.user?.full_name || 'Unknown User'}
            </span>
            {comment.user?.role && (
              <span className="comment__author-role">{comment.user.role}</span>
            )}
          </button>
          <span className="comment__timestamp">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        
        <div className="comment__body">
          <MarkdownRenderer content={comment.body} />
        </div>
        
        <div className="comment__actions">
          <button className="comment__action">
            <span className="comment__action-icon">🤍</span>
            <span className="comment__action-text">Like</span>
          </button>
          <button className="comment__action">
            <span className="comment__action-icon">💬</span>
            <span className="comment__action-text">Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;

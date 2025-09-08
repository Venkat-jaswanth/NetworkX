import React from 'react';
import UserAvatar from './UserAvatar';
import './UserProfileCard.css';

export interface UserProfileCardProps {
  user: {
    id: string;
    full_name: string;
    profile_picture_url?: string | null;
    role?: string;
    bio?: string;
  };
  variant?: 'compact' | 'full';
  showBio?: boolean;
  showRole?: boolean;
  onClick?: (userId: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  variant = 'full',
  showBio = true,
  showRole = true,
  onClick,
  actions,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(user.id);
    }
  };

  const cardClasses = [
    'user-profile-card',
    `user-profile-card--${variant}`,
    onClick ? 'user-profile-card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="user-profile-card__content">
        <UserAvatar 
          user={user} 
          size={variant === 'compact' ? 'small' : 'medium'}
          onClick={onClick}
        />
        
        <div className="user-profile-card__info">
          <div className="user-profile-card__header">
            <h3 className="user-profile-card__name">{user.full_name}</h3>
            {showRole && user.role && (
              <span className="user-profile-card__role">{user.role}</span>
            )}
          </div>
          
          {showBio && user.bio && variant === 'full' && (
            <p className="user-profile-card__bio">{user.bio}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="user-profile-card__actions" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;

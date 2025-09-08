import React from 'react';
import './UserAvatar.css';

export interface UserAvatarProps {
  user: {
    id: string;
    full_name: string;
    profile_picture_url?: string | null;
    role?: string;
  };
  size?: 'small' | 'medium' | 'large';
  onClick?: (userId: string) => void;
  showOnlineStatus?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'medium',
  onClick,
  showOnlineStatus = false,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(user.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = [
    'user-avatar',
    `user-avatar--${size}`,
    onClick ? 'user-avatar--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={avatarClasses} onClick={handleClick}>
      <div className="user-avatar__image">
        {user.profile_picture_url ? (
          <img 
            src={user.profile_picture_url} 
            alt={user.full_name}
            className="user-avatar__img"
          />
        ) : (
          <div className="user-avatar__placeholder">
            {getInitials(user.full_name)}
          </div>
        )}
      </div>
      {showOnlineStatus && (
        <div className="user-avatar__status user-avatar__status--online" />
      )}
    </div>
  );
};

export default UserAvatar;

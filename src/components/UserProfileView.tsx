import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FaCamera } from 'react-icons/fa';
import { uploadProfilePicture } from '@/services/storageService';
import { updateDbUser } from '@/services/userService';
import { useFollowStatus } from '@/hooks/useFollowStatus';
import Loader from '@/components/Loader';
import ProfileCard from '@/components/ProfileCard';
import avatarImg from '@/assets/imgs/avatar.jpeg';
import '@/css/profile.css';

export interface UserProfileViewProps {
  user: any;
  userDetails?: any;
  loading?: boolean;
  isOwnProfile?: boolean;
  onBack?: () => void;
  onFollowToggle?: (userId: string) => Promise<void>;
  onMessageClick?: () => void;
  busy?: string;
  showUploadOption?: boolean;
  backButtonText?: string;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  userDetails,
  loading = false,
  isOwnProfile = false,
  onBack,
  onFollowToggle,
  onMessageClick,
  busy = '',
  showUploadOption = false,
  backButtonText = 'Back'
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { following, loading: followLoading, updateFollowStatus } = useFollowStatus(user?.id);

  const onClickChangePhoto = () => fileInputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setUploading(true);
      const publicUrl = await uploadProfilePicture(file, user.id);
      await updateDbUser({ user: { profile_picture_url: publicUrl } });
      queryClient.invalidateQueries({ queryKey: ['profile', 'current', user.id] });
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFollowClick = async () => {
    if (!onFollowToggle || !user?.id) return;
    try {
      await onFollowToggle(user.id);
      updateFollowStatus(!following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  // Use userDetails if available, otherwise fall back to user
  const profileData = userDetails || user;
  const followerCount = profileData.followerCount || 0;
  const followingCount = profileData.followingCount || 0;

  return (
    <div className="page-container">
      {/* Header with back button and actions */}
      {onBack && (
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← {backButtonText}
          </button>
          {!isOwnProfile && (onFollowToggle || onMessageClick) && (
            <div className="profile-actions">
              {onFollowToggle && (
                <button 
                  className={`action-btn ${following ? 'primary' : 'secondary'}`}
                  disabled={busy === user.id || followLoading} 
                  onClick={handleFollowClick}
                >
                  {busy === user.id ? '...' : followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
                </button>
              )}
              {onMessageClick && (
                <button 
                  className="action-btn secondary" 
                  onClick={onMessageClick}
                >
                  Message
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-avatar-large">
            <div className={`avatar-wrapper${uploading ? ' show' : ''}`}>
              <div className="avatar-inner">
                {profileData.profile_picture_url ? (
                  <img src={profileData.profile_picture_url} alt={profileData.full_name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {profileData.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {showUploadOption && isOwnProfile && (
                  <div className="avatar-overlay">
                    {uploading ? (
                      <button className="change-photo-btn" disabled>
                        <span className="spinner"></span>
                        Uploading…
                      </button>
                    ) : (
                      <button
                        onClick={onClickChangePhoto}
                        disabled={uploading}
                        className="change-photo-btn"
                      >
                        <FaCamera /> Change Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {showUploadOption && isOwnProfile && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelected}
                style={{ display: 'none' }}
              />
            )}
          </div>
          <div className="hero-info">
            <h1 className="profile-name">{profileData.full_name}</h1>
            <p className="profile-role">{profileData.role}</p>
            <div className="profile-stats">
              <span className="stat-item">
                <strong>{followerCount}</strong> followers
              </span>
              <span className="stat-item">
                <strong>{followingCount}</strong> following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="content-grid">
          {/* Left Column */}
          <div className="content-left">
            {/* About Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>About</h2>
              </div>
              <div className="section-content">
                <p>{profileData.bio}</p>
                {profileData.skills &&
                  Array.isArray(profileData.skills) &&
                  profileData.skills.length > 0 && (
                    <div className="skills-section">
                      <h3>Skills</h3>
                      <div className="skills-list">
                        {profileData.skills.map((skill: any, index: number) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Work Experience</h2>
              </div>
              <div className="section-content">
                {profileData.workExperience && profileData.workExperience.length > 0 ? (
                  <div className="experience-list">
                    {profileData.workExperience.map((work: any) => (
                      <div key={work.id} className="experience-item">
                        <div className="experience-header">
                          <h3>{work.job_title}</h3>
                        </div>
                        <p className="company-name">{work.company_name}</p>
                        <p className="experience-dates">
                          {new Date(work.start_date).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}{" "}
                          -
                          {work.end_date
                            ? new Date(work.end_date).toLocaleDateString(
                                "en-US",
                                { month: "short", year: "numeric" }
                              )
                            : "Present"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No work experience added yet.</p>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Education</h2>
              </div>
              <div className="section-content">
                {profileData.education && profileData.education.length > 0 ? (
                  <div className="education-list">
                    {profileData.education.map((edu: any) => (
                      <div key={edu.id} className="education-item">
                        <div className="education-header">
                          <h3>{edu.institution_name}</h3>
                        </div>
                        <p className="degree-info">
                          {edu.degree} in {edu.field_of_study}
                        </p>
                        <p className="graduation-year">{edu.graduation_year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No education added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="content-right">
            <ProfileCard
              name={
                profileData.full_name
                  ? profileData.full_name.split(" ").slice(-2).join(" ")
                  : ""
              }
              title={profileData.role}
              handle={profileData.full_name
                .split(" ")
                .map((w: string) => w.charAt(0).toUpperCase())
                .join("")
                .toLowerCase()}
              status="Online"
              contactText="Contact Me"
              avatarUrl={profileData.profile_picture_url || avatarImg}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => console.log("Contact clicked")}
            />
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Info</h2>
              </div>
              <div className="section-content">
                <div className="info-item">
                  <strong>Role:</strong> {profileData.role}
                </div>
                {profileData.is_mentor && (
                  <div className="info-item">
                    <strong>Mentor Status:</strong> Active
                  </div>
                )}
                <div className="info-item">
                  <strong>Seeking Mentor:</strong>{" "}
                  {profileData.is_seeking_mentor ? "Yes" : "No"}
                </div>
                <div className="info-item">
                  <strong>Member since:</strong>{" "}
                  {new Date(profileData.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;

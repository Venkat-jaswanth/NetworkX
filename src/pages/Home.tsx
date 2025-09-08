import { useHomeQuery } from '@/hooks/queries/useHomeQuery';
import '@/css/home.css';
import Loader from '@/components/Loader';

export default function Home() {
  const { data, isLoading, error } = useHomeQuery();

  if (isLoading) {
    return (
      <div className="page-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          Error loading dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const { user, stats } = data || { user: null, stats: { followers: 0, following: 0 } };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome back, {user?.full_name}!</h1>
        <p>Your career networking dashboard</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Your Stats</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.following}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <div className="action-item">
              <h4>Search Users</h4>
              <p>Find and connect with other professionals</p>
            </div>
            <div className="action-item">
              <h4>Check Messages</h4>
              <p>View your latest conversations</p>
            </div>
            <div className="action-item">
              <h4>Update Profile</h4>
              <p>Keep your profile information current</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Your Profile</h3>
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
      </div>
    </div>
  );
}
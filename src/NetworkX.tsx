import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingForm from './components/OnboardingForm';
import Loader from './components/Loader';
import { useState } from 'react';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import Messages from '@/pages/Messages';
import { FaHome, FaUser, FaSearch, FaComments, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from '@/services/authService';
import '@/css/networkx.css';

type Page = 'home' | 'profile' | 'search' | 'messages';

export default function NetworkX() {
  const { hasCompletedOnboarding, loading } = useOnboarding();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (loading) {
    return <Loader />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingForm onComplete={() => window.location.reload()} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'profile':
        return <Profile />;
      case 'search':
        return <Search />;
      case 'messages':
        return <Messages />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="networkx-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>NetworkX</h1>
        </div>
        <div className="navbar-nav">
          <button 
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <FaHome />
            <span>Home</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            <FaUser />
            <span>Profile</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentPage('search')}
          >
            <FaSearch />
            <span>Search</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'messages' ? 'active' : ''}`}
            onClick={() => setCurrentPage('messages')}
          >
            <FaComments />
            <span>Messages</span>
          </button>
        </div>
        <div className="navbar-actions">
          <button className="nav-item sign-out" onClick={signOut}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

 
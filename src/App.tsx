import { useAuth } from '@/hooks/useAuth';
import NetworkX from '@/components/NetworkX';
import Login from '@/pages/Login';
import Loader from '@/components/Loader';

function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div className="text-center p-4" style={{ height: '50px' }}>
        <Loader />
      </div>
    </div>
  );

  return user ? <NetworkX /> : <Login />;
}

export default App;

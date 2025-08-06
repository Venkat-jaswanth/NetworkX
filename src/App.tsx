import { useAuth } from '@/hooks/useAuth';
import NetworkX from '@/components/NetworkX';
import Login from '@/pages/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return user ? <NetworkX /> : <Login />;
}

export default App;

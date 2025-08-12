import { useAuth } from '@/hooks/useAuth';
import NetworkX from '@/NetworkX';
import Login from '@/Login';
import Loader from '@/components/Loader';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return user ? <NetworkX /> : <Login />;
}

export default App;

import { useAuth } from '@/hooks/useAuth';
import Login from '@/Login';
import Loader from '@/components/Loader';
import NetworkX from '@/NetworkX';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return user ? <NetworkX /> : <Login />;
}

export default App;

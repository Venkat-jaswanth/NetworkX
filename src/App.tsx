import { useAuth } from '@/hooks/useAuth';
import Home from '@/pages/Home';
import Login from '@/pages/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return user ? <Home /> : <Login />;
}

export default App;

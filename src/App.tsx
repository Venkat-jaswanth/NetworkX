import { useAuth } from '@/hooks/useAuth';
import LocusX from '@/LocusX';
import Login from '@/Login';
import Loader from '@/components/Loader';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return user ? <LocusX /> : <Login />;
}

export default App;

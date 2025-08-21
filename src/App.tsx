import {  QueryClientProvider } from '@tanstack/react-query';
import { useAuthQuery } from '@/hooks/queries/useAuthQuery';
import Loader from '@/components/Loader';
import Login from '@/Login';
import NetworkX from '@/NetworkX';
import { queryClient } from '@/lib/queryClient';

function AppContent() {
  const { data: user, isLoading } = useAuthQuery();

  if (isLoading) return <Loader />;
  return user ? <NetworkX /> : <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

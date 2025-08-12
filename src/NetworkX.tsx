import { useOnboarding } from '@/hooks/useOnboarding';
import Home from '@/pages/Home';
import OnboardingForm from './components/OnboardingForm';
import Loader from './components/Loader';

export default function NetworkX() {
  const { hasCompletedOnboarding, loading } = useOnboarding();

  if (loading) {
    return <Loader />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingForm onComplete={() => window.location.reload()} />;
  }

  return <Home />;
} 
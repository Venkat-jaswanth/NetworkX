import { useOnboarding } from '@/hooks/useOnboarding';
import Home from '@/pages/Home';
import OnboardingForm from './OnboardingForm';

export default function NetworkX() {
  const { hasCompletedOnboarding, loading } = useOnboarding();

  if (loading) {
    return <div className="text-center p-4"></div>;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingForm onComplete={() => window.location.reload()} />;
  }

  return <Home />;
} 
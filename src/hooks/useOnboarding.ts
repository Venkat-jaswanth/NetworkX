import { useState, useEffect } from 'react';
import { dbUserExists } from '@/services/userService';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
        const exists = await dbUserExists();
        setHasCompletedOnboarding(exists);
        setLoading(false);
    };

    checkOnboarding();
  }, []);

  return { hasCompletedOnboarding, loading };
}; 
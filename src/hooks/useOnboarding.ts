import { useState, useEffect } from 'react';
import { getUser } from '@/services/authService';
import { dbUserExists } from '@/services/dbUserService';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
        const user = await getUser();
        const exists = await dbUserExists(user.id);
        setHasCompletedOnboarding(exists);
        setLoading(false);
    };

    checkOnboarding();
  }, []);

  return { hasCompletedOnboarding, loading };
}; 
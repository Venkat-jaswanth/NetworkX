import { useState, useEffect } from 'react';
import { getAuthUser } from '@/services/authService';
import { dbUserExists } from '@/services/userService';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
        const user = await getAuthUser();
        const exists = await dbUserExists(user.id);
        setHasCompletedOnboarding(exists);
        setLoading(false);
    };

    checkOnboarding();
  }, []);

  return { hasCompletedOnboarding, loading };
}; 
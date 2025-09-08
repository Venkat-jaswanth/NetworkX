import { useState } from 'react';
import { getProfileById } from '@/services/userService';

export interface ProfileNavigationState {
  selectedUserId: string | null;
  selectedUserDetails: any | null;
  isLoading: boolean;
  error: string | null;
}

export const useProfileNavigation = () => {
  const [state, setState] = useState<ProfileNavigationState>({
    selectedUserId: null,
    selectedUserDetails: null,
    isLoading: false,
    error: null
  });

  const navigateToProfile = async (userId: string) => {
    if (userId === state.selectedUserId) {
      return; // Already viewing this profile
    }

    setState(prev => ({
      ...prev,
      selectedUserId: userId,
      isLoading: true,
      error: null
    }));

    try {
      const userDetails = await getProfileById(userId);
      setState(prev => ({
        ...prev,
        selectedUserDetails: userDetails,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setState(prev => ({
        ...prev,
        selectedUserDetails: null,
        isLoading: false,
        error: 'Failed to load user profile'
      }));
    }
  };

  const clearProfile = () => {
    setState({
      selectedUserId: null,
      selectedUserDetails: null,
      isLoading: false,
      error: null
    });
  };

  const refreshProfile = async () => {
    if (state.selectedUserId) {
      await navigateToProfile(state.selectedUserId);
    }
  };

  return {
    ...state,
    navigateToProfile,
    clearProfile,
    refreshProfile,
    isViewingProfile: !!state.selectedUserId
  };
};

export default useProfileNavigation;

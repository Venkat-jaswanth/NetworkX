import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileQuery } from './queries/useProfileQuery';
import { addEducation, updateEducation, deleteEducation, addWorkExperience, updateWorkExperience, deleteWorkExperience } from '@/services/userService';
import type { InsertEducation, InsertWorkExperience, Education, WorkExperience } from '@/types/app.types';

export function useProfile() {
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching
  const profileQuery = useProfileQuery();

  // Extract data from query
  const user = profileQuery.data?.user ?? null;
  const followerCount = profileQuery.data?.followerCount ?? 0;
  const followingCount = profileQuery.data?.followingCount ?? 0;
  const loading = profileQuery.isLoading;

  // UI State Management (preserved from original)
  const [editingEducation, setEditingEducation] = useState<string | null>(null);
  const [editingWork, setEditingWork] = useState<string | null>(null);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [showEditEducation, setShowEditEducation] = useState(false);
  const [showEditWork, setShowEditWork] = useState(false);
  const [showDeleteEducation, setShowDeleteEducation] = useState(false);
  const [showDeleteWork, setShowDeleteWork] = useState(false);
  const [deletingEducationId, setDeletingEducationId] = useState<string | null>(null);
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null);

  // Form states for adding/editing
  const [educationForm, setEducationForm] = useState<Partial<InsertEducation>>({});
  const [workForm, setWorkForm] = useState<Partial<InsertWorkExperience>>({});

  // Function to refresh profile data
  const loadProfileData = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', 'current'] });
  };

  // Explicitly trigger profile loading on mount (optional)
  useEffect(() => {
    loadProfileData();
  }, []);

  // Education handlers
  const handleAddEducation = async () => {
    if (!user || !educationForm.institution_name || !educationForm.degree || !educationForm.field_of_study || !educationForm.graduation_year) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addEducation({
        ...educationForm as InsertEducation,
        user_id: user.id
      });
      loadProfileData(); // Use React Query invalidation
      setShowAddEducation(false);
      setEducationForm({});
    } catch (error) {
      console.error('Error adding education:', error);
      alert('Failed to add education');
    }
  };

  const handleUpdateEducation = async (id: string) => {
    if (!educationForm.institution_name || !educationForm.degree || !educationForm.field_of_study || !educationForm.graduation_year) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateEducation(id, educationForm);
      loadProfileData(); // Use React Query invalidation
      setEditingEducation(null);
      setEducationForm({});
      setShowEditEducation(false);
    } catch (error) {
      console.error('Error updating education:', error);
      alert('Failed to update education');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    setDeletingEducationId(id);
    setShowDeleteEducation(true);
  };

  const confirmDeleteEducation = async () => {
    if (!deletingEducationId) return;

    try {
      await deleteEducation(deletingEducationId);
      loadProfileData(); // Use React Query invalidation
      setShowDeleteEducation(false);
      setDeletingEducationId(null);
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education');
    }
  };

  const startEditEducation = (education: Education) => {
    setEditingEducation(education.id);
    setEducationForm({
      institution_name: education.institution_name,
      degree: education.degree,
      field_of_study: education.field_of_study,
      graduation_year: education.graduation_year
    });
    setShowEditEducation(true);
  };

  // Work experience handlers
  const handleAddWorkExperience = async () => {
    if (!user || !workForm.company_name || !workForm.job_title || !workForm.start_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addWorkExperience({
        ...workForm as InsertWorkExperience,
        user_id: user.id
      });
      loadProfileData(); // Use React Query invalidation
      setShowAddWork(false);
      setWorkForm({});
    } catch (error) {
      console.error('Error adding work experience:', error);
      alert('Failed to add work experience');
    }
  };

  const handleUpdateWorkExperience = async (id: string) => {
    if (!workForm.company_name || !workForm.job_title || !workForm.start_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateWorkExperience(id, workForm);
      loadProfileData(); // Use React Query invalidation
      setEditingWork(null);
      setWorkForm({});
      setShowEditWork(false);
    } catch (error) {
      console.error('Error updating work experience:', error);
      alert('Failed to update work experience');
    }
  };

  const handleDeleteWorkExperience = async (id: string) => {
    setDeletingWorkId(id);
    setShowDeleteWork(true);
  };

  const confirmDeleteWorkExperience = async () => {
    if (!deletingWorkId) return;

    try {
      await deleteWorkExperience(deletingWorkId);
      loadProfileData(); // Use React Query invalidation
      setShowDeleteWork(false);
      setDeletingWorkId(null);
    } catch (error) {
      console.error('Error deleting work experience:', error);
      alert('Failed to delete work experience');
    }
  };

  const startEditWork = (work: WorkExperience) => {
    setEditingWork(work.id);
    setWorkForm({
      company_name: work.company_name,
      job_title: work.job_title,
      start_date: work.start_date,
      end_date: work.end_date
    });
    setShowEditWork(true);
  };

  // Modal control functions
  const closeAddEducationModal = () => {
    setShowAddEducation(false);
    setEducationForm({});
  };

  const closeAddWorkModal = () => {
    setShowAddWork(false);
    setWorkForm({});
  };

  const closeEditEducationModal = () => {
    setShowEditEducation(false);
    setEditingEducation(null);
    setEducationForm({});
  };

  const closeEditWorkModal = () => {
    setShowEditWork(false);
    setEditingWork(null);
    setWorkForm({});
  };

  const closeDeleteEducationModal = () => {
    setShowDeleteEducation(false);
    setDeletingEducationId(null);
  };

  const closeDeleteWorkModal = () => {
    setShowDeleteWork(false);
    setDeletingWorkId(null);
  };

  return {
    // State
    user,
    followerCount,
    followingCount,
    loading,
    educationForm,
    workForm,
    
    // Modal states
    showAddEducation,
    showAddWork,
    showEditEducation,
    showEditWork,
    showDeleteEducation,
    showDeleteWork,
    editingEducation,
    editingWork,
    
    // Actions
    loadProfileData,
    
    // Education actions
    handleAddEducation,
    handleUpdateEducation,
    handleDeleteEducation,
    confirmDeleteEducation,
    startEditEducation,
    
    // Work experience actions
    handleAddWorkExperience,
    handleUpdateWorkExperience,
    handleDeleteWorkExperience,
    confirmDeleteWorkExperience,
    startEditWork,
    
    // Form setters
    setEducationForm,
    setWorkForm,
    
    // Modal controls
    setShowAddEducation,
    setShowAddWork,
    closeAddEducationModal,
    closeAddWorkModal,
    closeEditEducationModal,
    closeEditWorkModal,
    closeDeleteEducationModal,
    closeDeleteWorkModal,
  };
}

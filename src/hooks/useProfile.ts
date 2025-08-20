import { useEffect, useState } from 'react';
import { getAuthUser } from '@/services/authService';
import { getFollowerCount, getFollowingCount } from '@/services/followsService';
import { getAppUser, addEducation, updateEducation, deleteEducation, addWorkExperience, updateWorkExperience, deleteWorkExperience } from '@/services/userService';
import type { AppUser, InsertEducation, InsertWorkExperience, Education, WorkExperience } from '@/types/app.types';

export function useProfile() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
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

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const au = await getAuthUser();
      const appUser = await getAppUser();
      setUser(appUser);
      
      const [flwCnt, flwgCnt] = await Promise.all([
        getFollowerCount(au.id),
        getFollowingCount(au.id),
      ]);
      setFollowerCount(flwCnt);
      setFollowingCount(flwgCnt);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
      await loadProfileData();
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
      await loadProfileData();
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
      await loadProfileData();
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
      await loadProfileData();
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
      await loadProfileData();
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
      await loadProfileData();
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

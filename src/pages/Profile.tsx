import { useEffect, useState } from 'react';
import { getAuthUser } from '@/services/authService';
import { getFollowerCount, getFollowingCount } from '@/services/followsService';
import { getAppUser, addEducation, updateEducation, deleteEducation, addWorkExperience, updateWorkExperience, deleteWorkExperience } from '@/services/userService';
import type { AppUser, InsertEducation, InsertWorkExperience, Education, WorkExperience } from '@/types/app.types';
import '@/css/profile.css';
import Loader from '@/components/Loader';

export default function Profile() {
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

  useEffect(() => {
    loadProfileData();
  }, []);

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

  if (loading) {
    return (
      <div className="page-container">
       <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-avatar-large">
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.full_name} />
            ) : (
              <div className="avatar-placeholder-large">
                {user.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="hero-info">
            <h1 className="profile-name">{user.full_name}</h1>
            <p className="profile-role">{user.role}</p>
            <div className="profile-stats">
              <span className="stat-item">
                <strong>{followerCount}</strong> followers
              </span>
              <span className="stat-item">
                <strong>{followingCount}</strong> following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="content-grid">
          {/* Left Column */}
          <div className="content-left">
            {/* About Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>About</h2>
              </div>
              <div className="section-content">
                <p>{user.bio}</p>
                {user.skills && Array.isArray(user.skills) && user.skills.length > 0 && (
                  <div className="skills-section">
                    <h3>Skills</h3>
                    <div className="skills-list">
                      {user.skills.map((skill: any, index: number) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Work Experience</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddWork(true)}
                >
                  + Add Experience
                </button>
              </div>
              <div className="section-content">
                {user.workExperience && user.workExperience.length > 0 ? (
                  <div className="experience-list">
                    {user.workExperience.map((work) => (
                      <div key={work.id} className="experience-item">
                        <div className="experience-header">
                          <h3>{work.job_title}</h3>
                          <div className="experience-actions">
                            <button onClick={() => startEditWork(work)}>Edit</button>
                            <button onClick={() => handleDeleteWorkExperience(work.id)}>Delete</button>
                          </div>
                        </div>
                        <p className="company-name">{work.company_name}</p>
                        <p className="experience-dates">
                          {new Date(work.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                          {work.end_date ? new Date(work.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No work experience added yet.</p>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Education</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddEducation(true)}
                >
                  + Add Education
                </button>
              </div>
              <div className="section-content">
                {user.education && user.education.length > 0 ? (
                  <div className="education-list">
                    {user.education.map((edu) => (
                      <div key={edu.id} className="education-item">
                        <div className="education-header">
                          <h3>{edu.institution_name}</h3>
                          <div className="education-actions">
                            <button onClick={() => startEditEducation(edu)}>Edit</button>
                            <button onClick={() => handleDeleteEducation(edu.id)}>Delete</button>
                          </div>
                        </div>
                        <p className="degree-info">{edu.degree} in {edu.field_of_study}</p>
                        <p className="graduation-year">{edu.graduation_year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No education added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="content-right">
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Info</h2>
              </div>
              <div className="section-content">
                <div className="info-item">
                  <strong>Role:</strong> {user.role}
                </div>
                <div className="info-item">
                  <strong>Mentor Status:</strong> {user.is_mentor ? 'Available as mentor' : 'Not available'}
                </div>
                <div className="info-item">
                  <strong>Seeking Mentor:</strong> {user.is_seeking_mentor ? 'Yes' : 'No'}
                </div>
                <div className="info-item">
                  <strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Education Modal */}
      {showAddEducation && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Education</h3>
              <button onClick={() => setShowAddEducation(false)}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Institution Name *"
                value={educationForm.institution_name || ''}
                onChange={(e) => setEducationForm({...educationForm, institution_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Degree *"
                value={educationForm.degree || ''}
                onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
              />
              <input
                type="text"
                placeholder="Field of Study *"
                value={educationForm.field_of_study || ''}
                onChange={(e) => setEducationForm({...educationForm, field_of_study: e.target.value})}
              />
              <input
                type="number"
                placeholder="Graduation Year *"
                value={educationForm.graduation_year || ''}
                onChange={(e) => setEducationForm({...educationForm, graduation_year: parseInt(e.target.value)})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddEducation}>Add Education</button>
              <button onClick={() => setShowAddEducation(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Work Experience Modal */}
      {showAddWork && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Work Experience</h3>
              <button onClick={() => setShowAddWork(false)}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Company Name *"
                value={workForm.company_name || ''}
                onChange={(e) => setWorkForm({...workForm, company_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Job Title *"
                value={workForm.job_title || ''}
                onChange={(e) => setWorkForm({...workForm, job_title: e.target.value})}
              />
              <input
                type="date"
                placeholder="Start Date *"
                value={workForm.start_date || ''}
                onChange={(e) => setWorkForm({...workForm, start_date: e.target.value})}
              />
              <input
                type="date"
                placeholder="End Date (optional)"
                value={workForm.end_date || ''}
                onChange={(e) => setWorkForm({...workForm, end_date: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddWorkExperience}>Add Experience</button>
              <button onClick={() => setShowAddWork(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Education Modal */}
      {showEditEducation && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Education</h3>
              <button onClick={() => {setShowEditEducation(false); setEditingEducation(null); setEducationForm({});}}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Institution Name *"
                value={educationForm.institution_name || ''}
                onChange={(e) => setEducationForm({...educationForm, institution_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Degree *"
                value={educationForm.degree || ''}
                onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
              />
              <input
                type="text"
                placeholder="Field of Study *"
                value={educationForm.field_of_study || ''}
                onChange={(e) => setEducationForm({...educationForm, field_of_study: e.target.value})}
              />
              <input
                type="number"
                placeholder="Graduation Year *"
                value={educationForm.graduation_year || ''}
                onChange={(e) => setEducationForm({...educationForm, graduation_year: parseInt(e.target.value)})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => editingEducation && handleUpdateEducation(editingEducation)}>Update Education</button>
              <button onClick={() => {setShowEditEducation(false); setEditingEducation(null); setEducationForm({});}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Work Experience Modal */}
      {showEditWork && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Work Experience</h3>
              <button onClick={() => {setShowEditWork(false); setEditingWork(null); setWorkForm({});}}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Company Name *"
                value={workForm.company_name || ''}
                onChange={(e) => setWorkForm({...workForm, company_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Job Title *"
                value={workForm.job_title || ''}
                onChange={(e) => setWorkForm({...workForm, job_title: e.target.value})}
              />
              <input
                type="date"
                placeholder="Start Date *"
                value={workForm.start_date || ''}
                onChange={(e) => setWorkForm({...workForm, start_date: e.target.value})}
              />
              <input
                type="date"
                placeholder="End Date (optional)"
                value={workForm.end_date || ''}
                onChange={(e) => setWorkForm({...workForm, end_date: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => editingWork && handleUpdateWorkExperience(editingWork)}>Update Experience</button>
              <button onClick={() => {setShowEditWork(false); setEditingWork(null); setWorkForm({});}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Education Confirmation Modal */}
      {showDeleteEducation && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Education</h3>
              <button onClick={() => {setShowDeleteEducation(false); setDeletingEducationId(null);}}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this education record? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteEducation}>Delete</button>
              <button onClick={() => {setShowDeleteEducation(false); setDeletingEducationId(null);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Work Experience Confirmation Modal */}
      {showDeleteWork && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Work Experience</h3>
              <button onClick={() => {setShowDeleteWork(false); setDeletingWorkId(null);}}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this work experience? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteWorkExperience}>Delete</button>
              <button onClick={() => {setShowDeleteWork(false); setDeletingWorkId(null);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

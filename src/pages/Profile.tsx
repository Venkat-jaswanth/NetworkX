import { useProfile } from "@/hooks/useProfile";
import "@/css/profile.css";
import Loader from "@/components/Loader";
import { useRef, useState } from "react";
import { uploadProfilePicture } from "@/services/storageService";
import { updateDbUser } from "@/services/userService";
import { useQueryClient } from "@tanstack/react-query";
import { FaCamera } from "react-icons/fa";
import ProfileCard from "@/components/ProfileCard";

import avatarImg from "@/assets/imgs/avatar.jpeg";
export default function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    user,
    followerCount,
    followingCount,
    loading,
    educationForm,
    workForm,
    showAddEducation,
    showAddWork,
    showEditEducation,
    showEditWork,
    showDeleteEducation,
    showDeleteWork,
    editingEducation,
    editingWork,
    handleAddEducation,
    handleUpdateEducation,
    handleDeleteEducation,
    confirmDeleteEducation,
    startEditEducation,
    handleAddWorkExperience,
    handleUpdateWorkExperience,
    handleDeleteWorkExperience,
    confirmDeleteWorkExperience,
    startEditWork,
    setEducationForm,
    setWorkForm,
    setShowAddEducation,
    setShowAddWork,
    closeAddEducationModal,
    closeAddWorkModal,
    closeEditEducationModal,
    closeEditWorkModal,
    closeDeleteEducationModal,
    closeDeleteWorkModal,
  } = useProfile();

  const onClickChangePhoto = () => fileInputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setUploading(true);
      const publicUrl = await uploadProfilePicture(file, user.id);
      await updateDbUser({ user: { profile_picture_url: publicUrl } });
      queryClient.invalidateQueries({ queryKey: ['profile', 'current', user.id] });
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <div className={`avatar-wrapper${uploading ? ' show' : ''}`}>
              <div className="avatar-inner">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.full_name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="avatar-overlay">
                  {uploading ? (
                    <button className="change-photo-btn" disabled>
                      <span className="spinner"></span>
                      Uploading…
                    </button>
                  ) : (
                    <button
                      onClick={onClickChangePhoto}
                      disabled={uploading}
                      className="change-photo-btn"
                    >
                      <FaCamera /> Change Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelected}
              style={{ display: 'none' }}
            />
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
                {user.skills &&
                  Array.isArray(user.skills) &&
                  user.skills.length > 0 && (
                    <div className="skills-section">
                      <h3>Skills</h3>
                      <div className="skills-list">
                        {user.skills.map((skill: any, index: number) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
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
                            <button onClick={() => startEditWork(work)}>
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteWorkExperience(work.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="company-name">{work.company_name}</p>
                        <p className="experience-dates">
                          {new Date(work.start_date).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}{" "}
                          -
                          {work.end_date
                            ? new Date(work.end_date).toLocaleDateString(
                                "en-US",
                                { month: "short", year: "numeric" }
                              )
                            : "Present"}
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
                            <button onClick={() => startEditEducation(edu)}>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEducation(edu.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="degree-info">
                          {edu.degree} in {edu.field_of_study}
                        </p>
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
            <ProfileCard
              name={
                user.full_name
                  ? user.full_name.split(" ").slice(-2).join(" ")
                  : ""
              }
              title={user.role}
              handle={user.full_name
                .split(" ")
                .map((w: string) => w.charAt(0).toUpperCase())
                .join("")
                .toLowerCase()}
              status="Online"
              contactText="Contact Me"
              avatarUrl={user.profile_picture_url || avatarImg}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => console.log("Contact clicked")}
            />
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Info</h2>
              </div>
              <div className="section-content">
                <div className="info-item">
                  <strong>Role:</strong> {user.role}
                </div>
                {user.is_mentor && (
                  <div className="info-item">
                    <strong>Mentor Status:</strong> Active
                  </div>
                )}
                <div className="info-item">
                  <strong>Seeking Mentor:</strong>{" "}
                  {user.is_seeking_mentor ? "Yes" : "No"}
                </div>
                <div className="info-item">
                  <strong>Member since:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
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
              <button onClick={closeAddEducationModal}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Institution Name *"
                value={educationForm.institution_name || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    institution_name: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Degree *"
                value={educationForm.degree || ""}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, degree: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Field of Study *"
                value={educationForm.field_of_study || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    field_of_study: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Graduation Year *"
                value={educationForm.graduation_year || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    graduation_year: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddEducation}>Add Education</button>
              <button onClick={closeAddEducationModal}>Cancel</button>
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
              <button onClick={closeAddWorkModal}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Company Name *"
                value={workForm.company_name || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, company_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Job Title *"
                value={workForm.job_title || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, job_title: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="Start Date *"
                value={workForm.start_date || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, start_date: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="End Date (optional)"
                value={workForm.end_date || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, end_date: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddWorkExperience}>Add Experience</button>
              <button onClick={closeAddWorkModal}>Cancel</button>
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
              <button onClick={closeEditEducationModal}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Institution Name *"
                value={educationForm.institution_name || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    institution_name: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Degree *"
                value={educationForm.degree || ""}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, degree: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Field of Study *"
                value={educationForm.field_of_study || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    field_of_study: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Graduation Year *"
                value={educationForm.graduation_year || ""}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    graduation_year: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() =>
                  editingEducation && handleUpdateEducation(editingEducation)
                }
              >
                Update Education
              </button>
              <button onClick={closeEditEducationModal}>Cancel</button>
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
              <button onClick={closeEditWorkModal}>×</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Company Name *"
                value={workForm.company_name || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, company_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Job Title *"
                value={workForm.job_title || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, job_title: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="Start Date *"
                value={workForm.start_date || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, start_date: e.target.value })
                }
              />
              <input
                type="date"
                placeholder="End Date (optional)"
                value={workForm.end_date || ""}
                onChange={(e) =>
                  setWorkForm({ ...workForm, end_date: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() =>
                  editingWork && handleUpdateWorkExperience(editingWork)
                }
              >
                Update Experience
              </button>
              <button onClick={closeEditWorkModal}>Cancel</button>
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
              <button onClick={closeDeleteEducationModal}>×</button>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete this education record? This
                action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteEducation}>
                Delete
              </button>
              <button onClick={closeDeleteEducationModal}>Cancel</button>
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
              <button onClick={closeDeleteWorkModal}>×</button>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete this work experience? This
                action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="delete-btn"
                onClick={confirmDeleteWorkExperience}
              >
                Delete
              </button>
              <button onClick={closeDeleteWorkModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

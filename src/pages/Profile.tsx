import { useProfile } from "@/hooks/useProfile";
import UserProfileView from "@/components/UserProfileView";
import "@/css/profile.css";
export default function Profile() {
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
    confirmDeleteEducation,
    handleAddWorkExperience,
    handleUpdateWorkExperience,
    confirmDeleteWorkExperience,
    setEducationForm,
    setWorkForm,
    closeAddEducationModal,
    closeAddWorkModal,
    closeEditEducationModal,
    closeEditWorkModal,
    closeDeleteEducationModal,
    closeDeleteWorkModal,
  } = useProfile();

  // Prepare user data with follower/following counts
  const userWithCounts = user ? {
    ...user,
    followerCount,
    followingCount
  } : null;

  return (
    <>
      <UserProfileView
        user={userWithCounts}
        loading={loading}
        isOwnProfile={true}
        showUploadOption={true}
      />

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
    </>
  );
}

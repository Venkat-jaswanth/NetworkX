import { useState } from 'react';
import { createDbUser } from '@/services/userService';
import type { InsertDbUser, InsertEducation, InsertWorkExperience } from '@/types/app.types';
import { FaUser, FaGraduationCap, FaBriefcase, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import '@/css/onboarding.css';
import { getAuthUser, signOut } from '@/services/authService';

interface OnboardingFormProps {
  onComplete: () => void;
}

type Step = 'basic' | 'education' | 'work';

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);

  // Basic Info
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Student' | 'Professional'>('Student');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Education
  const [education, setEducation] = useState<Omit<InsertEducation, 'user_id'>>({
    institution_name: '',
    degree: '',
    field_of_study: '',
    graduation_year: new Date().getFullYear(),
  });

  // Work Experience (optional for students, mandatory for professionals)
  const [workExperience, setWorkExperience] = useState<Omit<InsertWorkExperience, 'user_id'>>({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: null,
  });
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [skipWorkExperience, setSkipWorkExperience] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleEducationChange = (field: keyof Omit<InsertEducation, 'user_id'>, value: string | number) => {
    setEducation(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkExperienceChange = (field: keyof Omit<InsertWorkExperience, 'user_id'>, value: string | null) => {
    setWorkExperience(prev => ({ ...prev, [field]: value }));
  };

  // Reset skipWorkExperience when role changes to Professional
  const handleRoleChange = (newRole: 'Student' | 'Professional') => {
    setRole(newRole);
    if (newRole === 'Professional') {
      setSkipWorkExperience(false);
    }
  };

  const isBasicInfoValid = () => {
    return fullName.trim() !== '' && bio.trim() !== '' && skills.length > 0;
  };

  const isEducationValid = () => {
    return (
      education.institution_name.trim() !== '' &&
      education.degree.trim() !== '' &&
      education.field_of_study.trim() !== ''
    );
  };

  const isWorkExperienceValid = () => {
    // Professionals cannot skip work experience
    if (role === 'Professional') {
      return (
        workExperience.company_name.trim() !== '' &&
        workExperience.job_title.trim() !== '' &&
        workExperience.start_date !== ''
      );
    }
    // Students can skip work experience
    if (skipWorkExperience) return true;
    return (
      workExperience.company_name.trim() !== '' &&
      workExperience.job_title.trim() !== '' &&
      workExperience.start_date !== ''
    );
  };

  const handleNext = () => {
    if (step === 'basic' && isBasicInfoValid()) {
      setStep('education');
    } else if (step === 'education' && isEducationValid()) {
      setStep('work');
    }
  };

  const handleBack = () => {
    if (step === 'education') {
      setStep('basic');
    } else if (step === 'work') {
      setStep('education');
    }
  };

  const handleSubmit = async () => {
    if (!isBasicInfoValid() || !isEducationValid() || !isWorkExperienceValid()) return;
    setLoading(true);

    try {
      const user = await getAuthUser();
      if (!user) throw new Error('No authenticated user found');

      const newUser: InsertDbUser = {
        id: user.id,
        full_name: fullName,
        role: role,
        bio: bio,
        skills: skills,
      };

      // Create education record
      const newEducation: InsertEducation = {
        ...education,
        user_id: user.id,
      };

      // Create work experience record if not skipped
      const newWorkExperience = !skipWorkExperience ? {
        ...workExperience,
        user_id: user.id,
      } : undefined;

      // Use the existing function that handles all three records
      await createDbUser(newUser, newEducation, newWorkExperience);
      onComplete();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepName: Step) => {
    switch (stepName) {
      case 'basic': return <FaUser />;
      case 'education': return <FaGraduationCap />;
      case 'work': return <FaBriefcase />;
    }
  };

  const getCurrentStepNumber = () => {
    switch (step) {
      case 'basic': return 1;
      case 'education': return 2;
      case 'work': return 3;
    }
  };

  return (
    <div className="onboarding-container">
      {/* Background with gradient */}
      <div className="onboarding-background">
        <div className="gradient-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="onboarding-content">
        {/* Header */}
        <div className="onboarding-header">
          <h1 className="onboarding-title">Welcome to Kairo!</h1>
          <p className="onboarding-subtitle">Let's set up your profile to get you started</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-steps">
            {(['basic', 'education', 'work'] as Step[]).map((stepName, index) => (
              <div 
                key={stepName}
                className={`progress-step ${step === stepName ? 'active' : ''} ${
                  getCurrentStepNumber() > index + 1 ? 'completed' : ''
                }`}
              >
                <div className="step-icon">
                  {getCurrentStepNumber() > index + 1 ? <FaCheck /> : getStepIcon(stepName)}
                </div>
                <span className="step-label">
                  {stepName === 'basic' ? 'Basic Info' : 
                   stepName === 'education' ? 'Education' : 'Experience'}
                </span>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(getCurrentStepNumber() / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-container">
          {step === 'basic' && (
            <div className="form-step animate-slide-in">
              <h2 className="step-title">Tell us about yourself</h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">I am a *</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as 'Student' | 'Professional')}
                    className="form-select"
                  >
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">Bio *</label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself, your interests, and goals..."
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Skills *</label>
                  <div className="skills-input-container">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Add a skill and press Enter"
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="add-skill-btn"
                    >
                      Add
                    </button>
                  </div>
                  <div className="skills-container">
                    {skills.map(skill => (
                      <span key={skill} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill-btn"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {skills.length === 0 && (
                    <p className="helper-text">Add at least one skill to continue</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'education' && (
            <div className="form-step animate-slide-in">
              <h2 className="step-title">Education Background</h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="institution">Institution Name *</label>
                  <input
                    type="text"
                    id="institution"
                    value={education.institution_name}
                    onChange={(e) => handleEducationChange('institution_name', e.target.value)}
                    placeholder="University/College/School name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="degree">Degree *</label>
                  <input
                    type="text"
                    id="degree"
                    value={education.degree}
                    onChange={(e) => handleEducationChange('degree', e.target.value)}
                    placeholder="Bachelor's, Master's, etc."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fieldOfStudy">Field of Study *</label>
                  <input
                    type="text"
                    id="fieldOfStudy"
                    value={education.field_of_study}
                    onChange={(e) => handleEducationChange('field_of_study', e.target.value)}
                    placeholder="Computer Science, Business, etc."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Year *</label>
                  <input
                    type="number"
                    id="graduationYear"
                    value={education.graduation_year}
                    onChange={(e) => handleEducationChange('graduation_year', parseInt(e.target.value))}
                    min={1900}
                    max={2100}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'work' && (
            <div className="form-step animate-slide-in">
              <h2 className="step-title">Work Experience</h2>
              <p className="step-description">
                {role === 'Student' 
                  ? 'Add your work experience if you have any (optional)'
                  : 'Tell us about your current or most recent work experience'
                }
              </p>

              {role === 'Student' && (
                <div className="skip-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={skipWorkExperience}
                      onChange={(e) => setSkipWorkExperience(e.target.checked)}
                    />
                    <span>I don't have work experience yet</span>
                  </label>
                </div>
              )}

              {!skipWorkExperience && (
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="company">Company Name {role === 'Professional' ? '*' : ''}</label>
                    <input
                      type="text"
                      id="company"
                      value={workExperience.company_name}
                      onChange={(e) => handleWorkExperienceChange('company_name', e.target.value)}
                      placeholder="Company or organization name"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobTitle">Job Title {role === 'Professional' ? '*' : ''}</label>
                    <input
                      type="text"
                      id="jobTitle"
                      value={workExperience.job_title}
                      onChange={(e) => handleWorkExperienceChange('job_title', e.target.value)}
                      placeholder="Your role or position"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate">Start Date {role === 'Professional' ? '*' : ''}</label>
                    <input
                      type="date"
                      id="startDate"
                      value={workExperience.start_date}
                      onChange={(e) => handleWorkExperienceChange('start_date', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isCurrentJob}
                        onChange={(e) => {
                          setIsCurrentJob(e.target.checked);
                          if (e.target.checked) {
                            handleWorkExperienceChange('end_date', null);
                          }
                        }}
                      />
                      <span>I currently work here</span>
                    </label>
                  </div>

                  {!isCurrentJob && (
                    <div className="form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        value={workExperience.end_date || ''}
                        onChange={(e) => handleWorkExperienceChange('end_date', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="navigation-container">
          {step !== 'basic' && (
            <button
              type="button"
              onClick={handleBack}
              className="nav-btn secondary"
            >
              <FaArrowLeft />
              Back
            </button>
          )}
          
          <button
            type="button"
            onClick={step === 'work' ? handleSubmit : handleNext}
            disabled={
              loading || 
              (step === 'basic' && !isBasicInfoValid()) || 
              (step === 'education' && !isEducationValid()) || 
              (step === 'work' && !isWorkExperienceValid())
            }
            className={`nav-btn primary ${step !== 'basic' ? 'ml-auto' : ''}`}
          >
            {loading ? (
              'Creating Profile...'
            ) : step === 'work' ? (
              <>
                Complete Setup
                <FaCheck />
              </>
            ) : (
              <>
                Continue
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="sign-out-onboarding">
        <button
          type="button"
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 
import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import '@/css/onboarding.css';

interface CreateInterviewFormProps {
  onSubmit: (data: {
    company: string;
    role: string;
    difficulty: 'easy' | 'medium' | 'hard';
    outcome: 'selected' | 'rejected' | 'pending' | 'n/a';
    body: string;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CreateInterviewForm({ onSubmit, onCancel, isSubmitting = false }: CreateInterviewFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    difficulty: 'medium' as const,
    outcome: 'n/a' as const,
    body: '',
    tags: [] as string[]
  });
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim() || !formData.body.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await onSubmit({
      ...formData,
      tags
    });
  };

  return (
    <div className="create-interview-overlay">
      <div className="create-interview-modal">
        <div className="modal-header">
          <h2>Share Interview Experience</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="interview-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. Google, Microsoft, Startup Inc."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Software Engineer, Product Manager"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="outcome">Outcome</label>
              <select
                id="outcome"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                className="form-select"
              >
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
                <option value="n/a">N/A</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. algorithms, system-design, behavioral"
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Experience Details *</label>
            <MarkdownEditor
              value={formData.body}
              onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
              placeholder="Share your interview experience... What questions were asked? How was the process? Any tips for others?"
              rows={8}
              allowImageUpload={false}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Sharing...' : 'Share Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

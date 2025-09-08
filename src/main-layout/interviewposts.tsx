import { useState } from 'react';
import Loader from '@/components/Loader';
import CreateInterviewForm from '@/components/CreateInterviewForm';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useInterviewsQuery, useCreateInterview } from '@/hooks/queries/useInterviewsQuery';
import type { InterviewFilters } from '@/types/app.types';
import '@/css/interviews.css';

const InterviewPosts = () => {
  const [filters, setFilters] = useState<InterviewFilters>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data, isLoading, isError } = useInterviewsQuery(filters);
  const createInterview = useCreateInterview();

  if (isLoading) return <div className="interviews-container"><div className="interviews-loading"><Loader /></div></div>;
  if (isError) return <div className="interviews-container"><div className="interviews-error"><h3>Error</h3><p>Failed to load interviews.</p></div></div>;

  return (
    <div className="interviews-container">
      <div className="interviews-header">
        <div>
          <h1>Interview Experiences</h1>
          <p>Read community interview experiences</p>
        </div>
        <button
          className="submit-button"
          onClick={() => setShowCreateForm(true)}
        >
          Share Experience
        </button>
      </div>

      <div className="interviews-filters">
        <input
          className="filter-input"
          placeholder="Company"
          value={filters.company ?? ''}
          onChange={e => setFilters(prev => ({ ...prev, company: e.target.value }))}
        />
        <select className="filter-select" value={filters.difficulty ?? ''} onChange={e => setFilters(prev => ({ ...prev, difficulty: (e.target.value || undefined) as any }))}>
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select className="filter-select" value={filters.outcome ?? ''} onChange={e => setFilters(prev => ({ ...prev, outcome: (e.target.value || undefined) as any }))}>
          <option value="">Any outcome</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
          <option value="n/a">N/A</option>
        </select>
      </div>

      <div className="interviews-grid">
        {(data ?? []).map(p => (
          <div key={p.id} className="interview-card">
            <div className="interview-header">
              <h3 className="interview-title">{p.role} @ {p.company}</h3>
              <span className={`difficulty-badge difficulty-${p.difficulty || 'medium'}`}>{p.difficulty}</span>
            </div>
            {p.body && (
              <div className="interview-summary">
                <MarkdownRenderer content={p.body} />
              </div>
            )}
            <div className="interview-footer">
              <span className={`outcome-badge outcome-${p.outcome?.replace('/', '') || 'na'}`}>
                Outcome: {p.outcome}
              </span>
              <div className="interview-meta">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {data?.length === 0 && (
          <div className="interviews-empty">
            <h3>No interview posts found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateInterviewForm
          onSubmit={async (data) => {
            await createInterview.mutateAsync(data);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={createInterview.isPending}
        />
      )}
    </div>
  );
}

export default InterviewPosts
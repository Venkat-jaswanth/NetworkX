import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { useOpportunitiesQuery, useMarkOpportunitiesSeen } from '@/hooks/queries/useOpportunitiesQuery';
import type { OpportunityFilters } from '@/types/app.types';
import '@/css/opportunities.css';

const Opportunities = () => {
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const { data, isLoading, isError } = useOpportunitiesQuery(filters);
  const markSeen = useMarkOpportunitiesSeen();

  useEffect(() => {
    if (data && data.length >= 0) {
      markSeen().catch(console.error);
    }
  }, [data]);

  if (isLoading) return <div className="opportunities-container"><div className="opportunities-loading"><Loader /></div></div>;
  if (isError) return <div className="opportunities-container"><div className="opportunities-error"><h3>Error</h3><p>Failed to load opportunities.</p></div></div>;

  return (
    <div className="opportunities-container">
      <div className="opportunities-header">
        <h1>Opportunities</h1>
        <p>Jobs, internships and grants</p>
      </div>

      <div className="opportunities-filters">
        <input
          className="filter-input"
          placeholder="Search title/company..."
          value={filters.search ?? ''}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <input
          className="filter-input"
          placeholder="Location"
          value={filters.location ?? ''}
          onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
        />
        <select className="filter-select" value={filters.type ?? ''} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}>
          <option value="">All types</option>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="grant">Grant</option>
          <option value="freelance">Freelance</option>
        </select>
        <select className="filter-select" value={filters.seniority ?? ''} onChange={e => setFilters(prev => ({ ...prev, seniority: e.target.value || undefined }))}>
          <option value="">Any seniority</option>
          <option value="intern">Intern</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      <div className="opportunities-grid">
        {(data ?? []).map(o => (
          <div key={o.id} className="opportunity-card">
            <div className="opportunity-header">
              <h3 className="opportunity-title">{o.title}</h3>
              <span className="opportunity-type">{o.type}</span>
            </div>
            <div className="opportunity-company">{o.company_name}</div>
            <div className="opportunity-meta">
              {o.location} <span className="meta-separator"></span> {o.seniority}
            </div>
            <div className="opportunity-footer">
              {o.apply_url && <a href={o.apply_url} target="_blank" rel="noreferrer" className="apply-link">Apply</a>}
              {Array.isArray(o.tags) && o.tags.length > 0 && (
                <div className="opportunity-tags">
                  {o.tags.slice(0, 3).map((t, i) => (
                    <span key={i} className="opportunity-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {data?.length === 0 && (
          <div className="opportunities-empty">
            <h3>No opportunities found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Opportunities;
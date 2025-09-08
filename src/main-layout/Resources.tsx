import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { useResourcesQuery, useMarkResourcesSeen } from '@/hooks/queries/useResourcesQuery';
import type { ResourceFilters } from '@/types/app.types';
import '@/css/resources.css';

const Resources = () => {
  const [filters, setFilters] = useState<ResourceFilters>({});
  const { data, isLoading, isError } = useResourcesQuery(filters);
  const markSeen = useMarkResourcesSeen();

  useEffect(() => {
    if (data && data.length >= 0) {
      // mark as seen when the page/data loads
      markSeen().catch(console.error);
    }
  }, [data]);

  if (isLoading) return <div className="resources-container"><div className="resources-loading"><Loader /></div></div>;
  if (isError) return <div className="resources-container"><div className="resources-error"><h3>Error</h3><p>Failed to load resources.</p></div></div>;

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>Resources</h1>
        <p>Curated learning materials and useful links</p>
      </div>

      <div className="resources-filters">
        <input
          className="filter-input"
          placeholder="Search resources..."
          value={filters.search ?? ''}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <input
          className="filter-input"
          placeholder="Category"
          value={filters.category ?? ''}
          onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
        />
      </div>

      <div className="resources-grid">
        {(data ?? []).map(r => (
          <div key={r.id} className="resource-card">
            <div className="resource-header">
              <h3 className="resource-title">{r.title}</h3>
              <span className="resource-category">{r.category}</span>
            </div>
            {r.description && <p className="resource-description">{r.description}</p>}
            <div className="resource-footer">
              <a href={r.url ?? '#'} target="_blank" rel="noreferrer" className="resource-link">Open</a>
              {Array.isArray(r.tags) && r.tags.length > 0 && (
                <div className="resource-tags">
                  {r.tags.slice(0, 3).map((t, i) => (
                    <span key={i} className="resource-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {data?.length === 0 && (
          <div className="resources-empty">
            <h3>No resources found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources
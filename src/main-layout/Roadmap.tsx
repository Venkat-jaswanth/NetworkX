import { useState } from 'react';
import Loader from '@/components/Loader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useRoadmapsQuery, useRoadmapDetailQuery } from '@/hooks/queries/useRoadmapsQuery';
import '@/css/roadmaps.css';

const Roadmap = () => {
  const { data: roadmaps, isLoading, isError } = useRoadmapsQuery();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: detail, isLoading: loadingDetail } = useRoadmapDetailQuery(selected);

  if (isLoading) return <div className="roadmaps-container"><div className="roadmap-loading"><Loader /></div></div>;
  if (isError) return <div className="roadmaps-container"><div className="roadmap-error"><h3>Error</h3><p>Failed to load roadmaps.</p></div></div>;

  return (
    <div className="roadmaps-container">
      <div className="roadmaps-sidebar">
        <h2>Roadmaps</h2>
        <div className="roadmap-list">
          {(roadmaps ?? []).map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`roadmap-item ${selected === r.id ? 'selected' : ''}`}
            >
              <div className="roadmap-item-title">{r.title}</div>
              <div className="roadmap-item-category">{r.category}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="roadmap-content">
        {!selected && (
          <div className="roadmap-placeholder">
            <h3>Select a roadmap</h3>
            <p>Choose a roadmap from the sidebar to view its steps</p>
          </div>
        )}
        {selected && loadingDetail && <div className="roadmap-loading"><Loader /></div>}
        {selected && detail && (
          <div>
            <div className="roadmap-detail-header">
              <h2 className="roadmap-detail-title">{detail.roadmap.title}</h2>
              {detail.roadmap.description && (
                <div className="roadmap-detail-description">
                  <MarkdownRenderer content={detail.roadmap.description} />
                </div>
              )}
            </div>
            <div className="roadmap-steps">
              <ol>
                {detail.steps.map(s => (
                  <li key={s.id} className="roadmap-step">
                    <div className="roadmap-step-title">{s.title}</div>
                    {s.description && (
                      <div className="roadmap-step-description">
                        <MarkdownRenderer content={s.description} />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Roadmap
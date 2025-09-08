import { useState } from 'react';
import Loader from '@/components/Loader';
import { useMentorSearch, useIncomingMentorRequests } from '@/hooks/queries/useMentorQuery';
import { createMentorRequest } from '@/services/mentorService';
import '@/css/find-mentor.css';

const FindMentor = () => {
  const [filters, setFilters] = useState<{ expertise?: string[]; availability?: string }>({});
  const { data: mentors, isLoading, isError } = useMentorSearch(filters);
  const { data: incoming, isLoading: loadingIncoming } = useIncomingMentorRequests();
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  if (isLoading) return <div className="find-mentor-container"><div className="mentors-loading"><Loader /></div></div>;
  if (isError) return <div className="find-mentor-container"><div className="mentors-loading"><p>Failed to load mentors.</p></div></div>;

  return (
    <div className="find-mentor-container">
      <div className="mentors-section">
        <div className="mentors-header">
          <h1>Find a Mentor</h1>
          <p>Search experienced mentors and send a request</p>
        </div>
        <div className="mentor-filters">
          <input
            className="filter-input"
            placeholder="Expertise (comma separated)"
            onChange={e => setFilters(prev => ({ ...prev, expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          />
          <select className="filter-select" onChange={e => setFilters(prev => ({ ...prev, availability: e.target.value || undefined }))}>
            <option value="">Any availability</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="mentors-grid">
          {(mentors ?? []).map(m => (
            <div key={m.user_id} className="mentor-card">
              <div className="mentor-header">
                <div className="mentor-info">
                  <div className="mentor-name">{m.Users.full_name ?? 'Mentor'}</div>
                  <div className="mentor-availability">{m.availability}</div>
                </div>
                <button className="request-button" onClick={() => setRequestingId(m.user_id)}>Request</button>
              </div>
              {Array.isArray(m.expertise) && m.expertise.length > 0 && (
                <div className="mentor-expertise">
                  {m.expertise.slice(0, 4).map((t, i) => (
                    <span key={i} className="expertise-tag">{t}</span>
                  ))}
                </div>
              )}
              {requestingId === m.user_id && (
                <form
                  className="request-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await createMentorRequest(m.user_id, message);
                    setRequestingId(null);
                    setMessage('');
                    alert('Request sent');
                  }}
                >
                  <textarea
                    className="request-textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Introduce yourself and your goals"
                    rows={3}
                  />
                  <div className="request-actions">
                    <button className="send-button" type="submit">Send</button>
                    <button className="cancel-button" type="button" onClick={() => { setRequestingId(null); setMessage(''); }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
          {mentors?.length === 0 && (
            <div className="mentors-empty">
              <h3>No mentors found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>

      <div className="requests-sidebar">
        <h3>Incoming Requests</h3>
        {loadingIncoming && <div className="requests-loading"><Loader /></div>}
        {!loadingIncoming && (
          <div className="requests-list">
            {(incoming ?? []).map(r => (
              <div key={r.id} className="request-item">
                <div className="request-from">From: {r.requester.full_name}</div>
                <div className="request-message">{r.message}</div>
                <div className="request-status">Status: {r.status}</div>
              </div>
            ))}
            {incoming?.length === 0 && (
              <div className="requests-empty">
                <h3>No requests</h3>
                <p>You'll see mentor requests here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindMentor;


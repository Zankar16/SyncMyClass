import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFaculty, createPoll } from '../api';

export default function CreatePoll() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFaculty();
        setFaculty(data);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFaculty = (id) => {
    setSelectedFaculty((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFaculty.length < 2) {
      setMessage({ type: 'error', text: 'Select at least 2 faculty members.' });
      return;
    }
    setCreating(true);
    setMessage({ type: '', text: '' });
    try {
      await createPoll(prompt, selectedFaculty);
      setMessage({ type: 'success', text: '🎉 Poll created successfully!' });
      setTimeout(() => navigate('/polls'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">➕ Create New Poll</h1>
        <p className="page-subtitle">Set a prompt and choose faculty members as options. Poll will expire in 5 days.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {message.text && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prompt */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="poll-prompt">Poll Prompt</label>
            <input
              id="poll-prompt"
              className="form-input"
              type="text"
              placeholder="e.g. Choose the best faculty for DBMS"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          {/* Faculty Selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Select Faculty ({selectedFaculty.length} selected — minimum 2)
            </label>
            {faculty.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">No faculty found</div>
                <p>Register some faculty members first.</p>
              </div>
            ) : (
              <div className="checkbox-grid">
                {faculty.map((f) => {
                  const isChecked = selectedFaculty.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      className={`checkbox-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleFaculty(f.id)}
                    >
                      <div className="checkbox-box"></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {f.department || 'No department'} · {f.email}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview */}
          {prompt && selectedFaculty.length > 0 && (
            <div style={{
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'
              }}>
                Preview
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {prompt}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedFaculty.map((fid) => {
                  const f = faculty.find((x) => x.id === fid);
                  return f ? (
                    <span key={fid} style={{
                      fontSize: '0.8rem', padding: '0.25rem 0.65rem',
                      background: 'rgba(124, 58, 237, 0.15)',
                      borderRadius: '9999px', color: 'var(--accent-purple-light)'
                    }}>
                      {f.name}
                    </span>
                  ) : null;
                })}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ⏰ Expires in 5 days
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={creating || !prompt || selectedFaculty.length < 2}
          >
            {creating ? 'Creating Poll...' : '🚀 Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
}

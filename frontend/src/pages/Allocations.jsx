import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllocations } from '../api';

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllocations();
        setAllocations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Faculty Allocations</h1>
        <p className="page-subtitle">Faculty members allocated based on voting results</p>
      </div>

      {allocations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No allocations yet</div>
          <p>Allocations will appear here after polls are closed and faculty are assigned.</p>
        </div>
      ) : (
        <div className="grid-3">
          {allocations.map((a) => (
            <div key={a.id} className="glass-card allocation-card">
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                marginBottom: '0.25rem',
                background: 'var(--gradient-warm)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {a.faculty_name}
              </h3>
              {a.faculty_department && (
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                }}>
                  {a.faculty_department}
                </p>
              )}
              <div style={{
                background: 'rgba(15, 20, 50, 0.5)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '0.75rem',
              }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem',
                }}>
                  Allocated for
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {a.prompt}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                 {new Date(a.allocated_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
              <Link
                to={`/results/${a.poll_id}`}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                View Results →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

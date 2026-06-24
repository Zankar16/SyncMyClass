import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPollResults, allocateFaculty } from '../api';
import VoteBar from '../components/VoteBar';

export default function Results() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchResults = async () => {
    try {
      const res = await getPollResults(id);
      setData(res);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  const handleAllocate = async () => {
    setAllocating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await allocateFaculty(id);
      setMessage({ type: 'success', text: res.message });
      fetchResults();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setAllocating(false);
    }
  };

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Could not load results</div>
        </div>
      </div>
    );
  }

  const { poll, results, totalVotes, allocation } = data;
  const isExpired = new Date(poll.expires_at) <= new Date();
  const maxVotes = results.length > 0 ? Math.max(...results.map((r) => r.votes)) : 0;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}>
              {poll.prompt}
            </h1>
          </div>
          <div className="poll-meta">
            <span className="poll-meta-item">{totalVotes} total votes</span>
            {isExpired ? (
              <span className="badge badge-expired">Expired</span>
            ) : (
              <span className="badge badge-active">Active</span>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        {/* Allocation Banner */}
        {allocation && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(244, 63, 94, 0.1))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
              Faculty Allocated
            </h3>
            <p style={{
              fontSize: '1.25rem', fontWeight: 700,
              background: 'var(--gradient-warm)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {allocation.faculty_name}
            </p>
          </div>
        )}

        {/* Vote Bars */}
        <div className="vote-bar-container">
          {results.map((r) => (
            <VoteBar
              key={r.option_id}
              name={r.faculty_name}
              department={r.faculty_department}
              votes={r.votes}
              percentage={r.percentage}
              isWinner={r.votes === maxVotes && maxVotes > 0}
            />
          ))}
        </div>

        {/* Admin: Allocate Button */}
        {user.role === 'admin' && !allocation && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              className="btn btn-success btn-lg"
              onClick={handleAllocate}
              disabled={allocating || totalVotes === 0}
            >
              {allocating ? 'Allocating...' : 'Allocate Top Faculty'}
            </button>
            {totalVotes === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                No votes yet — cannot allocate
              </p>
            )}
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/polls" className="btn btn-secondary">← Back to Polls</Link>
        </div>
      </div>
    </div>
  );
}

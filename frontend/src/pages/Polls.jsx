import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActivePolls, getExpiredPolls, getAdminPolls } from '../api';
import CountdownTimer from '../components/CountdownTimer';

export default function Polls() {
  const { user } = useAuth();
  const [activePolls, setActivePolls] = useState([]);
  const [expiredPollsList, setExpiredPollsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'admin') {
          const all = await getAdminPolls();
          setActivePolls(all.filter(p => !p.isExpired));
          setExpiredPollsList(all.filter(p => p.isExpired));
        } else {
          const [active, expired] = await Promise.all([getActivePolls(), getExpiredPolls()]);
          setActivePolls(active);
          setExpiredPollsList(expired);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  const currentPolls = tab === 'active' ? activePolls : expiredPollsList;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Polls</h1>
        <p className="page-subtitle">
          {user.role === 'student' ? 'Cast your vote for the best faculty' : 'Manage and monitor all polls'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setTab('active')}
        >
          Active ({activePolls.length})
        </button>
        <button
          className={`btn ${tab === 'expired' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setTab('expired')}
        >
          Expired ({expiredPollsList.length})
        </button>
      </div>

      {currentPolls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{tab === 'active' ? '@' : '//'}</div>
          <div className="empty-state-title">
            {tab === 'active' ? 'No active polls' : 'No expired polls'}
          </div>
          <p>
            {tab === 'active'
              ? (user.role === 'admin' ? 'Create a new poll to get started' : 'Check back later')
              : 'Expired polls will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {currentPolls.map((poll) => (
            <Link
              key={poll.id}
              to={tab === 'expired' || poll.hasVoted || user.role !== 'student'
                ? `/results/${poll.id}`
                : `/polls/${poll.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="glass-card poll-card">
                <div className="poll-prompt">{poll.prompt}</div>
                <div className="poll-meta">
                  <span className="poll-meta-item">{poll.options.length} Faculty</span>
                  {tab === 'active' ? (
                    <span className="badge badge-active">Active</span>
                  ) : (
                    <span className="badge badge-expired">Expired</span>
                  )}
                  {poll.hasVoted && <span className="badge badge-allocated">Voted ✓</span>}
                  {poll.total_votes !== undefined && (
                    <span className="poll-meta-item">{poll.total_votes}</span>
                  )}
                </div>

                {/* Faculty preview */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem'
                }}>
                  {poll.options.map((opt) => (
                    <span
                      key={opt.option_id}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.65rem',
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        borderRadius: '9999px',
                        color: 'var(--accent-purple-light)'
                      }}
                    >
                      {opt.faculty_name}
                    </span>
                  ))}
                </div>

                {tab === 'active' && (
                  <CountdownTimer expiresAt={poll.expires_at} />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

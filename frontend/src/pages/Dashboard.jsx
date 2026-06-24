import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActivePolls, getAdminPolls, getAllocations } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pollsData, allocData] = await Promise.all([
          user.role === 'admin' ? getAdminPolls() : getActivePolls(),
          getAllocations(),
        ]);
        setPolls(pollsData);
        setAllocations(allocData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  const activePolls = polls.filter((p) => new Date(p.expires_at) > new Date());
  const expiredPolls = polls.filter((p) => new Date(p.expires_at) <= new Date());
  const votedPolls = polls.filter((p) => p.hasVoted);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {user.role === 'admin' ? 'Admin Dashboard' : ` Welcome, ${user.name}`}
        </h1>
        <p className="page-subtitle">
          {user.role === 'admin'
            ? 'Manage polls, view results, and allocate faculty'
            : 'View active polls, cast your votes, and see results'}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{activePolls.length}</div>
          <div className="stat-label">Active Polls</div>
        </div>
        {user.role === 'admin' ? (
          <div className="stat-card">
            <div className="stat-value">{polls.length}</div>
            <div className="stat-label">Total Polls</div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-value">{votedPolls.length}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-value">{expiredPolls.length}</div>
          <div className="stat-label">Expired Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{allocations.length}</div>
          <div className="stat-label">Allocations</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/polls" className="btn btn-primary">
          {user.role === 'admin' ? 'View All Polls' : 'Vote Now'}
        </Link>
        {user.role === 'admin' && (
          <Link to="/create-poll" className="btn btn-success">
            Create New Poll
          </Link>
        )}
        <Link to="/allocations" className="btn btn-secondary">
          View Allocations
        </Link>
      </div>

      {/* Recent Active Polls */}
      <h2 style={{ marginBottom: '1rem' }}>
        {user.role === 'admin' ? 'Recent Polls' : 'Active Polls'}
      </h2>
      {activePolls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No active polls</div>
          <p>{user.role === 'admin' ? 'Create a new poll to get started' : 'Check back later for new polls'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {activePolls.slice(0, 4).map((poll) => (
            <Link
              key={poll.id}
              to={user.role === 'admin' ? `/results/${poll.id}` : `/polls/${poll.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="glass-card poll-card">
                <div className="poll-prompt">{poll.prompt}</div>
                <div className="poll-meta">
                  <span className="poll-meta-item">👥 {poll.options.length} Faculty</span>
                  <span className="badge badge-active">Active</span>
                  {poll.hasVoted && <span className="badge badge-allocated">Voted ✓</span>}
                  {poll.total_votes !== undefined && (
                    <span className="poll-meta-item">{poll.total_votes} votes</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

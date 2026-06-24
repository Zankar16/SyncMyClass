import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoll, votePoll } from '../api';
import CountdownTimer from '../components/CountdownTimer';

export default function PollVote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPoll(id);
        setPoll(data);
        if (data.hasVoted) {
          setSelected(data.votedOptionId);
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleVote = async () => {
    if (!selected || poll.hasVoted) return;
    setVoting(true);
    setMessage({ type: '', text: '' });
    try {
      await votePoll(id, selected);
      setMessage({ type: 'success', text: 'Your vote has been recorded!' });
      setPoll((prev) => ({ ...prev, hasVoted: true, votedOptionId: selected }));
      setTimeout(() => navigate(`/results/${id}`), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  if (!poll) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Poll not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '0.75rem'
          }}>
            {poll.prompt}
          </h1>
          <CountdownTimer expiresAt={poll.expires_at} />
        </div>

        {message.text && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        {/* Options */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select a Faculty Member
        </h3>

        <div className="poll-options-list">
          {poll.options.map((opt) => {
            const isSelected = selected === opt.option_id;
            const isVoted = poll.hasVoted && poll.votedOptionId === opt.option_id;

            return (
              <div
                key={opt.option_id}
                className={`poll-option ${isSelected ? 'selected' : ''} ${isVoted ? 'voted' : ''}`}
                onClick={() => {
                  if (!poll.hasVoted) setSelected(opt.option_id);
                }}
                style={{ cursor: poll.hasVoted ? 'default' : 'pointer' }}
              >
                <div className="poll-option-radio"></div>
                <div>
                  <div className="poll-option-name">{opt.faculty_name}</div>
                  {opt.faculty_department && (
                    <div className="poll-option-dept">{opt.faculty_department}</div>
                  )}
                </div>
                {isVoted && (
                  <span className="badge badge-active" style={{ marginLeft: 'auto' }}>Your Vote</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        {!poll.hasVoted ? (
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={!selected || voting}
            onClick={handleVote}
          >
            {voting ? 'Submitting...' : 'Cast Your Vote'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div className="badge badge-active" style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}>
              You have already voted
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/results/${id}`)}>
                View Results →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

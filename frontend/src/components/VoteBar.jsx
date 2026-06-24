import { useState, useEffect } from 'react';

export default function VoteBar({ name, department, votes, percentage, isWinner }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="vote-bar-item">
      <div className="vote-bar-header">
        <div>
          <span className="vote-bar-name">{name}</span>
          {department && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              {department}
            </span>
          )}
          {isWinner && <span className="badge badge-winner" style={{ marginLeft: '0.75rem' }}>🏆 Top Faculty</span>}
        </div>
        <div className="vote-bar-stats">
          <span>{votes} vote{votes !== 1 ? 's' : ''}</span>
          <span className="vote-bar-percent">{percentage}%</span>
        </div>
      </div>
      <div className="vote-bar-track">
        <div
          className={`vote-bar-fill ${isWinner ? 'winner' : ''}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

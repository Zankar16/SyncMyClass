import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft.total <= 0) {
    return <span className="badge badge-expired">Expired</span>;
  }

  return (
    <div className="countdown">
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="countdown-label">Days</div>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="countdown-label">Hrs</div>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="countdown-label">Min</div>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="countdown-label">Sec</div>
      </div>
    </div>
  );
}

function getTimeLeft(expiresAt) {
  const total = new Date(expiresAt) - new Date();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

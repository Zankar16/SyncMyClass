import React, { useState, useEffect } from "react";

function Queue({ electiveType, onTurnCome, onCancel, studentId }) {
  const [position, setPosition] = useState(null);
  const [totalInQueue, setTotalInQueue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setError("Student ID is required");
      setLoading(false);
      return;
    }

    // Join queue and get initial position
    fetch("/api/queue/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, electiveType })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPosition(data.position);
          setTotalInQueue(data.totalInQueue);
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to join queue: " + err.message);
        setLoading(false);
      });
  }, [studentId, electiveType]);

  // Poll queue status periodically
  useEffect(() => {
    if (!polling || !studentId) return;

    const interval = setInterval(() => {
      fetch(`/api/queue/status?studentId=${studentId}&electiveType=${electiveType}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setPosition(data.position);
            setTotalInQueue(data.totalInQueue);
            
            // If position is 1, it's user's turn
            if (data.position === 1) {
              setPolling(false);
              onTurnCome();
            }
          }
        })
        .catch(err => console.error("Queue polling error:", err));
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [polling, studentId, electiveType, onTurnCome]);

  const handleCancel = () => {
    fetch("/api/queue/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, electiveType })
    })
      .then(res => res.json())
      .then(data => {
        onCancel();
      })
      .catch(err => console.error("Error leaving queue:", err));
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading queue...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "40px", color: "red" }}>Error: {error}</div>;
  }

  return (
    <div className="page-card queue-card">
      <h1>{electiveType} - Queue Status</h1>

      <div className="status-card">
        <div className="status-label">Your Position in Queue</div>
        <div className={`position-display ${position === 1 ? "position-ready" : "position-wait"}`}>
          {position === 1 ? "🎉 YOUR TURN!" : `#${position}`}
        </div>
        <div className="status-subtitle">Total people in queue: {totalInQueue}</div>
      </div>

      {position === 1 && (
        <div className="info-box info-success">
          ✓ It's your turn! Select a subject now.
        </div>
      )}

      <div className="info-block">
        <p>
          {position === 1
            ? "Please complete your subject selection."
            : `Please wait. ${position - 1} people ahead of you.`}
        </p>

        <button className="button-primary button-danger" onClick={handleCancel}>
          Cancel & Leave Queue
        </button>
      </div>

      <div className="subtle-text">
        Queue updates automatically. Do not refresh the page.
      </div>
    </div>
  );
}

export default Queue;

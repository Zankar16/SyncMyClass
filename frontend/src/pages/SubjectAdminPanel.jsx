import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubjectAdminPanel() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [newSubj, setNewSubj] = useState({ code: '', name: '', credits: 3, max_seats: 30, schedule_info: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSubjects(await res.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSubj)
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubj({ code: '', name: '', credits: 3, max_seats: 30, schedule_info: '' });
        fetchSubjects();
      } else {
        setError(data.message || 'Creation failed');
      }
    } catch (err) {
      setError('Creation error');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Manage Subjects</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="card">
          <h2>Add New Subject</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Course Code</label>
              <input type="text" className="form-input" required value={newSubj.code} onChange={e => setNewSubj({...newSubj, code: e.target.value})} placeholder="CS101" />
            </div>
            <div>
              <label className="form-label">Course Name</label>
              <input type="text" className="form-input" required value={newSubj.name} onChange={e => setNewSubj({...newSubj, name: e.target.value})} placeholder="Intro to CS" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Credits</label>
                <input type="number" className="form-input" required min="1" max="10" value={newSubj.credits} onChange={e => setNewSubj({...newSubj, credits: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="form-label">Max Seats</label>
                <input type="number" className="form-input" required min="1" value={newSubj.max_seats} onChange={e => setNewSubj({...newSubj, max_seats: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="form-label">Schedule Info</label>
              <input type="text" className="form-input" value={newSubj.schedule_info} onChange={e => setNewSubj({...newSubj, schedule_info: e.target.value})} placeholder="Mon/Wed 10:00 AM" />
            </div>
            <button type="submit" className="btn btn-primary">Create Subject</button>
          </form>
        </div>

        <div className="card">
          <h2>All Subjects</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Seats Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.code}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.credits}</td>
                    <td>
                      <span style={{ color: s.remaining_seats === 0 ? 'var(--error)' : 'inherit' }}>
                        {s.remaining_seats} / {s.max_seats}
                      </span>
                    </td>
                    <td>{s.is_open ? 'Open' : 'Closed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

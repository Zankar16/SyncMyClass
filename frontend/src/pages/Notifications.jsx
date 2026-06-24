import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, createNotification, markNotificationRead } from '../api';

// --- Student View ---
function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">My Notifications</h1>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-state">
          <div></div>
          <h3>You're all caught up!</h3>
          <p>No new notifications at this time.</p>
        </div>
      ) : (
        <div className="grid">
          {notifications.map(notif => (
            <div key={notif.id} className={`card ${notif.is_read ? '' : ''}`} style={{ opacity: notif.is_read ? 0.6 : 1, borderLeft: notif.priority === 'urgent' ? '4px solid #ef4444' : notif.priority === 'important' ? '4px solid #f59e0b' : '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{notif.title}</h3>
                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', backgroundColor: notif.priority === 'urgent' ? '#fee2e2' : notif.priority === 'important' ? '#fef3c7' : '#dbeafe', color: notif.priority === 'urgent' ? '#991b1b' : notif.priority === 'important' ? '#92400e' : '#1e40af' }}>
                  {notif.priority}
                </span>
              </div>
              <p style={{ color: '#04142c', marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{notif.message}</p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#021127' }}>
                  {new Date(notif.created_at).toLocaleString()}
                </span>
                {!notif.is_read && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleMarkRead(notif.id)}>
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Admin/Faculty View ---
function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [targets, setTargets] = useState([{ type: 'all', value: '' }]);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const addTarget = () => setTargets([...targets, { type: 'branch', value: '' }]);
  const removeTarget = (index) => setTargets(targets.filter((_, i) => i !== index));
  const updateTarget = (index, field, val) => {
    const newTargets = [...targets];
    newTargets[index][field] = val;
    setTargets(newTargets);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await createNotification({ title, message, priority, targets });
      setTitle(''); setMessage(''); setPriority('normal'); setTargets([{ type: 'all', value: '' }]);
      fetchNotifs();
      alert('Notification sent successfully!');
    } catch (err) {
      alert(err.message || 'Failed to send notification');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div className="page-header">
         <h1 className="page-title">Notification Center</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span></span> Compose Notification
            </h2>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input style={{ padding: '0.5rem', borderRadius: '1rem', border: '1px solid #010101' }} required value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification Title" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea style={{ padding: '0.5rem', borderRadius: '1rem', border: '1px solid #010101' }}  required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Detailed message body..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span>Target Audience</span>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addTarget}>+ Add Rule</button>
                </label>
                
                {targets.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
                    <select className="form-select" value={t.type} onChange={e => updateTarget(i, 'type', e.target.value)} style={{ flex: 1, padding: '0.25rem 0.5rem' }}>
                      <option value="all">Everyone</option>
                      <option value="student">Student ID</option>
                      <option value="branch">Branch (e.g. CSE)</option>
                      <option value="batch">Batch (e.g. 2023)</option>
                      <option value="year">Year (e.g. 2)</option>
                    </select>
                    {t.type !== 'all' && (
                      <input className="form-input" style={{ flex: 1, padding: '0.25rem 0.5rem' }} required placeholder="Enter query value" value={t.value} onChange={e => updateTarget(i, 'value', e.target.value)} />
                    )}
                    {targets.length > 1 && (
                      <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.5rem' }} onClick={() => removeTarget(i)} title="Remove Rule">×</button>
                    )}
                  </div>
                ))}
                <div style={{ fontSize: '0.8rem', color: '#0b2548', marginTop: '0.5rem' }}>
                  Recipients must match <strong>ANY</strong> of the rules above (OR logic).
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem' }}>
                Dispatch Notification
              </button>
            </form>
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '1.5rem', padding: '1rem 0' }}>Sent History</h2>
          {loading ? <div className="spinner"></div> : notifications.length === 0 ? (
            <div className="empty-state">No output history found in the system.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map(notif => (
                <div key={notif.id} className="card" style={{ borderLeft: notif.priority === 'urgent' ? '4px solid #ef4444' : notif.priority === 'important' ? '4px solid #f59e0b' : '4px solid #3b82f6', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{notif.title}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>
                      {notif.priority}
                    </span>
                  </div>
                  <p style={{ color: '#475569', marginBottom: '1rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{notif.message}</p>
                  
                  <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '0.25rem' }}><strong>Sent:</strong> {new Date(notif.created_at).toLocaleString()}</div>
                    <div>
                      <strong>Targeting:</strong> {' '}
                      {(() => {
                        try {
                          const tg = typeof notif.targets === 'string' ? JSON.parse(notif.targets) : notif.targets;
                          return !tg || tg.length === 0 ? 'Unknown' : tg.map(t => t.type === 'all' ? 'All Users' : `${t.type.toUpperCase()}: ${t.value}`).join(' OR ');
                        } catch(e) { return 'Invalid targets'; }
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'admin' || user.role === 'faculty') {
    return <AdminNotifications />;
  }
  return <StudentNotifications />;
}

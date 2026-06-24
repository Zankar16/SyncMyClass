import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', branch: '', batch: '', year: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerApi(form.name, form.email, form.password, form.role, form.department, form.branch, form.batch, form.year);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
        <h1 className="auth-title">Join SyncMyClass</h1>
        <p className="auth-subtitle">Create your account to start voting</p>

        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={6}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Role</label>
              <select id="reg-role" className="form-select" value={form.role} onChange={update('role')}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-dept">Department</label>
              <input
                id="reg-dept"
                className="form-input"
                type="text"
                placeholder="e.g. CS"
                value={form.department}
                onChange={update('department')}
              />
            </div>
          </div>

          {form.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-branch">Branch</label>
                <input id="reg-branch" className="form-input" type="text" placeholder="e.g. CSE" value={form.branch} onChange={update('branch')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-batch">Batch</label>
                <input id="reg-batch" className="form-input" type="text" placeholder="e.g. 2023" value={form.batch} onChange={update('batch')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-year">Year</label>
                <select id="reg-year" className="form-select" value={form.year} onChange={update('year')}>
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

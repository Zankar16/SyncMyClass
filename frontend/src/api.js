const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name, email, password, role, department, branch, batch, year) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, department, branch, batch, year }),
  });

export const getMe = () => request('/auth/me');

// Polls
export const getActivePolls = () => request('/polls');
export const getExpiredPolls = () => request('/polls/expired');
export const getPoll = (id) => request(`/polls/${id}`);
export const votePoll = (pollId, optionId) =>
  request(`/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId }),
  });
export const getPollResults = (pollId) => request(`/polls/${pollId}/results`);

// Admin
export const getFaculty = () => request('/admin/faculty');
export const createPoll = (prompt, facultyIds) =>
  request('/admin/polls', {
    method: 'POST',
    body: JSON.stringify({ prompt, facultyIds }),
  });
export const allocateFaculty = (pollId) =>
  request(`/admin/allocate/${pollId}`, { method: 'POST' });
export const getAllocations = () => request('/admin/allocations');
export const getAdminPolls = () => request('/admin/polls');

// Notifications
export const getNotifications = () => request('/notifications');
export const createNotification = (data) =>
  request('/notifications', { method: 'POST', body: JSON.stringify(data) });
export const markNotificationRead = (id) =>
  request(`/notifications/${id}/read`, { method: 'PUT' });

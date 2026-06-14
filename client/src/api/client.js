const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let authToken = null;

export function setToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request('/api/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me'),
  listLinks: () => request('/api/links'),
  createLink: (payload) =>
    request('/api/links', { method: 'POST', body: payload }),
  deleteLink: (id) => request(`/api/links/${id}`, { method: 'DELETE' }),
  getQr: (id) => request(`/api/links/${id}/qr`),
  getAnalytics: (id) => request(`/api/links/${id}/analytics`),
};

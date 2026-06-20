const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TOKEN_KEY = 'linkforge_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  register: (email, password) =>
    request('/api/auth/register', { method: 'POST', body: { email, password } }),
  verifyOtp: (email, code) =>
    request('/api/auth/verify-otp', { method: 'POST', body: { email, code } }),
  resendOtp: (email) =>
    request('/api/auth/resend-otp', { method: 'POST', body: { email } }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),
  me: () => request('/api/auth/me', { auth: true }),

  // Links
  listLinks: () => request('/api/links', { auth: true }),
  createLink: (payload) =>
    request('/api/links', { method: 'POST', body: payload, auth: true }),
  deleteLink: (id) =>
    request(`/api/links/${id}`, { method: 'DELETE', auth: true }),
  getQr: (id) => request(`/api/links/${id}/qr`, { auth: true }),
  getAnalytics: (id) => request(`/api/links/${id}/analytics`, { auth: true }),
};

export { API_URL };

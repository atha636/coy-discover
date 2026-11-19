const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

export const getFeed = () => request('/feed');
export const getMatches = () => request('/matches');
export const swipe = (profileId, action) =>
  request('/swipe', { method: 'POST', body: JSON.stringify({ profileId, action }) });
export const resetDemo = () => request('/reset', { method: 'POST' });

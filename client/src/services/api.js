/** Thin fetch wrapper. Throws Error with a human-readable message. */
async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Can’t reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    if (res.status === 401) window.dispatchEvent(new Event('qn:session-expired'));
    throw err;
  }
  return data;
}

export const authApi = {
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const notesApi = {
  list: () => request('/notes'),
  create: (note) => request('/notes', { method: 'POST', body: note }),
  update: (id, patch) => request(`/notes/${id}`, { method: 'PATCH', body: patch }),
  remove: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: any) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyOTP: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  getServices: () => request('/services'),
  getProviders: (serviceId) => request(`/services/${serviceId}/providers`),
  getAvailableDates: (providerId) => request(`/providers/${providerId}/dates`),
  getTimeSlots: (providerId, date) => request(`/providers/${providerId}/slots?date=${date}`),
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  processPayment: (body) => request('/payments', { method: 'POST', body: JSON.stringify(body) }),
};

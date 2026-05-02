const BASE = '/api';

const getHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// Auth
export const api = {
  signup: (body: object) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body: object) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) => request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body: object) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: object) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (body: object) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getCalendarEvents: (from: string, to: string) => request(`/dashboard/calendar?from=${from}&to=${to}`),

  // Services
  getServices: () => request('/services'),
  getServiceById: (id: number) => request(`/services/${id}`),
  createService: (body: object) => request('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: number, body: object) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  togglePublish: (id: number) => request(`/services/${id}/publish`, { method: 'PATCH' }),
  deleteService: (id: number) => request(`/services/${id}`, { method: 'DELETE' }),
  addQuestion: (serviceId: number, body: object) => request(`/services/${serviceId}/questions`, { method: 'POST', body: JSON.stringify(body) }),
  deleteQuestion: (serviceId: number, qid: number) => request(`/services/${serviceId}/questions/${qid}`, { method: 'DELETE' }),

  // Slots
  generateSlots: (body: object) => request('/slots/generate', { method: 'POST', body: JSON.stringify(body) }),
  getAvailableSlots: (service_id: number, date: string) => request(`/slots/available?service_id=${service_id}&date=${date}`),
  getAllSlots: (service_id: number, from?: string, to?: string) => {
    let url = `/slots?service_id=${service_id}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return request(url);
  },

  // Bookings
  getBookings: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/bookings${qs}`);
  },
  getBookingById: (id: number) => request(`/bookings/${id}`),
  updateBookingStatus: (id: number, status: string) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  rescheduleBooking: (id: number, new_slot_id: number) => request(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ new_slot_id }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminPendingServices: () => request('/admin/services/pending'),
  getAdminAllServices: (status?: string) => request(`/admin/services${status ? `?status=${status}` : ''}`),
  approveService: (id: number) => request(`/admin/services/${id}/approve`, { method: 'PATCH' }),
  rejectService: (id: number, reason: string) => request(`/admin/services/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getAdminAllUsers: (role?: string) => request(`/admin/users${role ? `?role=${role}` : ''}`),
  updateUserStatus: (id: number, is_active: boolean) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
  updateUserRole: (id: number, role: string) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  getAdminAllBookings: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/bookings${qs}`);
  },
  adminCancelBooking: (id: number) => request(`/admin/bookings/${id}/cancel`, { method: 'PATCH' }),

  // User (Customer)
  getActiveServices: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/user/services${qs}`);
  },
  getServiceDetailPublic: (id: number) => request(`/user/services/${id}`),
  userCreateBooking: (body: object) => request('/user/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getUserBookings: (status?: string) => request(`/user/my-bookings${status ? `?status=${status}` : ''}`),
  userCancelBooking: (id: number) => request(`/user/bookings/${id}/cancel`, { method: 'PATCH' }),
  userRescheduleBooking: (id: number, new_slot_id: number) => request(`/user/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ new_slot_id }) }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Meetings
  getMeetingLink: (bookingId: number) => request(`/meetings/${bookingId}`),
  updateMeetingStatus: (bookingId: number, status: string) => request(`/meetings/${bookingId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payments
  createPaymentOrder: (body: object) => request<any>('/payments/create-order', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (body: object) => request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),

  // Shared Links
  getServiceByToken: (token: string) => request<any>(`/user/services/shared/${token}`),
};

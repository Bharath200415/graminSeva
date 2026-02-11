import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp, role) => api.post('/auth/verify-otp', { phone, otp, role }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Complaint APIs
export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  trackByComplaintId: (complaintId) => api.get(`/complaints/track/${complaintId}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assign: (id, data) => api.post(`/complaints/${id}/assign`, data),
  resolve: (id, formData) => api.post(`/complaints/${id}/resolve`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  addNote: (id, note) => api.post(`/complaints/${id}/notes`, { note }),
  getStats: (params) => api.get('/complaints/stats/overview', { params }),
};

// Technician APIs
export const technicianAPI = {
  getAll: (params) => api.get('/technicians', { params }),
  getById: (id) => api.get(`/technicians/${id}`),
  create: (data) => api.post('/technicians', data),
  update: (id, data) => api.put(`/technicians/${id}`, data),
  delete: (id) => api.delete(`/technicians/${id}`),
  getStats: (id, params) => api.get(`/technicians/${id}/stats`, { params }),
  updateLocation: (location) => api.post('/technicians/location', location),
};

// Report APIs
export const reportAPI = {
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  getDashboard: () => api.get('/reports/dashboard'),
};

export default api;
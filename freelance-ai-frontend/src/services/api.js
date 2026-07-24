import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT token to every request automatically
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — auto logout if token expired
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login',    data),
};

// ── User ──────────────────────────────────────────────
export const userAPI = {
  getProfile:    ()     => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
};

// ── Resume ────────────────────────────────────────────
export const resumeAPI = {
  upload:    (formData) => API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStatus: (id) => API.get(`/resume/status/${id}`),
  getMine:   ()   => API.get('/resume/my'),
};

// ── Jobs ─────────────────────────────────────────────
export const jobsAPI = {
  fetch:   (data)   => API.post('/jobs/fetch', data),
  getAll:  (params) => API.get('/jobs',        { params }),
  getById: (id)     => API.get(`/jobs/${id}`),
  clear:   ()       => API.delete('/jobs/clear'),
};

// ── Matching ──────────────────────────────────────────
export const matchAPI = {
  matchJob:   (data) => API.post('/match/job',  data),
  matchAll:   (data) => API.post('/match/all',  data),
  getResults: ()     => API.get('/match/results'),
  getTop:     ()     => API.get('/match/top'),
};

// ── Apply Assistant ───────────────────────────────────
export const applyAPI = {
  scan:      (data) => API.post('/apply/scan',       data),
  mapFields: (data) => API.post('/apply/map-fields', data),
  fill:      (data) => API.post('/apply/fill',       data, { timeout: 660000 }),
};
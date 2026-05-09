import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me')
};

// Quiz API calls
export const quizAPI = {
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  getAllQuizzes: (params = {}) => api.get('/quizzes', { params }),
  getCategories: () => api.get('/quizzes/categories/list'),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  deleteQuiz: (id, params = {}) => api.delete(`/quizzes/${id}`, { params })
};

// Attempt API calls
export const attemptAPI = {
  submitAnswers: (attemptData) => api.post('/attempts', attemptData),
  saveProgress: (progressData) => api.post('/attempts/progress', progressData),
  getProgress: (quizId, userId) => api.get(`/attempts/progress/${quizId}`, { params: { userId } }),
  getAttempt: (attemptId) => api.get(`/attempts/${attemptId}`),
  getQuizAttempts: (quizId) => api.get(`/attempts/quiz/${quizId}`),
  getUserAttempts: (userId) => api.get(`/attempts/user/${userId}`),
  getQuizStatistics: (quizId) => api.get(`/attempts/stats/${quizId}`)
};

// Image API calls
export const imageAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteImage: (filename) => api.delete(`/images/${filename}`)
};

export default api;

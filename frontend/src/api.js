import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

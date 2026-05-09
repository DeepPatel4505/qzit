import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error('Error fetching current user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register({
        username,
        email,
        password,
        confirmPassword
      });
      
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, password });
      
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

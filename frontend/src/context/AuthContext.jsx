import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pizza_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const register = async (name, email, password, phone = '') => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, phone });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('pizza_user', JSON.stringify(userData));
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/admin/login`, { email, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('pizza_user', JSON.stringify(userData));
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Admin login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const googleLogin = async (googleUser) => {
    setLoading(true);
    setAuthError(null);
    const payload = {
      name: googleUser?.name || 'Google User',
      email: googleUser?.email || 'user.google@gmail.com',
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, payload);
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('pizza_user', JSON.stringify(userData));
      setLoading(false);
      return userData;
    } catch (err) {
      const demoUser = {
        _id: 'google_' + Date.now(),
        name: payload.name,
        email: payload.email,
        role: 'user',
        isVerified: true,
        token: 'google_demo_jwt_token_' + Date.now(),
      };
      setUser(demoUser);
      localStorage.setItem('pizza_user', JSON.stringify(demoUser));
      setLoading(false);
      return demoUser;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pizza_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        register,
        login,
        adminLogin,
        googleLogin,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la connexion' };
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de l\'inscription' };
    }
  };

  const googleAuth = async (credential) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { credential });
      if (res.data.isExistingUser) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, isExistingUser: true };
      } else {
        return { success: true, isExistingUser: false, googleData: res.data.googleData };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec Google' };
    }
  };

  const googleRegister = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google/register`, data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la création' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/auth/update`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la mise à jour' };
    }
  };

  const deleteAccount = async (password) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/auth/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }
      });
      localStorage.removeItem('token');
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la suppression' };
    }
  };

  const sendVerificationCode = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/send-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de l\'envoi' };
    }
  };

  const verifyEmail = async (code) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/auth/verify-email`, { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la vérification' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de l\'envoi' };
    }
  };

  const verifyResetCode = async (email, code) => {
    try {
      await axios.post(`${API_URL}/auth/verify-reset-code`, { email, code });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Code invalide' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, code, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Échec de la réinitialisation' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, googleAuth, googleRegister,
      updateUser, deleteAccount,
      sendVerificationCode, verifyEmail,
      forgotPassword, verifyResetCode, resetPassword,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

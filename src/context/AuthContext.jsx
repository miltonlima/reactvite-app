import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Here you could fetch user data if you have an endpoint for it
      // For now, we'll just assume the user is authenticated if there's a token
      setUser({ authenticated: true }); 
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      const authToken = data?.token ?? data?.Token;
      if (!authToken) {
        throw new Error('Token não recebido da API.');
      }

      setToken(authToken);
      localStorage.setItem('token', authToken);
      api.defaults.headers.Authorization = `Bearer ${authToken}`;
      setUser(data?.user ?? { authenticated: true });
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/registrations', userData);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
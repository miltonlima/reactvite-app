import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Lock the application to the dark theme to keep page backgrounds consistent.
const normalizeTheme = () => 'dark';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => normalizeTheme(localStorage.getItem('theme')));
  const skipEffectFetchRef = useRef(false);

  const applyThemeToDom = useCallback((value) => {
    const normalized = normalizeTheme(value);
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${normalized}-mode`);
    document.documentElement.setAttribute('data-theme', normalized);
    localStorage.setItem('theme', normalized);
  }, []);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme, applyThemeToDom]);

  const fetchProfile = useCallback(async () => {
    const { data } = await api.get('/users/me');
    setUser(data);
    const preferredTheme = normalizeTheme(data?.theme);
    setTheme(preferredTheme);
    return data;
  }, []);

  useEffect(() => {
    if (!token) {
      delete api.defaults.headers.Authorization;
      setUser(null);
      setLoading(false);
      const storedTheme = normalizeTheme(localStorage.getItem('theme'));
      setTheme(storedTheme);
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    if (skipEffectFetchRef.current) {
      skipEffectFetchRef.current = false;
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchProfile()
      .catch((error) => {
        console.error('Failed to fetch profile', error);
        if (!isMounted) {
          return;
        }
        setUser(null);
        setTheme('dark');
        localStorage.removeItem('token');
        delete api.defaults.headers.Authorization;
        setToken(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, fetchProfile]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      const authToken = data?.token ?? data?.Token;
      if (!authToken) {
        throw new Error('Token não recebido da API.');
      }

      setToken(authToken);
      localStorage.setItem('token', authToken);
      api.defaults.headers.Authorization = `Bearer ${authToken}`;

      skipEffectFetchRef.current = true;
      setLoading(true);
      const profile = await fetchProfile();
      setLoading(false);
      return profile;
    } catch (error) {
      console.error('Login failed', error);
      setLoading(false);
      localStorage.removeItem('token');
      delete api.defaults.headers.Authorization;
      setToken(null);
      setUser(null);
      setTheme('dark');
      throw error;
    }
  }, [fetchProfile]);

  const register = useCallback(async (userData) => {
    try {
      await api.post('/registrations', userData);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setTheme('dark');
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    applyThemeToDom('dark');
  }, [applyThemeToDom]);

  const updateThemePreference = useCallback((value) => {
    const normalized = normalizeTheme(value);
    setTheme(normalized);
    setUser((prev) => (prev ? { ...prev, theme: normalized } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        theme,
        loading,
        login,
        register,
        logout,
        updateThemePreference,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
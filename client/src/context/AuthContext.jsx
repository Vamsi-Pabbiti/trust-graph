import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trust_graph_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('trust_graph_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('trust_graph_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

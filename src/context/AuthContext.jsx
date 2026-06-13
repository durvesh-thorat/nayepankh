import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const storedToken = localStorage.getItem('np_token');
    const storedUser = localStorage.getItem('np_user');
    const storedRole = localStorage.getItem('np_role');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedRole) setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData, userRole) => {
    setToken(newToken);
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('np_token', newToken);
    if (userData) localStorage.setItem('np_user', JSON.stringify(userData));
    localStorage.setItem('np_role', userRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('np_token');
    localStorage.removeItem('np_user');
    localStorage.removeItem('np_role');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isAuthenticated: !!token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

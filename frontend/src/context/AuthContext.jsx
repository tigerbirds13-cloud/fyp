import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize auth from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const clearAuthStorage = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
      };

      try {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
          // Verify token is still valid by checking /api/auth/me
          try {
            const response = await fetch(`${API_BASE}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              const role = data?.data?.user?.role || 'seeker';
              setToken(storedToken);
              setUser(data.data.user);
              setIsLoggedIn(true);
              setIsAdmin(role === 'admin');
              localStorage.setItem('userRole', role);
              localStorage.setItem('userName', data?.data?.user?.name || '');
              localStorage.setItem('userId', data?.data?.user?._id || '');
            } else {
              // Token is invalid, clear storage
              clearAuthStorage();
              setIsLoggedIn(false);
              setIsAdmin(false);
            }
          } catch (error) {
            console.error('Error verifying token:', error);
            clearAuthStorage();
            setIsLoggedIn(false);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData, authToken, role) => {
    setToken(authToken);
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(role === 'admin');

    localStorage.setItem('token', authToken);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userId', userData._id);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

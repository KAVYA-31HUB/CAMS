import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cams_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cams_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cams_token');
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          const profile = res.data;
          const userObj = {
            id: profile.userId,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
            phone: profile.phone,
            applicantId: profile.applicant ? profile.applicant.id : null,
          };
          setUser(userObj);
          localStorage.setItem('cams_user', JSON.stringify(userObj));
        } catch (err) {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const data = res.data;

    const userObj = {
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      applicantId: data.applicantId,
    };

    setToken(data.token);
    setUser(userObj);
    localStorage.setItem('cams_token', data.token);
    localStorage.setItem('cams_user', JSON.stringify(userObj));

    return userObj;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const data = res.data;

    const userObj = {
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      applicantId: data.applicantId,
    };

    setToken(data.token);
    setUser(userObj);
    localStorage.setItem('cams_token', data.token);
    localStorage.setItem('cams_user', JSON.stringify(userObj));

    return userObj;
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('cams_token');
      localStorage.removeItem('cams_user');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getProfile();
      const profile = res.data;
      const userObj = {
        id: profile.userId,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        applicantId: profile.applicant ? profile.applicant.id : null,
      };
      setUser(userObj);
      localStorage.setItem('cams_user', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'APPLICANT': return '/applicant';
      case 'COUNSELLOR': return '/counsellor';
      case 'PROGRAMME_COORDINATOR':
      case 'COORDINATOR': return '/coordinator';
      case 'REGISTRAR': return '/registrar';
      case 'FINANCE_OFFICER':
      case 'FINANCE': return '/finance';
      case 'ADMINISTRATOR':
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user ? user.role : null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

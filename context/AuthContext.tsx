'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import http from '@/services/http';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await http.get('/auth/profile');
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    try {
      const response = await http.post('/auth/login', { email, password, role });
      const { user: userData, token: authToken } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw error.response?.data?.msg || error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, role: string) => {
    try {
      const response = await http.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password, 
        role 
      });
      const { user: userData, token: authToken } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw error.response?.data?.msg || error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
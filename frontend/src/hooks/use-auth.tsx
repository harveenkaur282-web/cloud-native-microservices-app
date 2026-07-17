'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '@/services/api';
import { User, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<LoginResponse>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
      localStorage.setItem('user_id', response.data.id.toString());
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>('/users/login', credentials);
      const { access_token, username } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Fetch full profile immediately to obtain user ID
      const userProfile = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      setUser(userProfile.data);
      localStorage.setItem('user_id', userProfile.data.id.toString());
      
      return response.data;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    const response = await api.post('/users/register', data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const refreshUser = async () => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) return null;
    
    try {
      const response = await api.get<User>('/users/me');
      setUser(response.data);
      localStorage.setItem('user_id', response.data.id.toString());
      return response.data;
    } catch (error) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

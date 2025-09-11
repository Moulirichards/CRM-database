import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode first
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    
    if (isDemoMode) {
      // Set demo user
      const demoUser: User = {
        id: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'manager' // Default to manager role for demo
      };
      setUser(demoUser);
      setToken('demo-token');
      setIsLoading(false);
      return;
    }

    // Check for stored token on app load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if in demo mode
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    
    if (isDemoMode) {
      const demoUser: User = {
        id: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'manager' // Default to manager role for demo
      };
      setUser(demoUser);
      setToken('demo-token');
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store the token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Check if in demo mode
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    
    if (isDemoMode) {
      // Clear demo mode
      localStorage.removeItem('demoMode');
    }
    
    // Clear the stored token and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Check if we're in demo mode and set isAuthenticated accordingly
  const isDemoMode = localStorage.getItem('demoMode') === 'true';
  const isAuthenticated = isDemoMode ? true : (!!user && !!token);

  const value: AuthContextType = {
    user: isDemoMode ? {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'manager'
    } : user,
    token: isDemoMode ? 'demo-token' : token,
    login,
    logout,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

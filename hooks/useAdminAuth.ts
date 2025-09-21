
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_PASSWORD = 'admin123'; // In production, this should be more secure

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem(ADMIN_AUTH_KEY);
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      AsyncStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    try {
      await AsyncStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return {
    isAuthenticated,
    loading,
    login,
    logout,
  };
};

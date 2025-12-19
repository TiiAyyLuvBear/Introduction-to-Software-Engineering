/**
 * Auth Context
 * 
 * Quản lý authentication state cho toàn app
 * Cung cấp: currentUser, loading, login, register, logout
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import * as authService from '../services/authService';

// Create context
const AuthContext = createContext({});

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User logged in - Fetch full user data from backend
          try {
            const userData = await authService.getCurrentUser();
            setCurrentUser({
              ...userData,
              firebaseUser
            });
          } catch (error) {
            console.error('Failed to get user data from backend:', error);
            // Nếu backend fail, vẫn set basic user info từ Firebase
            setCurrentUser({
              _id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              firebaseUser
            });
          }
        } else {
          // User logged out
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await authService.login(email, password);
      setCurrentUser({
        ...result.user,
        firebaseUser: result.firebaseUser
      });
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (email, password, name) => {
    try {
      setError(null);
      const result = await authService.register(email, password, name);
      setCurrentUser({
        ...result.user,
        firebaseUser: result.firebaseUser
      });
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await authService.loginWithGoogle();
      setCurrentUser({
        ...result.user,
        firebaseUser: result.firebaseUser
      });
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      return await authService.forgotPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
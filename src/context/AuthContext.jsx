// client/src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for', username);
      const response = await authService.login(username, password);
      console.log('Login success:', response);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      throw error;
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const response = await authService.verifyOTP(userId, otp);
      return response.resetToken;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      throw error;
    }
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    try {
      await authService.resetPassword(resetToken, newPassword, confirmPassword);
      toast.success('Password reset successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        forgotPassword,
        verifyOTP,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

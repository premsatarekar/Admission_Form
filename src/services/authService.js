// client/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const login = async (username, password) => {
  console.log('Trying login with:', { username, password });
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

const verifyOTP = async (userId, otp) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { userId, otp });
  return response.data;
};

const resetPassword = async (resetToken, newPassword, confirmPassword) => {
  const response = await axios.post(
    `${API_URL}/reset-password`,
    { newPassword, confirmPassword },
    { headers: { 'x-reset-token': resetToken } }
  );
  return response.data;
};

export default {
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};

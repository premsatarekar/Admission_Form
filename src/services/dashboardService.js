import axios from 'axios';

const handleError = (error) => {
  console.error('API Error:', error);
  throw error.response?.data?.message || 'Network error occurred';
};

export const getDashboardStats = async () => {
  try {
    const { data } = await axios.get('/api/dashboard/stats');
    return data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getRecentRegistrations = async () => {
  try {
    const { data } = await axios.get('/api/dashboard/recent-registrations');
    return data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCourseDistribution = async () => {
  try {
    const { data } = await axios.get('/api/dashboard/course-distribution');
    return data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getPaymentHandlers = async () => {
  try {
    const { data } = await axios.get('/api/dashboard/payment-handlers');
    return data.data;
  } catch (error) {
    handleError(error);
  }
};
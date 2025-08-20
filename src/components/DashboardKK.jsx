import {
  Box,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaChartPie,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaMobileAlt,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserGraduate,
  FaUserTie,
  FaUsers,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardKK.css';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

const DashboardKK = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    amountCollected: 0,
    pendingAmount: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [paymentHandlers, setPaymentHandlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const formatINR = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const updateClock = () => {
    const now = new Date();
    const istDate = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    if (!currentTime) {
      istDate.setFullYear(2025);
      istDate.setMonth(7); // August (0-based index)
      istDate.setDate(19);
      istDate.setHours(12);
      istDate.setMinutes(59);
      istDate.setSeconds(0);
    }
    const time = istDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const date = istDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setCurrentTime(`${time} | ${date}`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${BASE_URL}/kaushal-kendra`, {
        timeout: 10000,
      });
      const data = res.data.data || [];

      const totalStudents = data.length;
      const amountCollected = data.reduce(
        (sum, reg) => sum + (parseFloat(reg.amountPaid) || 0),
        0
      );
      const pendingAmount = data.reduce(
        (sum, reg) => sum + (parseFloat(reg.feesRemaining) || 0),
        0
      );

      setStats({
        totalStudents,
        amountCollected: formatINR(amountCollected),
        pendingAmount: formatINR(pendingAmount),
      });

      const recent = data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map((reg) => ({
          name: reg.name,
          course: reg.course,
          date: reg.date,
          paymentType:
            reg.feesRemaining === 0
              ? 'Full Paid'
              : reg.paymentMode || 'Pending',
        }));

      setRecentRegistrations(recent);

      const courseRes = await axios.get(`${BASE_URL}/courses-kaushal-kendra`, {
        timeout: 10000,
      });
      const courses = courseRes.data.data || [];
      const distribution = courses.map((course) => ({
        name: course.name,
        count: data.filter((reg) => reg.course === course.name).length,
      }));
      setCourseDistribution(distribution);

      const handlers = [
        { name: 'Mr. Rohan', value: 'Rohan' },
        { name: 'Mr. Gururaj Gote', value: 'Gururaj' },
      ];
      const handlerData = handlers.map((handler) => {
        const registrations = data.filter(
          (reg) => reg.handedTo === handler.value
        );
        const students = registrations.length;
        const amount = registrations.reduce(
          (sum, reg) => sum + (parseFloat(reg.amountPaid) || 0),
          0
        );
        return { name: handler.name, students, amount: formatINR(amount) };
      });
      setPaymentHandlers(handlerData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const goToForms = () => navigate('/home');
  const goToList = () => navigate('/kaushal-kendra-list');

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'Pending':
        return <FaClock color="#ff9800" />;
      case 'PhonePe':
        return <FaMobileAlt color="#2196f3" />;
      case 'Cheque':
        return <FaMoneyBillWave color="#4caf50" />;
      case 'Full Paid':
        return <FaCheckCircle color="#4caf50" />;
      default:
        return <FaMoneyBillWave color="#9c27b0" />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4, color: '#1a3c34' }}
        >
          Loading...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4, color: '#1a3c34' }}
        >
          Error
        </Typography>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchDashboardData}
          sx={{ mt: 2 }}
          startIcon={<FaChartPie />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#1a3c34' }}
          >
            Kaushal Kendra
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Admin Dashboard
          </Typography>
        </Box>
        <div className="clock-container">
          <FaCalendarAlt size={20} />
          {currentTime}
        </div>
      </div>

      <div className="section">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <div className="stat-box">
              <Box display="flex" alignItems="center" mb={2}>
                <FaUsers size={24} color="#3f51b5" />
                <Typography variant="h6" sx={{ ml: 1, color: '#1a3c34' }}>
                  Total Students
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#3f51b5' }}
              >
                {stats.totalStudents}
              </Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <div className="stat-box">
              <Box display="flex" alignItems="center" mb={2}>
                <FaDollarSign size={24} color="#4caf50" />
                <Typography variant="h6" sx={{ ml: 1, color: '#1a3c34' }}>
                  Amount Collected
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#4caf50' }}
              >
                {stats.amountCollected}
              </Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <div className="stat-box">
              <Box display="flex" alignItems="center" mb={2}>
                <FaClock size={24} color="#ff9800" />
                <Typography variant="h6" sx={{ ml: 1, color: '#1a3c34' }}>
                  Pending Amount
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#ff9800' }}
              >
                {stats.pendingAmount}
              </Typography>
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <div className="stat-box">
              <Box display="flex" alignItems="center" mb={2}>
                <FaUserTie size={24} color="#9c27b0" />
                <Typography variant="h6" sx={{ ml: 1, color: '#1a3c34' }}>
                  Admin
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                {user?.username || 'Admin'}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className="section">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#1a3c34' }}
            >
              Recent Registrations
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: '#1a3c34' }} />
            {recentRegistrations.length > 0 ? (
              recentRegistrations.map((reg, index) => (
                <div
                  key={index}
                  className={`recent-registration-item ${reg.paymentType
                    .toLowerCase()
                    .replace(' ', '-')}`}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', color: '#1a3c34' }}
                      >
                        {reg.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reg.course} • {reg.date}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {getPaymentIcon(reg.paymentType)}
                    </Box>
                  </Box>
                </div>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent registrations found.
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#1a3c34' }}
            >
              Course Distribution
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: '#1a3c34' }} />
            <div className="table-container">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1a3c34' }}>
                      Course
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 'bold', color: '#1a3c34' }}
                    >
                      Students
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courseDistribution.map((course, index) => (
                    <TableRow key={index}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell align="right">{course.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className="section">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#1a3c34' }}
            >
              Top Payment Handlers
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: '#1a3c34' }} />
            {paymentHandlers.map((handler, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', color: '#1a3c34' }}
                >
                  {handler.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {handler.students} students • {handler.amount}
                </Typography>
              </Box>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#1a3c34' }}
            >
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: '#1a3c34' }} />
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={goToForms}
                startIcon={<FaUserGraduate />}
                sx={{ bgcolor: '#3f51b5', '&:hover': { bgcolor: '#2c3e50' } }}
                className="action-button"
              >
                Add New Admission
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={goToList}
                startIcon={<FaChartPie />}
                sx={{ bgcolor: '#0288d1', '&:hover': { bgcolor: '#01579b' } }}
                className="action-button"
              >
                View Admission List
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={logout}
                startIcon={<FaSignOutAlt />}
                sx={{ bgcolor: '#d81b60', '&:hover': { bgcolor: '#b0003a' } }}
                className="action-button"
              >
                Logout
              </Button>
            </Box>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default DashboardKK;

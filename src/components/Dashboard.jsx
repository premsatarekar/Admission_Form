import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  FaChartPie,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaMobileAlt,
  FaMoneyBillWave,
  FaUserGraduate,
  FaUserTie,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f5f7fa;
`;

const StatCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const RecentRegistrationCard = styled(Card)`
  margin-bottom: 1rem;
  border-left: 4px solid
    ${(props) =>
      props.paymenttype === 'pending'
        ? '#ff9800'
        : props.paymenttype === 'card'
        ? '#4caf50'
        : '#2196f3'};
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sample data - replace with your actual data
  const stats = {
    totalStudents: 3,
    amountCollected: '₹1,10,000',
    pendingAmount: '₹30,000',
  };

  const recentRegistrations = [
    {
      name: 'Rahul Verma',
      course: 'QA Testing',
      date: '12/8/2025, 11:17:31 am',
      paymentType: 'pending',
    },
    {
      name: 'Priya Sharma',
      course: 'Full Stack',
      date: '12/8/2025, 3:47:31 am',
      paymentType: 'card',
    },
    {
      name: 'Aarav Mehta',
      course: 'Data Science',
      date: '10/8/2025, 11:47:31 am',
      paymentType: 'upi',
    },
  ];

  const courseDistribution = [
    { name: 'Kaushal Kendra', count: 0 },
    { name: 'Data Science', count: 1 },
    { name: 'Full Stack', count: 1 },
    { name: 'Cyber Security', count: 0 },
    { name: 'QA Testing', count: 1 },
    { name: 'Embedded System', count: 0 },
  ];

  const paymentHandlers = [
    { name: 'Mr. Gururaj Gote', students: 2, amount: '₹60,000' },
    { name: 'Mr. Rohan', students: 1, amount: '₹50,000' },
  ];

  const goToForms = () => navigate('/home');

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'pending':
        return <FaClock color="#ff9800" />;
      case 'card':
        return <FaCreditCard color="#4caf50" />;
      case 'upi':
        return <FaMobileAlt color="#2196f3" />;
      default:
        return <FaMoneyBillWave />;
    }
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Student Manager
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Vizionexl — Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Students */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FaUserGraduate size={24} color="#3f51b5" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Students
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Amount Collected */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FaMoneyBillWave size={24} color="#4caf50" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Amount Collected
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#4caf50' }}
              >
                {stats.amountCollected}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Pending Amount */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FaClock size={24} color="#ff9800" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pending Amount
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: '#ff9800' }}
              >
                {stats.pendingAmount}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Admin Info */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FaUserTie size={24} color="#9c27b0" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Admin
                </Typography>
              </Box>
              <Typography variant="h6">{user?.username || 'Admin'}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Registrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Registrations
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {recentRegistrations.map((reg, index) => (
                <RecentRegistrationCard
                  key={index}
                  paymenttype={reg.paymentType}
                  sx={{ mb: 2 }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {reg.name}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        {getPaymentIcon(reg.paymentType)}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {reg.course} • {reg.date}
                    </Typography>
                  </CardContent>
                </RecentRegistrationCard>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Course Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Course Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell align="right">Students</TableCell>
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
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Handlers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Payment Handlers
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {paymentHandlers.map((handler, index) => (
                <Box
                  key={index}
                  sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {handler.name}
                  </Typography>
                  <Typography variant="body2">
                    {handler.students} students • {handler.amount}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={goToForms}
                  startIcon={<FaUserGraduate />}
                >
                  Manage Students
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<FaChartPie />}
                >
                  View Reports
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={logout}
                  startIcon={<FaCheckCircle />}
                >
                  Logout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;

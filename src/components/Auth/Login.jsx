// client/src/components/Auth/Login.js
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StyledPaper = styled(Paper)`
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledForm = styled.form`
  width: 100%;
  margin-top: 1rem;
`;

const StyledButton = styled(Button)`
  margin: 1rem 0 !important;
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      // No need to setLoading(false) here as navigation will happen
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false); // reset loading on error
      alert(error.response?.data?.message || 'Login failed'); // show alert for feedback
    }
  };

  return (
    <LoginContainer>
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
          <Typography component="h1" variant="h4" color="primary">
            Sign In
          </Typography>
        </Box>

        <StyledForm onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </StyledButton>
        </StyledForm>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" align="center">
              Forgot password?
            </Typography>
          </Link>
        </Box>
      </StyledPaper>
    </LoginContainer>
  );
};

export default Login;

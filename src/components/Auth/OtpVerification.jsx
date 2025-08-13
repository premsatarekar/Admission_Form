// client/src/components/Auth/OtpVerification.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

const OtpContainer = styled.div`
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

const OtpVerification = () => {
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [userId, setUserId] = useState(null);
    const { verifyOTP } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.userId) {
            setUserId(location.state.userId);
        } else {
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        
        setLoading(true);
        try {
            const resetToken = await verifyOTP(userId, otp);
            navigate('/reset-password', { state: { resetToken } });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <OtpContainer>
            <StyledPaper elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedUserOutlinedIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography component="h1" variant="h4" color="primary">
                        Verify OTP
                    </Typography>
                </Box>
                
                <Typography variant="body1" gutterBottom>
                    Enter the 6-digit OTP sent to your email.
                </Typography>
                
                <Typography variant="body2" color="error" gutterBottom>
                    Time remaining: {formatTime(timeLeft)}
                </Typography>
                
                <StyledForm onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="OTP Code"
                        inputProps={{ maxLength: 6 }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <StyledButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading || timeLeft <= 0}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </StyledButton>
                </StyledForm>
                
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Button onClick={() => navigate('/forgot-password')} fullWidth>
                        Resend OTP
                    </Button>
                </Box>
            </StyledPaper>
        </OtpContainer>
    );
};

export default OtpVerification;
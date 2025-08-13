// client/src/components/Auth/ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const ForgotPasswordContainer = styled.div`
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

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: email input, 2: OTP input
    const [userId, setUserId] = useState(null);
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await forgotPassword(email);
            setUserId(response.userId);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ForgotPasswordContainer>
            <StyledPaper elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailOutlinedIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography component="h1" variant="h4" color="primary">
                        Reset Password
                    </Typography>
                </Box>
                
                {step === 1 ? (
                    <StyledForm onSubmit={handleSubmit}>
                        <Typography variant="body1" gutterBottom>
                            Enter your registered email address to receive a password reset OTP.
                        </Typography>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </StyledButton>
                    </StyledForm>
                ) : (
                    <div>
                        <Typography variant="body1" gutterBottom>
                            An OTP has been sent to your email. Please check your inbox.
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/verify-otp', { state: { userId } })}
                        >
                            Verify OTP
                        </Button>
                    </div>
                )}
                
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Button onClick={() => navigate('/login')} fullWidth>
                        Back to Login
                    </Button>
                </Box>
            </StyledPaper>
        </ForgotPasswordContainer>
    );
};

export default ForgotPassword;
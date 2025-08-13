// client/src/components/Auth/ResetPassword.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

const ResetPasswordContainer = styled.div`
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

const ResetPassword = () => {
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState(null);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (location.state?.resetToken) {
            setResetToken(location.state.resetToken);
        } else {
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return;
        
        setLoading(true);
        try {
            await resetPassword(resetToken, newPassword, confirmPassword);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ResetPasswordContainer>
            <StyledPaper elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VpnKeyOutlinedIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography component="h1" variant="h4" color="primary">
                        Set New Password
                    </Typography>
                </Box>
                
                <StyledForm onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={newPassword !== confirmPassword && confirmPassword !== ''}
                        helperText={newPassword !== confirmPassword && confirmPassword !== '' ? "Passwords don't match" : ''}
                    />
                    <StyledButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading || newPassword !== confirmPassword}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </StyledButton>
                </StyledForm>
            </StyledPaper>
        </ResetPasswordContainer>
    );
};

export default ResetPassword;
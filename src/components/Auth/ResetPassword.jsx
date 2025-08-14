import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const ResetPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`;

const StyledPaper = styled.div`
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.4s ease, box-shadow 0.4s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  &.shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translateX(-1px);
    }
    20%,
    80% {
      transform: translateX(2px);
    }
    30%,
    50%,
    70% {
      transform: translateX(-4px);
    }
    40%,
    60% {
      transform: translateX(4px);
    }
  }

  @media (max-width: 576px) {
    padding: 1.5rem;
    max-width: 90%;
  }
`;

const StyledForm = styled.form`
  width: 100%;
  margin-top: 1.5rem;
`;

const BrandLetter = styled.span`
  display: inline-block;
  opacity: 0;
  background: linear-gradient(45deg, #ffffff, #a1a7ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &.anim1 {
    animation: letterPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    animation-delay: ${(props) => props.delay * 0.08}s;
  }

  &.anim2 {
    animation: letterSlide 0.8s ease-in-out forwards;
    animation-delay: ${(props) => props.delay * 0.1}s;
  }

  &.anim3 {
    animation: letterSpin 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: ${(props) => props.delay * 0.09}s;
  }

  @keyframes letterPop {
    to {
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
  }

  @keyframes letterSlide {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes letterSpin {
    from {
      opacity: 0;
      transform: rotateY(90deg);
    }
    to {
      opacity: 1;
      transform: rotateY(0deg);
    }
  }
`;

const TaglineText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  margin: 12px 0 24px;
  font-style: italic;
  font-size: 1.1rem;
  opacity: 0;
  transform: scale(0.8);
  animation: taglineFade 0.8s ease 0.9s forwards;

  @keyframes taglineFade {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 576px) {
    font-size: 0.95rem;
  }
`;

const StyledInput = styled.input`
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 10px !important;
  transition: all 0.3s ease !important;
  padding-left: 2.5rem !important;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  &:focus {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: #ffffff !important;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.4) !important;
  }

  &.is-invalid {
    border-color: #dc3545 !important;
  }
`;

const InputIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
`;

const PasswordToggle = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #ffffff;
  transition: color 0.3s ease;

  &:hover {
    color: #a1a7ff;
  }
`;

const StyledButton = styled.button`
  background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  padding: 12px !important;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
  color: #ffffff !important;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(78, 84, 200, 0.5) !important;
  }

  &:disabled {
    background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%) !important;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: 0.6s;
  }

  &:hover::after {
    left: 100%;
  }
`;

const Loader = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorText = styled.p`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 4px;
  text-align: left;
`;

const ResetPassword = () => {
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: '',
  });
  const [shake, setShake] = useState(false);
  const [animationClass, setAnimationClass] = useState('anim1');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const brandName = 'Vizionexl';
  const tagline = 'Where vision meets excellence';

  useEffect(() => {
    if (location.state?.resetToken) {
      setResetToken(location.state.resetToken);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    const animations = ['anim1', 'anim2', 'anim3'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % animations.length;
      setAnimationClass(animations[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors = { newPassword: '', confirmPassword: '', general: '' };
    let isValid = true;

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setErrors({ newPassword: '', confirmPassword: '', general: '' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second loader
      await resetPassword(resetToken, newPassword, confirmPassword);
      navigate('/login');
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrors({
        ...errors,
        general: error.response?.data?.message || 'Failed to reset password',
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <ResetPasswordContainer>
      <StyledPaper className={shake ? 'shake' : ''}>
        <div className="text-center mb-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
          <h1 className="fs-2 fw-bold">
            {brandName.split('').map((letter, index) => (
              <BrandLetter key={index} delay={index} className={animationClass}>
                {letter}
              </BrandLetter>
            ))}
          </h1>
          <TaglineText>{tagline}</TaglineText>
        </div>

        <StyledForm onSubmit={handleSubmit}>
          <p className="text-white text-center mb-4">
            Enter your new password to reset.
          </p>
          <div className="mb-3 position-relative">
            <StyledInput
              type={showNewPassword ? 'text' : 'password'}
              className={`form-control ${
                errors.newPassword ? 'is-invalid' : ''
              }`}
              placeholder="New Password"
              autoComplete="new-password"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <InputIcon>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </InputIcon>
            <PasswordToggle onClick={handleToggleNewPassword}>
              {showNewPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06001M9.9 4.24002C10.5883 4.0789 11.2931 4.00134 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.18M14.56 14.56C14.2483 14.8418 13.8832 15.0615 13.4842 15.2041C13.0853 15.3466 12.6601 15.409 12.2347 15.3876C11.8093 15.3662 11.3927 15.2611 11.0038 15.0787C10.6148 14.8962 10.2603 14.6401 9.96 14.32L14.56 14.56Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </PasswordToggle>
            {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
          </div>

          <div className="mb-3 position-relative">
            <StyledInput
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-control ${
                errors.confirmPassword ? 'is-invalid' : ''
              }`}
              placeholder="Confirm New Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <InputIcon>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </InputIcon>
            <PasswordToggle onClick={handleToggleConfirmPassword}>
              {showConfirmPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06001M9.9 4.24002C10.5883 4.0789 11.2931 4.00134 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.18M14.56 14.56C14.2483 14.8418 13.8832 15.0615 13.4842 15.2041C13.0853 15.3466 12.6601 15.409 12.2347 15.3876C11.8093 15.3662 11.3927 15.2611 11.0038 15.0787C10.6148 14.8962 10.2603 14.6401 9.96 14.32L14.56 14.56Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </PasswordToggle>
            {errors.confirmPassword && (
              <ErrorText>{errors.confirmPassword}</ErrorText>
            )}
          </div>

          {errors.general && (
            <ErrorText className="text-center">{errors.general}</ErrorText>
          )}
          <StyledButton
            type="submit"
            className="btn w-100"
            disabled={loading || newPassword !== confirmPassword}
          >
            {loading && <Loader />}
            {loading ? 'Updating...' : 'Update Password'}
          </StyledButton>
        </StyledForm>
      </StyledPaper>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;

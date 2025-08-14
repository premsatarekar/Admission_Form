import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const OtpContainer = styled.div`
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

const TimerText = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
`;

const OtpVerification = () => {
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({ otp: '', general: '' });
  const [shake, setShake] = useState(false);
  const [animationClass, setAnimationClass] = useState('anim1');
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  const brandName = 'Vizionexl';
  const tagline = 'Where vision meets excellence';

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
    const newErrors = { otp: '', general: '' };
    let isValid = true;

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
      isValid = false;
    } else if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be a 6-digit number';
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
    setErrors({ otp: '', general: '' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second loader
      const resetToken = await verifyOTP(userId, otp);
      navigate('/reset-password', { state: { resetToken } });
    } catch (error) {
      console.error('OTP verification failed:', error);
      setErrors({
        ...errors,
        general: error.response?.data?.message || 'Invalid OTP',
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
            <path
              d="M12 12C15.31 12 18 9.31 18 6C18 2.69 15.31 0 12 0C8.69 0 6 2.69 6 6C6 9.31 8.69 12 12 12ZM12 14C7.58 14 0 16.69 0 21V24H24V21C24 16.69 16.42 14 12 14Z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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

        <p className="text-white text-center mb-4">
          Enter the 6-digit OTP sent to your email.
        </p>
        <TimerText>Time remaining: {formatTime(timeLeft)}</TimerText>

        <StyledForm onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <StyledInput
              type="text"
              className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
              placeholder="OTP Code"
              autoComplete="off"
              autoFocus
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
                <path
                  d="M12 12C15.31 12 18 9.31 18 6C18 2.69 15.31 0 12 0C8.69 0 6 2.69 6 6C6 9.31 8.69 12 12 12ZM12 14C7.58 14 0 16.69 0 21V24H24V21C24 16.69 16.42 14 12 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </InputIcon>
            {errors.otp && <ErrorText>{errors.otp}</ErrorText>}
          </div>
          {errors.general && (
            <ErrorText className="text-center">{errors.general}</ErrorText>
          )}
          <StyledButton
            type="submit"
            className="btn w-100"
            disabled={loading || timeLeft <= 0}
          >
            {loading && <Loader />}
            {loading ? 'Verifying...' : 'Verify OTP'}
          </StyledButton>
        </StyledForm>

        <div className="w-100 mt-3 text-center">
          <Link to="/forgot-password" className="text-decoration-none">
            <p className="text-white fw-medium">Resend OTP</p>
          </Link>
        </div>
      </StyledPaper>
    </OtpContainer>
  );
};

export default OtpVerification;

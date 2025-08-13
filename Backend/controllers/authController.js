// server/controllers/authController.js
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { sendOTPEmail } from '../utils/sendEmail.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password required' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Comparing password for user: ${user.username}`);
    console.log(`Stored hash: ${user.password.substring(0, 10)}...`);

    // Enhanced password comparison with timing-safe comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful');
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'No account with that email exists' });
    }

    // Generate OTP (6 digits, expires in 2 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Save OTP to database
    await User.createResetToken(user.id, otp, expiresAt);

    // Send OTP to user's email
    await sendOTPEmail(user.email, otp);

    res.json({
      message: 'OTP sent to your email',
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find valid token
    const token = await User.findValidToken(userId, otp);
    if (!token) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete the used token
    await User.deleteToken(token.id);

    // Create temporary token for password reset (valid for 10 minutes)
    const tempToken = jwt.sign(
      { userId, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      message: 'OTP verified successfully',
      resetToken: tempToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await User.updatePassword(userId, hashedPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

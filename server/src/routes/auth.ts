import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { sendOTP } from '../utils/email';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Test email configuration
router.post('/test-email', async (req, res) => {
  try {
    await sendOTP(process.env.EMAIL_USER!, '123456');
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Test email failed', details: errorMessage });
  }
});
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, otp, otpExpires });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({
      message: 'OTP sent to your email successfully',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to send OTP', details: errorMessage });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    console.log('JWT_SECRET used for signing:', process.env.JWT_SECRET);
    res.json({ user: { email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Google login/signup
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Invalid token' });

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        isVerified: true,
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user: { email: user.email, name: user.name }, token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

export default router;

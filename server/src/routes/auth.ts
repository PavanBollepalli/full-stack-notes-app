import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { sendOTP } from '../utils/email';

const router = express.Router();

// Initialize Google OAuth client with error checking
let client: OAuth2Client;
try {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
  }
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  console.log('Google OAuth client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google OAuth client:', error);
  client = new OAuth2Client('dummy-client-id'); // Fallback to prevent crashes
}

// Test Google Client ID
router.get('/test-google-client', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Not set',
    clientInitialized: !!client
  });
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
  console.log('Google auth request received');
  console.log('Token received:', token ? `${token.substring(0, 50)}...` : 'No token');
  console.log('Token length:', token ? token.length : 0);

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    console.log('GOOGLE_CLIENT_ID available:', !!process.env.GOOGLE_CLIENT_ID);

    // Try to verify the token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(400).json({
        error: 'Invalid Google token',
        details: 'Token verification failed. Please try signing in again.'
      });
    }

    console.log('Token verification successful');
    const payload = ticket.getPayload();

    if (!payload) {
      console.log('No payload in ticket');
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    console.log('Payload received:', {
      email: payload.email,
      sub: payload.sub ? `${payload.sub.substring(0, 10)}...` : 'No sub',
      name: payload.name,
      email_verified: payload.email_verified
    });

    // Check if user exists by email (for account linking)
    let user;
    try {
      user = await User.findOne({ googleId: payload.sub });
      console.log('User lookup by Google ID result:', user ? 'Found existing user' : 'User not found');

      // If no user found by Google ID, check if email exists for account linking
      if (!user) {
        const existingUser = await User.findOne({ email: payload.email });
        if (existingUser) {
          console.log('Found existing user by email, linking Google account');
          // Link Google account to existing user
          existingUser.googleId = payload.sub;
          existingUser.name = payload.name; // Update name if different
          existingUser.isVerified = true; // Google accounts are pre-verified
          await existingUser.save();
          user = existingUser;
          console.log('Successfully linked Google account to existing user');
        }
      }
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError);
      return res.status(500).json({ error: 'Database error during authentication' });
    }

    // Create new user if doesn't exist
    if (!user) {
      try {
        user = new User({
          email: payload.email,
          googleId: payload.sub,
          name: payload.name,
          isVerified: true,
        });
        await user.save();
        console.log('New user created successfully');
      } catch (createError) {
        console.error('Error creating new user:', createError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    }

    // Generate JWT token
    let jwtToken;
    try {
      jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      console.log('JWT token created successfully');
    } catch (jwtError) {
      console.error('JWT creation error:', jwtError);
      return res.status(500).json({ error: 'Failed to generate authentication token' });
    }

    res.json({
      user: {
        email: user.email,
        name: user.name
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Unexpected Google authentication error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Google authentication failed',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

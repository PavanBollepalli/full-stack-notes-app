import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/AuthContext';

const AuthPage: React.FC = () => {
  const { login, sendOTP, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      console.log('Google login success:', credentialResponse);
      console.log('Credential available:', !!credentialResponse.credential);
      console.log('Credential length:', credentialResponse.credential ? credentialResponse.credential.length : 0);

      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('Using credential:', credentialResponse.credential.substring(0, 50) + '...');
      await googleLogin(credentialResponse.credential);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error');
    setError('Google sign-in failed. Please check your Google account settings.');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, otp);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Extract form component for reuse
  const AuthForm = () => (
    <>
      {/* Logo and Header - Only show on mobile */}
      <div className="text-center mb-8 lg:hidden">
        <img
          src="/icon.png"
          alt="Notes App Logo"
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Notes</h1>
        <p className="text-gray-600">Enter your email to sign in to your account</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Email OTP Form */}
      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800 transition-colors"
          >
            Back to Email
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      {/* Google Sign In Button */}
      <div className="mt-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Desktop Layout: Side by Side */}
        <div className="hidden lg:flex min-h-screen items-center">
          {/* Left Side - Form */}
          <div className="w-1/2 pr-8">
            <div className="text-center">
              <img
                src="/icon.png"
                alt="Notes App Logo"
                className="w-24 h-24 mx-auto mb-6"
              />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign In to Notes</h1>
              <p className="text-xl text-gray-600 mb-8">Your personal note-taking solution - Sign in to get started</p>
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <AuthForm />
              </div>
            </div>
          </div>

          {/* Right Side - Container Image */}
          <div className="w-1/2 pl-8">
            <div className="h-full flex items-center justify-center">
              <img
                src="/container.png"
                alt="Notes Container"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="lg:hidden flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

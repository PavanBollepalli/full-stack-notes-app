import React, { useState } from 'react';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  // Placeholder for Google login
  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth flow
    // For now, simulate with a mock token
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'mock-google-token' }),
      });
      const data = await response.json();
      if (response.ok) {
        onAuthSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        onAuthSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-4" />
        <h2 className="text-4xl font-bold bg-dark mb-6">{isSignup ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={step === 'email' ? handleEmailSubmit : handleOtpSubmit} className="w-full flex flex-col gap-4">
          {step === 'email' && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition" disabled={loading}>
                {isSignup ? 'Send OTP' : 'Send OTP'}
              </button>
            </>
          )}
          {step === 'otp' && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition" disabled={loading}>
                Verify OTP
              </button>
            </>
          )}
        </form>
        <button className="flex items-center gap-2 mt-4 w-full justify-center border border-gray-300 rounded py-2 hover:bg-gray-100 transition" onClick={handleGoogleLogin}>
          <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          <span className="font-medium text-gray-700">{isSignup ? 'Sign up with Google' : 'Login with Google'}</span>
        </button>
        {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
        <div className="mt-6 text-sm text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsSignup(!isSignup); setStep('email'); setError(''); }} className="ml-2 text-blue-600 hover:underline">
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

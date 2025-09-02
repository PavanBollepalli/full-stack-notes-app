import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import NotesPage from './pages/NotesPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Simple test component
const TestPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Notes App</h1>
      <p className="text-gray-600 mb-6">Basic React is working!</p>
      <div className="space-y-4">
        <button
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = '/signin'}
        >
          Go to Sign In Page
        </button>
        <button
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => window.location.href = '/signup'}
        >
          Go to Sign Up Page
        </button>
        <button
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => window.location.href = '/notes'}
        >
          Go to Notes Page
        </button>
      </div>
    </div>
  </div>
);

// App content component that uses auth context
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/signin"
            element={user ? <Navigate to="/notes" replace /> : <AuthPage />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/notes" replace /> : <SignupPage />}
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to="/signin" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
};

// Main App component with AuthProvider
function App() {
  return (
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pizza, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import AuthVisualPanel from '../components/AuthVisualPanel';

export default function Login() {
  const { user, login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const navigate = useNavigate();

  // Restore remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('slicecraft_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Synchronous guard for authenticated users
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('slicecraft_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('slicecraft_remember_email');
      }

      const loggedUser = await login(trimmedEmail, password);
      if (loggedUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const errMsg = err?.message || '';
      if (
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('econnrefused')
      ) {
        setError('Unable to connect to the authentication server. Please try again.');
      } else {
        setError(errMsg || 'Invalid email or password.');
      }
    }
  };

  const handleGoogleAuth = () => {
    setGoogleNotice('Google Single Sign-On is connecting... Please log in using your SliceCraft email & password.');
    setTimeout(() => setGoogleNotice(''), 4000);
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card animate-fade-in">
        {/* Left Form Side */}
        <div className="auth-form-side">
          {/* Brand & Header */}
          <div className="auth-form-header">
            <Link to="/" className="auth-brand-logo">
              <div className="auth-brand-icon">
                <Pizza style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </div>
              <span className="auth-brand-text">
                Slice<span className="gradient-text">Craft</span>
              </span>
            </Link>
            <h1 className="auth-form-title">Welcome Back 👋</h1>
            <p className="auth-form-subtitle">
              Sign in to continue your SliceCraft artisan pizza journey.
            </p>
          </div>

          {/* Google Auth Button */}
          <button type="button" className="auth-google-btn" onClick={handleGoogleAuth}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {googleNotice && (
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#FF8A00', background: 'rgba(255, 138, 0, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 138, 0, 0.25)' }}>
              {googleNotice}
            </div>
          )}

          <div className="auth-divider">
            <span>OR SIGN IN WITH EMAIL</span>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="auth-error-alert" role="alert" style={{ marginBottom: '18px' }}>
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="auth-input-box">
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Mail className="auth-field-icon" />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-box">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Lock className="auth-field-icon" />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In to Account</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{ marginTop: '24px', fontSize: '0.88rem', color: '#94A3B8', textAlign: 'center' }}>
            <span>Don't have an account yet? </span>
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Right Visual Side */}
        <AuthVisualPanel />
      </div>
    </div>
  );
}

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pizza, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { user, login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div className="auth-page">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-grid-overlay" />

      {/* Login Card */}
      <div className="auth-card animate-fade-in">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="auth-back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            fontWeight: 600,
            transition: 'var(--transition)'
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Return to Home
        </Link>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Pizza style={{ width: '26px', height: '26px', color: '#FFFFFF' }} />
          </div>
          <h1 className="auth-title">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="auth-subtitle">
            Sign in to track live orders and customize artisan pizzas
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Address */}
          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="customer-email">
                Email Address
              </label>
            </div>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" />
              <input
                id="customer-email"
                type="email"
                required
                autoComplete="email"
                className="auth-input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="customer-password">
                Password
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" />
              <input
                id="customer-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="auth-input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '18px', height: '18px' }} />
                ) : (
                  <Eye style={{ width: '18px', height: '18px' }} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                style={{
                  accentColor: '#F7254F',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              Remember my email
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="auth-footer-note">
          <span>Don't have an account yet?</span>
          <Link to="/register" className="auth-footer-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

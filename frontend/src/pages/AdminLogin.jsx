import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Pizza,
  ArrowLeft,
  Shield
} from 'lucide-react';

export default function AdminLogin() {
  const { user, adminLogin, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If admin user is already logged in, redirect immediately without letting back button reopen login
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    try {
      await adminLogin(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      const errMsg = err?.message || '';
      if (
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('econnrefused')
      ) {
        setError('Unable to connect to the server. Please try again.');
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  return (
    <div className="admin-login-page">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="admin-login-glow admin-login-glow-1" />
      <div className="admin-login-glow admin-login-glow-2" />
      <div className="admin-login-grid-overlay" />

      {/* Main Admin Card */}
      <div className="admin-login-card animate-fade-in">
        {/* Top SliceCraft Brand & Badge */}
        <div className="admin-login-header">
          <div className="admin-login-brand">
            <div className="admin-login-logo-icon">
              <Pizza style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
            </div>
            <span className="admin-login-brand-text">
              Slice<span className="gradient-text">Craft</span>
            </span>
          </div>

          <div className="admin-badge-row">
            <span className="admin-login-badge">
              <span className="live-dot" /> ADMIN PORTAL
            </span>
            <span className="admin-security-pill">
              <Shield style={{ width: '12px', height: '12px' }} /> SECURE
            </span>
          </div>

          <div className="admin-login-icon-box">
            <ShieldCheck style={{ width: '30px', height: '30px', color: '#FFFFFF' }} />
          </div>

          <h1 className="admin-login-title">
            Welcome, <span className="gradient-text">Administrator</span>
          </h1>
          <p className="admin-login-subtitle">
            Secure access to your SliceCraft Operations Command Center.
          </p>
        </div>

        {/* Inline Safe Error Alert */}
        {error && (
          <div className="admin-error-alert" role="alert">
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="admin-input-group">
            <label className="admin-input-label" htmlFor="admin-email">
              Admin Email
            </label>
            <div className="admin-input-wrapper">
              <Mail className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                className="admin-input-field"
                placeholder="admin@slicecraft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="admin-input-group">
            <label className="admin-input-label" htmlFor="admin-password">
              Admin Password
            </label>
            <div className="admin-input-wrapper">
              <Lock className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="admin-input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="admin-password-toggle"
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

          {/* Form Options: Remember Me & Forgot Password */}
          <div className="admin-form-options">
            <label className="admin-remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="admin-forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="admin-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Admin Dashboard</span>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </form>

        {/* Security Seal Footer */}
        <div className="admin-security-footer">
          <ShieldCheck style={{ width: '15px', height: '15px', color: '#10B981', flexShrink: 0 }} />
          <span>End-to-End Encrypted Session &bull; 256-bit AES Auth</span>
        </div>

        {/* Return to Customer Portal */}
        <div className="admin-back-to-store">
          <Link to="/" className="admin-back-link">
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            <span>Return to SliceCraft Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

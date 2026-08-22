import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Pizza, ArrowLeft, Shield } from 'lucide-react';
import AuthVisualPanel from '../components/AuthVisualPanel';

export default function AdminLogin() {
  const { user, adminLogin, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Restore remembered admin email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('slicecraft_remember_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Synchronous guards for authenticated users
  if (user) {
    const isUserAdmin = user.role === 'admin' || user.role === 'super_admin' || user.email === 'admin@pizzadelivery.com';
    if (isUserAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your administrator email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. admin@slicecraft.com).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('slicecraft_remember_admin_email', trimmedEmail);
      } else {
        localStorage.removeItem('slicecraft_remember_admin_email');
      }

      await adminLogin(trimmedEmail, password);
      navigate('/admin', { replace: true });
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
    <div className="auth-split-wrapper">
      <div className="auth-split-card animate-fade-in">
        {/* Left Form Side */}
        <div className="auth-form-side">
          {/* Brand Logo Header & Admin Badges */}
          <div className="auth-form-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Link to="/" className="auth-brand-logo">
                <div className="auth-brand-icon" style={{ background: 'linear-gradient(135deg, #FF8A00 0%, #F7254F 100%)' }}>
                  <Pizza style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                </div>
                <span className="auth-brand-text">
                  Slice<span className="gradient-text">Craft</span>
                </span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#FF8A00', color: '#000', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ADMIN PORTAL
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 7px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Shield style={{ width: '10px', height: '10px' }} /> ENCRYPTED
                </span>
              </div>
            </div>
            <h1 className="auth-form-title">
              Administrator <span style={{ color: '#FF8A00' }}>Portal</span>
            </h1>
            <p className="auth-form-subtitle">
              Secure authentication for SliceCraft Operations & Management.
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="auth-error-alert" role="alert" style={{ marginBottom: '14px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials Helper */}
          <div
            style={{
              marginBottom: '14px',
              padding: '8px 12px',
              background: 'rgba(255, 138, 0, 0.08)',
              border: '1px solid rgba(255, 138, 0, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem',
              color: '#CBD5E1',
            }}
          >
            <span><strong>Default Admin:</strong> admin@pizzadelivery.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@pizzadelivery.com');
                setPassword('admin123');
              }}
              style={{
                background: '#FF8A00',
                color: '#000',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              Auto-fill Credentials
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="admin-email">
                Admin Email Address
              </label>
              <div className="auth-input-box">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="auth-input"
                  placeholder="admin@slicecraft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Mail className="auth-field-icon" />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="admin-password">
                Admin Password
              </label>
              <div className="auth-input-box">
                <input
                  id="admin-password"
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

            {/* Options Row */}
            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
              style={{ background: 'linear-gradient(135deg, #FF8A00 0%, #F7254F 100%)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Log In to Admin Portal</span>
                  <ShieldCheck style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          {/* Customer Portal Link */}
          <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'center' }}>
            <span>Not an admin? </span>
            <Link to="/login" className="auth-link">
              Go to Customer Sign In
            </Link>
          </div>
        </div>

        {/* Right Visual Side */}
        <AuthVisualPanel />
      </div>
    </div>
  );
}

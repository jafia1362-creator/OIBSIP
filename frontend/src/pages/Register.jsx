import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, AlertCircle, ArrowRight, Pizza, Eye, EyeOff, Loader2, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { user, register, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Synchronous guard for authenticated users
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  // Calculate Password Strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', score: 0, color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { label: 'Weak', score: 25, color: '#EF4444' };
    if (score === 2 || score === 3) return { label: 'Medium', score: 65, color: '#FF8A00' };
    return { label: 'Strong', score: 100, color: '#10B981' };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. alex@example.com).');
      return;
    }

    if (trimmedPhone && !/^[0-9+\-\s()]{7,15}$/.test(trimmedPhone)) {
      setError('Please enter a valid phone number or leave it blank.');
      return;
    }

    if (!password) {
      setError('Please choose a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check your password.');
      return;
    }

    try {
      const res = await register(trimmedName, trimmedEmail, password, trimmedPhone);
      setSuccessMsg(res.message || 'Registration successful! Your account is active and verified.');
    } catch (err) {
      const errMsg = err?.message || '';
      if (
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('econnrefused')
      ) {
        setError('Unable to connect to the registration server. Please try again.');
      } else {
        setError(errMsg || 'Registration failed. Email may already be registered.');
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-grid-overlay" />

      {/* Card */}
      <div className="auth-card animate-fade-in" style={{ maxWidth: '480px' }}>
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
            Create an <span className="gradient-text">Account</span>
          </h1>
          <p className="auth-subtitle">
            Join SliceCraft to build custom artisan pizzas with live tracking
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert / Form */}
        {successMsg ? (
          <div className="auth-success-alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '24px 16px' }}>
            <CheckCircle style={{ width: '52px', height: '52px', color: '#10B981' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Account Created Successfully!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {successMsg}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck style={{ width: '14px', height: '14px' }} /> Account verified and ready for sign-in
            </div>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: 'none', width: '100%', marginTop: '12px' }}
            >
              <span>Sign In to Your Account</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-name">
                Full Name <span style={{ color: '#F7254F' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  required
                  autoComplete="name"
                  className="auth-input-field"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-email">
                Email Address <span style={{ color: '#F7254F' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  id="register-email"
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

            {/* Phone Number (Optional) */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-phone">
                Phone Number <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <div className="auth-input-wrapper">
                <Phone className="auth-input-icon" />
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  className="auth-input-field"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="register-password">
                  Password <span style={{ color: '#F7254F' }}>*</span>
                </label>
                {password && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pwdStrength.color }}>
                    {pwdStrength.label} Password
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="auth-input-field"
                  placeholder="At least 6 characters"
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

              {/* Password Strength Indicator Bar */}
              {password && (
                <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pwdStrength.score}%`,
                      height: '100%',
                      backgroundColor: pwdStrength.color,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-confirm-password">
                Confirm Password <span style={{ color: '#F7254F' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="auth-input-field"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px' }} />
                  )}
                </button>
              </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="auth-footer-note">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-footer-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

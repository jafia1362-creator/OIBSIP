import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, AlertCircle, ArrowRight, Pizza, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register() {
  const { register, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await register(name.trim(), email.trim(), password);
      setSuccessMsg(res.message || 'Registration successful! Verification email sent.');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-grid-overlay" />

      {/* Card */}
      <div className="auth-card animate-fade-in">
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
          <div className="auth-success-alert">
            <CheckCircle style={{ width: '48px', height: '48px', color: '#10B981' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Verification Link Sent
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {successMsg}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
              Please check your inbox or server console to verify your email before signing in.
            </p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: 'none', width: '100%', marginTop: '12px' }}
            >
              <span>Go to Login Page</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-name">
                Full Name
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
                Email Address
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

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-password">
                Password
              </label>
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

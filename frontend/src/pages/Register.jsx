import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, AlertCircle, ArrowRight, Pizza, Eye, EyeOff, Loader2, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthVisualPanel from '../components/AuthVisualPanel';

export default function Register() {
  const { user, register, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
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
      setError('Passwords do not match. Please check your password.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to SliceCraft Terms & Conditions to proceed.');
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

  const handleGoogleAuth = () => {
    setGoogleNotice('Google Single Sign-On is connecting... Please register using your SliceCraft account details.');
    setTimeout(() => setGoogleNotice(''), 4000);
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card animate-fade-in">
        {/* Left Form Side */}
        <div className="auth-form-side">
          {/* Return to Home */}
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#94A3B8',
              marginBottom: '16px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Return to Home
          </Link>

          {/* Brand Logo Header */}
          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-icon">
              <Pizza style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
            </div>
            <span className="auth-brand-text">
              Slice<span className="gradient-text">Craft</span>
            </span>
          </Link>

          {/* Form Header */}
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create Account 🍕</h1>
            <p className="auth-form-subtitle">
              Join SliceCraft to build custom pizzas with 30-min express delivery.
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
            <span>OR REGISTER WITH EMAIL</span>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="auth-error-alert" role="alert" style={{ marginBottom: '16px' }}>
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert / Form */}
          {successMsg ? (
            <div className="auth-success-alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '20px 16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#10B981' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Account Created Successfully!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
                {successMsg}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981' }}>
                <ShieldCheck style={{ width: '14px', height: '14px' }} /> Account verified and ready for sign-in
              </div>
              <Link
                to="/login"
                className="auth-btn-primary"
                style={{ textDecoration: 'none', width: '100%', marginTop: '8px' }}
              >
                <span>Sign In to Account</span>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="register-name">
                  Full Name <span style={{ color: '#F7254F' }}>*</span>
                </label>
                <div className="auth-input-box">
                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    className="auth-input"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <User className="auth-field-icon" />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="register-email">
                  Email Address <span style={{ color: '#F7254F' }}>*</span>
                </label>
                <div className="auth-input-box">
                  <input
                    id="register-email"
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

              {/* Phone Number (Optional) */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="register-phone">
                  <span>Phone Number</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>(Optional)</span>
                </label>
                <div className="auth-input-box">
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    className="auth-input"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                  <Phone className="auth-field-icon" />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <div className="auth-field-label">
                  <label htmlFor="register-password">
                    Password <span style={{ color: '#F7254F' }}>*</span>
                  </label>
                  {password && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pwdStrength.color }}>
                      {pwdStrength.label} Password
                    </span>
                  )}
                </div>
                <div className="auth-input-box">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="auth-input"
                    placeholder="At least 6 characters"
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
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="register-confirm-password">
                  Confirm Password <span style={{ color: '#F7254F' }}>*</span>
                </label>
                <div className="auth-input-box">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="auth-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Lock className="auth-field-icon" />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div style={{ marginBottom: '18px' }}>
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={loading}
                  />
                  <span>
                    I agree to SliceCraft <a href="#terms" className="auth-link">Terms of Service</a> & <a href="#privacy" className="auth-link">Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="auth-btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight style={{ width: '18px', height: '18px' }} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Login */}
          <div style={{ marginTop: '20px', fontSize: '0.88rem', color: '#94A3B8', textAlign: 'center' }}>
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">
              Log In
            </Link>
          </div>
        </div>

        {/* Right Visual Side */}
        <AuthVisualPanel />
      </div>
    </div>
  );
}

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, Pizza, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { API_BASE_URL } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: email.trim() });
      setMessage(res.data.message || 'Password reset link sent to your email.');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      setLoading(false);
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
            Reset <span className="gradient-text">Password</span>
          </h1>
          <p className="auth-subtitle">
            Enter your email to receive a secure password recovery link
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Message / Form */}
        {message ? (
          <div className="auth-success-alert">
            <CheckCircle style={{ width: '48px', height: '48px', color: '#10B981' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Reset Link Dispatched
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {message}
            </p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: 'none', width: '100%', marginTop: '12px' }}
            >
              <span>Return to Sign In</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="forgot-email">
                Registered Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                  <span>Sending Recovery Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="auth-footer-note">
          <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

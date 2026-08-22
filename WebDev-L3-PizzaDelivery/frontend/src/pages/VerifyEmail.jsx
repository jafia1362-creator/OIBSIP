import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Pizza } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { API_BASE_URL } = useContext(AuthContext);

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/auth/verify-email?token=${token}`)
        .then((res) => {
          setStatus('success');
          setMessage(res.data.message || 'Email verified successfully! You can now log in.');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
        });
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, API_BASE_URL]);

  return (
    <div className="auth-page">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-grid-overlay" />

      {/* Card */}
      <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
        <div className="auth-header" style={{ marginBottom: '16px' }}>
          <div className="auth-icon-badge">
            <Pizza style={{ width: '26px', height: '26px', color: '#FFFFFF' }} />
          </div>
        </div>

        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
            <Loader2 className="animate-spin" style={{ width: '42px', height: '42px', color: '#F7254F' }} />
            <h2 className="auth-title" style={{ fontSize: '1.4rem' }}>
              Verifying Email Address...
            </h2>
            <p className="auth-subtitle">Please wait while we confirm your account details.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 style={{ width: '56px', height: '56px', color: '#10B981' }} />
            <h2 className="auth-title" style={{ fontSize: '1.6rem' }}>
              Email <span className="gradient-text">Verified!</span>
            </h2>
            <p className="auth-subtitle">{message}</p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: 'none', width: '100%', marginTop: '12px' }}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <XCircle style={{ width: '56px', height: '56px', color: '#F7254F' }} />
            <h2 className="auth-title" style={{ fontSize: '1.6rem', color: '#F87171' }}>
              Verification Failed
            </h2>
            <p className="auth-subtitle" style={{ color: '#FDA4AF' }}>{message}</p>
            <Link
              to="/register"
              className="auth-submit-btn"
              style={{ textDecoration: 'none', width: '100%', marginTop: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <span>Back to Registration</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

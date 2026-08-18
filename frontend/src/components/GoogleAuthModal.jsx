import React, { useState } from 'react';
import { X, Check, ArrowRight, Loader2, Mail } from 'lucide-react';

export default function GoogleAuthModal({ isOpen, onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [authenticatingEmail, setAuthenticatingEmail] = useState(null);

  if (!isOpen) return null;

  const defaultAccounts = [
    { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Sarah Miller', email: 'sarah.miller@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  ];

  const handleSelect = async (acc) => {
    setAuthenticatingEmail(acc.email);
    setTimeout(async () => {
      await onSelectAccount(acc);
      setAuthenticatingEmail(null);
    }, 600);
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    const nameFromEmail = customEmail.split('@')[0].replace('.', ' ');
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    await handleSelect({ name: formattedName, email: customEmail.trim() });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#121521',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(247, 37, 79, 0.15)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                Sign in with Google
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Choose an account to continue to SliceCraft
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px' }}>
          {authenticatingEmail ? (
            <div style={{ padding: '30px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 className="animate-spin" style={{ width: '36px', height: '36px', color: '#F7254F' }} />
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 700, margin: 0 }}>
                Authenticating with Google...
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                {authenticatingEmail}
              </p>
            </div>
          ) : !isCustomMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.borderColor = 'rgba(247, 37, 79, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                      {acc.email}
                    </div>
                  </div>
                  <ArrowRight style={{ width: '16px', height: '16px', color: '#64748B' }} />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'transparent',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  color: '#FF8A00',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginTop: '4px',
                  justifyContent: 'center',
                }}
              >
                <Mail style={{ width: '16px', height: '16px' }} />
                <span>Use another Google email</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="custom-google-email">
                  Enter your Google Account Email:
                </label>
                <div className="auth-input-box">
                  <input
                    id="custom-google-email"
                    type="email"
                    required
                    autoFocus
                    className="auth-input"
                    placeholder="your.name@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                  />
                  <Mail className="auth-field-icon" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'transparent',
                    color: '#CBD5E1',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  style={{ flex: 1, height: '40px', fontSize: '0.84rem' }}
                >
                  <span>Continue</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

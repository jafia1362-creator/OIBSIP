import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pizza, ShoppingBag, ShieldCheck, LogOut, User, Sparkles, Menu as MenuIcon, X } from 'lucide-react';

export default function Navbar({ openBuilder }) {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className="nav-header"
      style={{
        backgroundColor: isScrolled ? 'rgba(15, 17, 26, 0.96)' : 'rgba(15, 17, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="site-container">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand">
            <div
              style={{
                background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
                boxShadow: '0 4px 15px rgba(247, 37, 79, 0.4)',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pizza style={{ width: '24px', height: '24px', color: '#FFF' }} />
            </div>
            <span style={{ letterSpacing: '-0.02em', color: '#FFF' }}>
              Slice<span className="gradient-text" style={{ fontWeight: 900 }}>Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-menu-desktop">
            <Link to="/" className="nav-link-item">Home</Link>
            <button onClick={() => handleNavClick('menu')} className="nav-link-item">Menu</button>
            <button
              onClick={openBuilder}
              className="nav-link-item"
              style={{ color: '#F7254F', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} /> Custom Pizza
            </button>
            <button onClick={() => handleNavClick('how-it-works')} className="nav-link-item">How It Works</button>
            <button onClick={() => handleNavClick('about')} className="nav-link-item">About</button>
            <button onClick={() => handleNavClick('contact')} className="nav-link-item">Contact</button>
          </nav>

          {/* Desktop Right Actions */}
          <div className="nav-actions-desktop">
            <button
              onClick={openBuilder}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} /> Build Pizza
            </button>

            {user ? (
              <div className="nav-auth-group">
                <Link
                  to="/my-orders"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShoppingBag style={{ width: '15px', height: '15px', color: '#F7254F' }} />
                  <span>My Orders</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="btn-orange"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShieldCheck style={{ width: '15px', height: '15px' }} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: user.role === 'admin' ? 'rgba(255, 138, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                    border: user.role === 'admin' ? '1px solid rgba(255, 138, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <User style={{ width: '14px', height: '14px', color: user.role === 'admin' ? '#FF8A00' : '#94A3B8' }} />
                  <span>{user.name?.split(' ')[0]}</span>
                  {user.role === 'admin' && (
                    <span style={{ fontSize: '0.65rem', background: '#FF8A00', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                      ADMIN
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Sign Out"
                >
                  <LogOut style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            ) : (
              <div className="nav-auth-group">
                <Link
                  to="/login"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  Register
                </Link>
                <Link
                  to="/admin/login"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    color: '#FF8A00',
                    background: 'rgba(255, 138, 0, 0.12)',
                    border: '1px solid rgba(255, 138, 0, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck style={{ width: '12px', height: '12px' }} /> Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="nav-mobile-toggle">
            <button
              onClick={openBuilder}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Build Pizza
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFF',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              {isMobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <MenuIcon style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            background: 'rgba(10, 12, 19, 0.98)',
            borderTop: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="animate-fade-in"
        >
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-item">Home</Link>
          <button onClick={() => handleNavClick('menu')} className="nav-link-item" style={{ textAlign: 'left' }}>Menu</button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openBuilder();
            }}
            className="nav-link-item"
            style={{ color: '#F7254F', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} /> Custom Pizza Builder
          </button>
          <button onClick={() => handleNavClick('how-it-works')} className="nav-link-item" style={{ textAlign: 'left' }}>How It Works</button>
          <button onClick={() => handleNavClick('about')} className="nav-link-item" style={{ textAlign: 'left' }}>About SliceCraft</button>
          <button onClick={() => handleNavClick('contact')} className="nav-link-item" style={{ textAlign: 'left' }}>Contact Us</button>

          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Logged in as: {user.name}</span>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/login'); }} style={{ background: 'none', border: 'none', color: '#F7254F', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
                </div>
                <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShoppingBag style={{ width: '16px', height: '16px', color: '#F7254F' }} /> View My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="btn-orange" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck style={{ width: '16px', height: '16px' }} /> Open Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary" style={{ width: '100%' }}>Sign In</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary" style={{ width: '100%' }}>Register</Link>
                <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-orange" style={{ gridColumn: 'span 2', width: '100%', fontSize: '0.8rem' }}>Admin Portal Login</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

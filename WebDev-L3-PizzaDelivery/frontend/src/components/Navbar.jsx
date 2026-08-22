import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pizza, ShoppingBag, ShieldCheck, LogOut, User, Sparkles, Menu as MenuIcon, X } from 'lucide-react';

export default function Navbar({ openBuilder, isBuilderOpen }) {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.email === 'admin@pizzadelivery.com');
  const isSuperAdmin = user && (user.role === 'super_admin' || user.email === 'admin@pizzadelivery.com');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (location.pathname === '/' && !isBuilderOpen) {
        const sections = ['contact', 'about', 'how-it-works', 'menu'];
        let current = 'home';
        const scrollPosition = window.scrollY + 250;

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el && el.offsetTop <= scrollPosition) {
            current = sectionId;
            break;
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, isBuilderOpen]);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    setActiveSection(sectionId);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `/#${sectionId}`);
      }
    }
  };

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    setActiveSection('home');
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <header
      className={`nav-header ${isScrolled ? 'scrolled' : ''}`}
      style={{
        backgroundColor: isScrolled ? 'rgba(15, 17, 26, 0.96)' : 'rgba(15, 17, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="site-container">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" onClick={handleHomeClick} className="nav-brand">
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
            <Link
              to="/"
              onClick={handleHomeClick}
              className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'home' ? 'active' : ''}`}
            >
              Home
            </Link>
            <button
              onClick={() => handleNavClick('menu')}
              className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'menu' ? 'active' : ''}`}
            >
              Menu
            </button>
            <button
              onClick={openBuilder}
              className={`nav-link-item ${isBuilderOpen ? 'active' : ''}`}
              style={{ color: isBuilderOpen ? '#FFF' : '#F7254F', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} /> Custom Pizza
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'how-it-works' ? 'active' : ''}`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'about' ? 'active' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'contact' ? 'active' : ''}`}
            >
              Contact
            </button>
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
                {/* CUSTOMER ONLY NAVIGATION */}
                {!isAdmin ? (
                  <Link
                    to="/my-orders"
                    className="btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShoppingBag style={{ width: '15px', height: '15px', color: '#F7254F' }} />
                    <span>My Orders</span>
                  </Link>
                ) : null}

                {/* ADMIN & SUPER ADMIN NAVIGATION */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn-orange"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShieldCheck style={{ width: '15px', height: '15px' }} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    background: isAdmin ? 'rgba(255, 138, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                    border: isAdmin ? '1px solid rgba(255, 138, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#FFF',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(247, 37, 79, 0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isAdmin ? 'rgba(255, 138, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)')}
                  title="Open Account Profile"
                >
                  <User style={{ width: '14px', height: '14px', color: isAdmin ? '#FF8A00' : '#94A3B8' }} />
                  <span>{isAdmin ? 'Profile' : user.name?.split(' ')[0]}</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
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
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F7254F';
                    e.currentTarget.style.background = 'rgba(247, 37, 79, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.background = 'transparent';
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
          className="mobile-nav-drawer"
        >
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <button
            onClick={() => handleNavClick('menu')}
            className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'menu' ? 'active' : ''}`}
            style={{ textAlign: 'left' }}
          >
            Menu
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openBuilder();
            }}
            className={`nav-link-item ${isBuilderOpen ? 'active' : ''}`}
            style={{ color: isBuilderOpen ? '#FFF' : '#F7254F', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} /> Custom Pizza Builder
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'how-it-works' ? 'active' : ''}`}
            style={{ textAlign: 'left' }}
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'about' ? 'active' : ''}`}
            style={{ textAlign: 'left' }}
          >
            About SliceCraft
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`nav-link-item ${location.pathname === '/' && !isBuilderOpen && activeSection === 'contact' ? 'active' : ''}`}
            style={{ textAlign: 'left' }}
          >
            Contact Us
          </button>

          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Logged in as: <strong style={{ color: '#FFF' }}>{user.name}</strong>
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate('/login', { replace: true });
                    }}
                    style={{ background: 'none', border: 'none', color: '#F7254F', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Logout
                  </button>
                </div>

                {!isAdmin ? (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-secondary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ShoppingBag style={{ width: '16px', height: '16px', color: '#F7254F' }} /> View My Orders
                  </Link>
                ) : null}

                {isAdmin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255, 138, 0, 0.15)', borderRadius: '10px', border: '1px solid rgba(255, 138, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: '#FF8A00', fontWeight: 800 }}>
                        {isSuperAdmin ? '👑 SUPER ADMIN CONTROLS' : '🛡️ ADMIN CONTROLS'}
                      </span>
                      <span style={{ fontSize: '0.62rem', background: '#FF8A00', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>ACTIVE</span>
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-orange"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
                    >
                      <ShieldCheck style={{ width: '16px', height: '16px' }} />
                      <span>{isSuperAdmin ? 'Open Super Admin Panel' : 'Open Admin Operations Panel'}</span>
                    </Link>
                  </div>
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

      {/* Account Profile Control Modal */}
      {isProfileModalOpen && user && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#151826',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? 'linear-gradient(135deg, #FF8A00, #F7254F)' : 'linear-gradient(135deg, #F7254F, #FF8A00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#FFF',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
                    {user.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: '#94A3B8',
                  borderRadius: '50%',
                  padding: '8px',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    Account Role
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: isAdmin ? '#FF8A00' : '#FFF' }}>
                    {isSuperAdmin ? 'Super Administrator' : isAdmin ? 'Administrator' : 'Customer Account'}
                  </strong>
                </div>
                <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-success'}`}>
                  {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Privileges' : 'Verified Member'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!isAdmin && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ShoppingBag style={{ width: '16px', height: '16px', color: '#F7254F' }} /> View Order History & Tracking
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="btn-orange"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ShieldCheck style={{ width: '16px', height: '16px' }} /> Open Admin Control Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} /> Sign Out of Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

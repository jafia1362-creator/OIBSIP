import React, { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserOrders from './pages/UserOrders';
import { Pizza, Heart, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, Shield } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const ProtectedUserRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is an Admin or Auth route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/admin/login'].includes(location.pathname);
  const isDedicatedLayout = isAdminRoute || isAuthRoute;

  const handleOpenBuilder = () => {
    setIsBuilderOpen(true);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F111A', color: '#FFF' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Render Customer Navbar on all customer-facing storefront routes */}
        {!isAdminRoute && <Navbar openBuilder={handleOpenBuilder} isBuilderOpen={isBuilderOpen} />}

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: !isDedicatedLayout ? '74px' : '0px' }}>
          <Routes>
            <Route
              path="/"
              element={<Home isBuilderOpen={isBuilderOpen} setIsBuilderOpen={setIsBuilderOpen} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            <Route
              path="/my-orders"
              element={
                <ProtectedUserRoute>
                  <UserOrders />
                </ProtectedUserRoute>
              }
            />
          </Routes>
        </main>
      </div>

      {/* Render Customer Footer ONLY on normal storefront routes */}
      {!isDedicatedLayout && (
        <footer className="scroll-reveal" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: '#0A0C13', marginTop: '80px', paddingTop: '60px', paddingBottom: '40px' }}>
          <div className="site-container">
            <div className="footer-grid" style={{ paddingBottom: '48px', borderBottom: '1px solid var(--border-color)' }}>
              {/* Col 1: Brand Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800 }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
                      padding: '8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Pizza style={{ width: '22px', height: '22px', color: '#FFF' }} />
                  </div>
                  <span>
                    Slice<span className="gradient-text" style={{ fontWeight: 900 }}>Craft</span>
                  </span>
                </Link>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '360px', lineHeight: 1.6 }}>
                  Handcrafted artisan pizza crafted with slow-fermented dough, organic sauces, and gourmet toppings. Delivered hot and fresh to your door in 30 minutes.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                  <a href="#instagram" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#94A3B8', display: 'flex' }}>
                    <Instagram style={{ width: '16px', height: '16px' }} />
                  </a>
                  <a href="#twitter" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#94A3B8', display: 'flex' }}>
                    <Twitter style={{ width: '16px', height: '16px' }} />
                  </a>
                  <a href="#facebook" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#94A3B8', display: 'flex' }}>
                    <Facebook style={{ width: '16px', height: '16px' }} />
                  </a>
                  <a href="#youtube" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#94A3B8', display: 'flex' }}>
                    <Youtube style={{ width: '16px', height: '16px' }} />
                  </a>
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FFF' }}>Quick Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
                  <Link to="/" style={{ color: '#94A3B8' }}>Home</Link>
                  <a href="/#menu" style={{ color: '#94A3B8' }}>Signature Menu</a>
                  <button onClick={() => setIsBuilderOpen(true)} style={{ background: 'none', border: 'none', color: '#94A3B8', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
                    Custom Pizza Builder
                  </button>
                  <a href="/#how-it-works" style={{ color: '#94A3B8' }}>How It Works</a>
                  <a href="/#about" style={{ color: '#94A3B8' }}>Our Story</a>
                </div>
              </div>

              {/* Col 3: Customer Support */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FFF' }}>Customer Care</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
                  <Link to="/my-orders" style={{ color: '#94A3B8' }}>Track My Order</Link>
                  <a href="/#contact" style={{ color: '#94A3B8' }}>Help & FAQs</a>
                  <a href="#terms" style={{ color: '#94A3B8' }}>Terms of Service</a>
                  <a href="#privacy" style={{ color: '#94A3B8' }}>Privacy Policy</a>
                  {(!user || user.role === 'admin') && (
                    <Link to="/admin/login" style={{ color: '#FF8A00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield style={{ width: '12px', height: '12px' }} /> Admin Portal
                    </Link>
                  )}
                </div>
              </div>

              {/* Col 4: Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FFF' }}>Contact Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin style={{ width: '16px', height: '16px', color: '#F7254F', flexShrink: 0, marginTop: '2px' }} />
                    <span>452 Artisan Blvd, Gourmet District, Suite 100</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone style={{ width: '16px', height: '16px', color: '#FF8A00', flexShrink: 0 }} />
                    <span>+1 (800) 754-2327</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
                    <span>support@slicecraftpizza.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: '#64748B' }}>
              <p>© 2026 SliceCraft. All rights reserved.</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Baked fresh with <Heart style={{ width: '14px', height: '14px', color: '#F7254F', fill: '#F7254F', display: 'inline' }} /> & craftsmanship
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Render Minimal Admin Footer on Admin routes */}
      {isAdminRoute && (
        <footer className="admin-footer">
          <div className="site-container">
            <div className="admin-footer-inner">
              <div className="admin-footer-copy">© 2026 SliceCraft Admin Portal</div>
              <div className="admin-footer-tag">Secure Operations Center</div>
              <div className="admin-footer-status">
                <span className="live-status-dot"></span> System Operational
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}


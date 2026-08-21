import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Pizza,
  Layers,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  RefreshCw,
  Kanban,
  Menu,
  X
} from 'lucide-react';

export default function AdminNavbar({
  activeTab,
  setActiveTab,
  ordersCount = 0,
  invCount = 0,
  usersCount = 0,
  onRefresh,
}) {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { key: 'overview', label: 'Dashboard', icon: Layers, badge: 0 },
    { key: 'kanban', label: 'Live Kitchen', icon: Kanban, badge: 0 },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, badge: ordersCount },
    { key: 'inventory', label: 'Inventory', icon: Package, badge: invCount },
    { key: 'users', label: 'Users', icon: Users, badge: usersCount },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, badge: 0 },
    { key: 'settings', label: 'Settings', icon: Settings, badge: 0 },
  ];

  return (
    <header className="admin-navbar-header">
      <div className="site-container admin-navbar-container">
        {/* Brand & Admin Badge */}
        <div className="admin-navbar-brand-row">
          <div className="admin-navbar-brand" onClick={() => handleTabSelect('overview')}>
            <div className="admin-brand-icon">
              <Pizza style={{ width: '20px', height: '20px', color: '#FFF' }} />
            </div>
            <div className="admin-brand-text-col">
              <div className="admin-brand-title">
                Slice<span className="gradient-text">Craft</span>
              </div>
              <div className="admin-brand-subtitle">
                <span className="admin-badge-mini">Admin Portal</span>
                <span className="admin-live-indicator">
                  <span className="live-dot-sm" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Desktop Navigation Links */}
        <nav className="admin-nav-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabSelect(item.key)}
                className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              >
                <Icon style={{ width: '15px', height: '15px' }} />
                {item.label}
                {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Desktop Admin User Info & Actions */}
        <div className="admin-actions-desktop">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-secondary"
              title="Refresh Data from MongoDB"
              style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} /> Sync
            </button>
          )}

          <div className="admin-user-pill" style={{ padding: '4px 10px 4px 6px', flexShrink: 0 }}>
            <div className="admin-avatar-circle" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '120px', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'admin@slicecraft.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of Admin Panel"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '9999px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.color = '#FFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#F87171';
            }}
          >
            <LogOut style={{ width: '13px', height: '13px' }} /> Logout
          </button>
        </div>

        {/* Mobile Actions Toggle Bar */}
        <div className="admin-actions-mobile-toggle">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-secondary"
              title="Refresh Data"
              style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw style={{ width: '12px', height: '12px' }} /> Sync
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="admin-mobile-hamburger"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>
      </div>

      {/* Touch-Friendly Scrollable Tab Strip for Mobile */}
      <div className="admin-mobile-tab-bar">
        <div className="admin-mobile-tab-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabSelect(item.key)}
                className={`admin-mobile-tab-btn ${activeTab === item.key ? 'active' : ''}`}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                <span>{item.label}</span>
                {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Mobile Profile & Logout Drawer */}
      {mobileMenuOpen && (
        <div className="admin-mobile-drawer animate-fade-in">
          <div className="admin-mobile-drawer-inner">
            <div className="admin-mobile-user-card">
              <div className="admin-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  {user?.name || 'Administrator'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.email || 'admin@slicecraft.com'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
              {onRefresh && (
                <button
                  onClick={() => { onRefresh(); setMobileMenuOpen(false); }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <RefreshCw style={{ width: '15px', height: '15px' }} /> Sync MongoDB
                </button>
              )}

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut style={{ width: '15px', height: '15px' }} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

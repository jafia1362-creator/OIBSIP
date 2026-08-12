import React, { useContext } from 'react';
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
  ExternalLink,
  ShieldCheck
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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 17, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 138, 0, 0.2)',
        padding: '12px 0',
      }}
    >
      <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        {/* Brand & Admin Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleTabSelect('overview')}>
            <div
              style={{
                background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(247, 37, 79, 0.3)',
              }}
            >
              <Pizza style={{ width: '22px', height: '22px', color: '#FFF' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', lineHeight: 1 }}>
                Slice<span className="gradient-text">Craft</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    background: 'rgba(255, 138, 0, 0.15)',
                    color: '#FF8A00',
                    border: '1px solid rgba(255, 138, 0, 0.3)',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Admin Portal
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Admin Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          <button
            onClick={() => handleTabSelect('overview')}
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <Layers style={{ width: '15px', height: '15px' }} />
            Dashboard
          </button>

          <button
            onClick={() => handleTabSelect('kanban')}
            className={`admin-nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
          >
            <Kanban style={{ width: '15px', height: '15px' }} />
            Live Kitchen
          </button>

          <button
            onClick={() => handleTabSelect('orders')}
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingBag style={{ width: '15px', height: '15px' }} />
            Orders
            {ordersCount > 0 && <span className="admin-nav-badge">{ordersCount}</span>}
          </button>

          <button
            onClick={() => handleTabSelect('inventory')}
            className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Package style={{ width: '15px', height: '15px' }} />
            Inventory
            {invCount > 0 && <span className="admin-nav-badge">{invCount}</span>}
          </button>

          <button
            onClick={() => handleTabSelect('users')}
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users style={{ width: '15px', height: '15px' }} />
            Users
            {usersCount > 0 && <span className="admin-nav-badge">{usersCount}</span>}
          </button>

          <button
            onClick={() => handleTabSelect('analytics')}
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 style={{ width: '15px', height: '15px' }} />
            Analytics
          </button>

          <button
            onClick={() => handleTabSelect('settings')}
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings style={{ width: '15px', height: '15px' }} />
            Settings
          </button>
        </nav>

        {/* Admin User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-secondary"
              title="Refresh Data from MongoDB"
              style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} /> Sync
            </button>
          )}

          <div className="admin-user-pill" style={{ padding: '5px 12px 5px 6px' }}>
            <div className="admin-avatar-circle" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                {user?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {user?.email || 'admin@slicecraft.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary"
            title="Sign out of Admin Panel"
            style={{ padding: '7px 12px', fontSize: '0.78rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut style={{ width: '13px', height: '13px' }} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { ShoppingBag, RefreshCw, Sparkles, MapPin, Calendar, CreditCard, Hash, Truck, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

export default function UserOrders() {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchUserOrders();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    // Real-time listener for newly placed orders
    socket.on('new_order', (newOrder) => {
      const isUserOrder =
        (user && newOrder.user === user._id) ||
        (user && newOrder.customerEmail === user.email);

      if (isUserOrder) {
        setOrders((prevOrders) => {
          if (prevOrders.some((o) => o._id === newOrder._id)) {
            return prevOrders;
          }
          return [newOrder, ...prevOrders];
        });
      }
    });

    // Real-time listener for status updates
    socket.on('order_status_updated', (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === data.orderId
            ? { ...o, orderStatus: data.orderStatus, updatedAt: data.updatedAt }
            : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user, API_BASE_URL]);

  const fetchUserOrders = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, { timeout: 4000 });
      setOrders(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setFetchError(err?.response?.data?.message || 'Unable to connect to order server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="site-container orders-page animate-fade-in">
      {/* 1. Page Header with Compact Spacing & Live Indicator */}
      <div className="orders-header">
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>
            <ShoppingBag style={{ width: '14px', height: '14px' }} /> Order History & Live Sync
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            My Orders & <span className="gradient-text">Live Tracker</span>
          </h1>
          <div className="orders-header-sub">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time kitchen-to-doorstep status powered by Socket.io
            </span>
            <span className="live-indicator-pill">
              <span className="live-dot-pulse"></span> LIVE
            </span>
          </div>
        </div>

        <button
          onClick={fetchUserOrders}
          className="btn-secondary"
          style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} /> Refresh Orders
        </button>
      </div>

      {/* 2. Main Orders List / Loading / Error / Empty State */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '4px solid #F7254F',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          Syncing order records...
        </div>
      ) : fetchError ? (
        <div className="glass-panel" style={{ padding: '32px 24px', borderRadius: '24px', textAlign: 'center', maxWidth: '520px', margin: '20px auto', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginBottom: '8px' }}>Unable to Load Orders</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {fetchError}
          </p>
          <button onClick={fetchUserOrders} className="btn-primary">
            <RefreshCw style={{ width: '16px', height: '16px' }} /> Retry Syncing Orders
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', borderRadius: '24px', textAlign: 'center', maxWidth: '520px', margin: '20px auto' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(247, 37, 79, 0.1)',
              color: '#F7254F',
              width: '64px',
              height: '64px',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag style={{ width: '32px', height: '32px' }} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>No Orders Found Yet</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            You haven't placed any custom or signature pizza orders yet.
          </p>
          <Link to="/" className="btn-primary">
            <Sparkles style={{ width: '16px', height: '16px' }} /> Explore Menu & Build Pizza
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Top Order Summary 3-Column Layout */}
              <div className="order-summary-grid">
                <div className="summary-col">
                  <span className="summary-label">
                    <Hash style={{ width: '13px', height: '13px', color: '#F7254F' }} /> Order Reference
                  </span>
                  <div className="summary-value ref-code">
                    #{order._id?.slice(-8) || order._id}
                  </div>
                </div>

                <div className="summary-col">
                  <span className="summary-label">
                    <Calendar style={{ width: '13px', height: '13px', color: '#FF8A00' }} /> Date Placed
                  </span>
                  <div className="summary-value">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>

                <div className="summary-col">
                  <span className="summary-label">
                    <CreditCard style={{ width: '13px', height: '13px', color: '#10B981' }} /> Total Paid
                  </span>
                  <div className="summary-value price-accent">
                    ₹{order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Real-Time Live Tracker Widget */}
              <OrderTracker order={order} />

              {/* Compact Order Items Section */}
              {order.items && order.items.length > 0 && (
                <div className="order-items-section">
                  <h5 className="order-items-title">
                    <Package style={{ width: '14px', height: '14px', color: '#F7254F' }} />
                    Order Items ({order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)})
                  </h5>
                  <div className="order-items-list">
                    {order.items.map((item, idx) => {
                      const itemName = item.name || item.customName || 'Custom Artisan Pizza';
                      const qty = item.quantity || 1;
                      const itemTotal = (item.price || 0) * qty;

                      return (
                        <div key={idx} className="order-item-row">
                          <div className="item-main-info">
                            <span className="item-name">{itemName}</span>
                            {(item.base?.name || item.sauce?.name) && (
                              <span className="item-details">
                                {item.base?.name ? `Base: ${item.base.name}` : ''}
                                {item.sauce?.name ? ` • Sauce: ${item.sauce.name}` : ''}
                              </span>
                            )}
                          </div>
                          <div className="item-qty-badge">× {qty}</div>
                          <div className="item-price">₹{itemTotal}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Address & Method Information Footer */}
              <div className="order-footer-grid">
                <div className="delivery-footer-item">
                  <MapPin style={{ width: '16px', height: '16px', color: '#F7254F', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Address</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{order.deliveryAddress}</strong>
                  </div>
                </div>

                <div className="delivery-footer-item">
                  <Truck style={{ width: '16px', height: '16px', color: '#FF8A00', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Method</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>30-Min Express Delivery</strong>
                  </div>
                </div>

                <div className="delivery-footer-item">
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Payment Method</span>
                    <strong style={{ color: '#10B981', fontSize: '0.85rem' }}>
                      {order.razorpayPaymentId ? 'Razorpay Online' : 'Online Payment'} ({order.paymentStatus || 'Completed'})
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { ShoppingBag, RefreshCw, Sparkles, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

export default function UserOrders() {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          // Avoid duplicate entries
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
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/my-orders`);
      setOrders(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  return (
    <div className="site-container orders-page animate-fade-in">
      <div className="orders-header">
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
            <ShoppingBag style={{ width: '14px', height: '14px' }} /> Order History & Live Sync
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            My Orders & <span className="gradient-text">Live Tracker</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time kitchen-to-doorstep status powered by Socket.io
          </p>
        </div>

        <button
          onClick={fetchUserOrders}
          className="btn-secondary"
          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '4px solid #F7254F',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          Syncing order records...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', borderRadius: '24px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(247, 37, 79, 0.1)',
            color: '#F7254F',
            width: '64px',
            height: '64px',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
              {/* Order Header Summary */}
              <div className="order-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Order Reference:</span>
                  <div className="meta-value" style={{ fontFamily: 'monospace' }}>
                    #{order._id?.slice(-8) || order._id}
                  </div>
                </div>

                <div className="meta-item">
                  <span className="meta-label">
                    <Calendar style={{ width: '14px', height: '14px' }} /> Date Placed:
                  </span>
                  <div className="meta-value">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>

                <div className="meta-item">
                  <span className="meta-label">
                    <CreditCard style={{ width: '14px', height: '14px' }} /> Total Paid:
                  </span>
                  <div className="meta-value price">
                    ₹{order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Real-Time Live Tracker Widget */}
              <OrderTracker order={order} />

              {/* Delivery Address & Meta */}
              <div className="order-footer-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#F7254F', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Address: </span>
                    <strong style={{ color: '#fff' }}>{order.deliveryAddress}</strong>
                  </div>
                </div>

                <div>
                  <span className="badge badge-success">
                    Payment {order.paymentStatus || 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


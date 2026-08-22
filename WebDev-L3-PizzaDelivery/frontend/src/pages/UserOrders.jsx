import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { ShoppingBag, RefreshCw, Sparkles, MapPin, Calendar, CreditCard, Hash, Truck, Package, ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

export default function UserOrders() {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Cancellation Modal & Toast States
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Changed my mind');
  const [cancellationNote, setCancellationNote] = useState('');
  const [isCancellationSubmitting, setIsCancellationSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

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

  const handleCancelOrder = (order) => {
    setCancellingOrder(order);
    setCancellationReason('Changed my mind');
    setCancellationNote('');
  };

  const handleConfirmCancellation = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    setIsCancellationSubmitting(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/orders/cancel/${cancellingOrder._id}`, {
        cancellation_reason: cancellationReason,
        cancellation_note: cancellationNote,
      });

      // Update state immediately
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === cancellingOrder._id
            ? {
                ...o,
                orderStatus: 'Cancelled',
                cancellation_reason: cancellationReason,
                cancellation_note: cancellationNote,
                cancelled_at: res.data.order?.cancelled_at || new Date(),
                cancelled_by: res.data.order?.cancelled_by || 'Customer',
                updatedAt: res.data.order?.updatedAt || new Date(),
              }
            : o
        )
      );

      showToast('Order cancelled successfully!', 'success');
      setCancellingOrder(null);
    } catch (err) {
      showToast(`Failed to cancel order: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setIsCancellationSubmitting(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Active Orders Section */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
              Active Orders & Live Tracking
            </h2>
            {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active orders at the moment. Design your next pizza above!
              </div>
            ) : (
              <div className="orders-list">
                {orders
                  .filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
                  .map((order) => (
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

                      {/* Order Cancellation option for customers (Only if Order is Received) */}
                      {order.orderStatus === 'Order Received' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="btn-secondary"
                            style={{
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: '#F87171',
                              padding: '8px 16px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}

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

          {/* Previous Orders & History Section */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              Order History & Completed Deliveries
            </h2>
            {orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Cancelled').length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No completed or cancelled orders in your account history.
              </div>
            ) : (
              <div className="orders-list">
                {orders
                  .filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Cancelled')
                  .map((order) => (
                    <div key={order._id} className="order-card" style={{ opacity: order.orderStatus === 'Cancelled' ? 0.75 : 1 }}>
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

                      {/* Cancelled Info Bar vs Delivered Indicator */}
                      {order.orderStatus === 'Cancelled' ? (
                        <div style={{ margin: '16px 20px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#EF4444', color: '#FFF', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Cancelled</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              on {new Date(order.cancelled_at || order.updatedAt).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#FFF', marginTop: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                            <strong>{order.cancellation_reason || 'Customer request'}</strong>
                          </div>
                          {order.cancellation_note && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              <span>Detail: </span>
                              <span style={{ fontStyle: 'italic' }}>"{order.cancellation_note}"</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ margin: '16px 20px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Delivered ✓</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Thank you for your order! It was successfully dispatched and delivered to your doorstep.
                          </span>
                        </div>
                      )}

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
        </div>
      )}

      {/* ========================================================
          CUSTOMER CANCELLATION MODAL
          ======================================================== */}
      {cancellingOrder && (
        <div className="admin-modal-overlay" onClick={() => setCancellingOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div className="admin-modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle style={{ width: '22px', height: '22px', color: '#F87171' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Cancel Order
                </h3>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleConfirmCancellation} className="admin-modal-body space-y-4" style={{ paddingTop: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID: </span>
                  <strong style={{ color: '#FFF' }}>#{cancellingOrder._id}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount: </span>
                  <strong style={{ color: '#FFF' }}>₹{cancellingOrder.totalAmount}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>
                  Cancellation Reason <span style={{ color: '#F87171' }}>*</span>
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Order took too long">Order took too long</option>
                  <option value="Incorrect items selected">Incorrect items selected</option>
                  <option value="Delivery address issue">Delivery address issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  placeholder="Tell us more about your cancellation request..."
                  className="input-field"
                  style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                  disabled={isCancellationSubmitting}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    background: '#EF4444',
                    borderColor: '#EF4444',
                    color: '#FFF',
                    fontWeight: 700,
                  }}
                  disabled={isCancellationSubmitting}
                >
                  {isCancellationSubmitting ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TOAST NOTIFICATION OVERLAY
          ======================================================== */}
      {toast && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? (
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            ) : (
              <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

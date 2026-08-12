import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, ShieldCheck, MapPin, CreditCard, CheckCircle, AlertCircle, ArrowRight, LogIn } from 'lucide-react';

export default function OrderSummaryModal({ isOpen, onClose, pizzaItem, onOrderSuccess }) {
  const { user, API_BASE_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState('123 Artisan Street, Foodie Bay, Suite 4B');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !pizzaItem) return null;

  const totalAmount = pizzaItem.totalPrice;

  const handleRazorpayCheckout = async () => {
    if (!user) {
      setError('Please sign in or register first to place an order.');
      return;
    }

    if (!address.trim()) {
      return setError('Please enter a valid delivery address.');
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Order ID from Backend
      const orderRes = await axios.post(
        `${API_BASE_URL}/orders/razorpay-order`,
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const orderData = orderRes.data;

      // Check if Razorpay script is loaded in window
      if (window.Razorpay && !orderData.mock) {
        const options = {
          key: orderData.key || 'rzp_test_demo_key',
          amount: orderData.amount,
          currency: 'INR',
          name: 'SliceCraft Artisan Pizza',
          description: `Payment for ${pizzaItem.customName || 'Custom Pizza'}`,
          order_id: orderData.id,
          handler: async function (response) {
            await confirmOrderInBackend({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: user?.name || 'Customer Name',
            email: user?.email || 'customer@example.com',
          },
          theme: {
            color: '#F7254F',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback for Razorpay Test / Mock Mode (clicking Success confirms the order)
        setTimeout(async () => {
          await confirmOrderInBackend({
            razorpayOrderId: orderData.id || `order_test_${Date.now()}`,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: 'mock_valid_signature',
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  const confirmOrderInBackend = async (paymentDetails) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/orders/place-order`,
        {
          customerName: user?.name || 'Customer',
          customerEmail: user?.email || 'customer@example.com',
          deliveryAddress: address,
          items: [pizzaItem],
          totalAmount,
          ...paymentDetails,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setLoading(false);
      onOrderSuccess(res.data.order);
    } catch (err) {
      console.error('Order save error:', err);
      setError(err.response?.data?.message || 'Order payment succeeded, but failed to save order.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(15, 17, 26, 0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <ShieldCheck style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>Order Summary & Checkout</h2>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Review items & finalize delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Not Logged In Warning Banner */}
          {!user ? (
            <div style={{ padding: '16px', background: 'rgba(255, 138, 0, 0.15)', border: '1px solid rgba(255, 138, 0, 0.3)', borderRadius: '14px', color: '#FF8A00', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <span>You need to Sign In to complete your order</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                Please login with your customer account or register in 10 seconds to track your live pizza delivery.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="btn-orange"
                style={{ padding: '8px 16px', fontSize: '0.8rem', alignSelf: 'flex-start' }}
              >
                <LogIn style={{ width: '14px', height: '14px' }} /> Sign In to Place Order
              </button>
            </div>
          ) : error ? (
            <div style={{ padding: '14px', background: 'rgba(247, 37, 79, 0.15)', border: '1px solid rgba(247, 37, 79, 0.3)', borderRadius: '14px', color: '#F7254F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Order Details Card */}
          <div style={{ padding: '18px', borderRadius: '16px', background: 'rgba(10, 12, 19, 0.8)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 800, color: '#F7254F', fontSize: '0.95rem' }}>{pizzaItem.customName || 'Artisan Custom Pizza'}</span>
              <span style={{ fontWeight: 900, color: '#FF8A00', fontSize: '1.1rem' }}>₹{pizzaItem.totalPrice}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#CBD5E1' }}>
              <p>• <strong style={{ color: '#FFF' }}>Crust Base:</strong> {pizzaItem.base?.name} (+₹{pizzaItem.base?.price})</p>
              <p>• <strong style={{ color: '#FFF' }}>Sauce:</strong> {pizzaItem.sauce?.name} (+₹{pizzaItem.sauce?.price})</p>
              <p>• <strong style={{ color: '#FFF' }}>Cheese:</strong> {pizzaItem.cheese?.name} (+₹{pizzaItem.cheese?.price})</p>
              {pizzaItem.veggies?.length > 0 && (
                <p>
                  • <strong style={{ color: '#FFF' }}>Vegetables:</strong> {pizzaItem.veggies.map((v) => v.name).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin style={{ width: '14px', height: '14px', color: '#F7254F' }} /> Delivery Address
            </label>
            <input
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete house / street address..."
              style={{ marginTop: '4px' }}
            />
          </div>

          {/* Razorpay Test Mode Banner */}
          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(255, 138, 0, 0.12)', border: '1px solid rgba(255, 138, 0, 0.25)', color: '#FF8A00', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>Razorpay Test Mode Active • Safe testing with automated inventory stock decrement.</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(15, 17, 26, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', fontWeight: 600 }}>Total Amount</span>
            <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{totalAmount}</span>
          </div>

          {user ? (
            <button
              onClick={handleRazorpayCheckout}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.9rem' }}
            >
              {loading ? 'Processing Order...' : 'Pay with Razorpay'} <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.9rem' }}
            >
              Sign In to Order <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

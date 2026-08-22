import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Clock, ChefHat, Bike, CheckCircle2, Check, Radio } from 'lucide-react';
import { SOCKET_URL } from '../config/api';

const STATUS_STEPS = [
  { id: 'Order Received', label: 'Order Received', icon: Clock, altKeys: ['Order Received'] },
  { id: 'Preparing', label: 'Preparing', icon: ChefHat, altKeys: ['In Kitchen', 'Preparing'] },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Bike, altKeys: ['Sent to Delivery', 'Out for Delivery'] },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, altKeys: ['Delivered'] },
];

export default function OrderTracker({ order }) {
  const [currentStatus, setCurrentStatus] = useState(order?.orderStatus || 'Order Received');

  useEffect(() => {
    setCurrentStatus(order?.orderStatus || 'Order Received');
  }, [order]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('order_status_updated', (data) => {
      if (data.orderId === order?._id) {
        setCurrentStatus(data.orderStatus);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order]);

  // Find 0-indexed stage position dynamically from order status data
  const getCurrentStepIndex = () => {
    const idx = STATUS_STEPS.findIndex(
      (s) => s.id === currentStatus || s.altKeys.includes(currentStatus)
    );
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = getCurrentStepIndex();
  const progressPercent = (activeIndex / (STATUS_STEPS.length - 1)) * 100;

  // Contextual status text based on progress
  const getStatusSubtext = () => {
    if (order?.estimatedDelivery) return `Estimated Delivery: ${order.estimatedDelivery}`;
    if (currentStatus === 'Delivered') return 'Order successfully delivered to your doorstep!';
    if (currentStatus === 'Sent to Delivery' || currentStatus === 'Out for Delivery')
      return 'Your artisan pizza is hot & on the way';
    if (currentStatus === 'In Kitchen' || currentStatus === 'Preparing')
      return 'Chef is stone-baking your custom pizza';
    return 'Order received & confirmed by restaurant';
  };

  // Get displayed badge label
  const getBadgeLabel = () => {
    const step = STATUS_STEPS[activeIndex];
    return step ? step.label : currentStatus;
  };

  return (
    <div className="tracker-box">
      {/* Tracker Card Header */}
      <div className="tracker-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="order-id-code">
              Order ID: #{order?._id?.slice(-8) || order?._id}
            </span>
            <span className="live-tracking-pill">
              <span className="live-dot-pulse"></span> LIVE TRACKING
            </span>
          </div>
          <h4 className="tracker-title">
            Live Kitchen & Delivery Tracking
          </h4>
          <p className="tracker-subtitle">{getStatusSubtext()}</p>
        </div>

        {/* Dynamic Status Badge */}
        <div className="current-status-badge">
          <Radio style={{ width: '14px', height: '14px' }} />
          <span>{getBadgeLabel()}</span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="tracker-stepper-wrap">
        {/* Track Line */}
        <div className="tracker-progress-track">
          <div
            className="tracker-progress-bar"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* 4 Stage Timeline Grid */}
        <div className="tracker-steps-grid">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const statusClass = isCurrent ? 'current' : isDone ? 'done' : 'pending';

            return (
              <div key={step.id} className={`tracker-step-item ${statusClass}`}>
                <div className={`tracker-icon-circle ${statusClass}`}>
                  {isDone ? (
                    <Check style={{ width: '20px', height: '20px', strokeWidth: 3 }} />
                  ) : (
                    <Icon style={{ width: '22px', height: '22px' }} />
                  )}
                </div>

                <div className="tracker-step-info">
                  <span className={`tracker-step-label ${statusClass}`}>
                    {step.label}
                  </span>
                  {isCurrent && <span className="current-step-tag">CURRENT</span>}
                  {isDone && <span className="done-step-tag">COMPLETED</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

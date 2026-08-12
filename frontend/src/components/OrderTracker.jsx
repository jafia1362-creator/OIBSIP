import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Clock, ChefHat, Bike, CheckCircle2 } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const STATUS_STEPS = [
  { id: 'Order Received', label: 'Order Received', icon: Clock },
  { id: 'In Kitchen', label: 'In Kitchen', icon: ChefHat },
  { id: 'Sent to Delivery', label: 'Sent to Delivery', icon: Bike },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
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

  const getCurrentStepIndex = () => {
    const idx = STATUS_STEPS.findIndex((s) => s.id === currentStatus);
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = getCurrentStepIndex();
  // Calculate progress width percentage (0%, 33.3%, 66.6%, 100%)
  const progressPercent = (activeIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className="tracker-box">
      <div className="tracker-header">
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Order ID: #{order?._id?.slice(-8) || order?._id}
          </span>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
            Live Kitchen & Delivery Tracking
          </h4>
        </div>
        <span
          style={{
            background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '6px 14px',
            borderRadius: '9999px',
            boxShadow: '0 4px 15px rgba(247, 37, 79, 0.3)',
          }}
        >
          {currentStatus}
        </span>
      </div>

      {/* Timeline Steps with Connected Progress Bar */}
      <div className="tracker-stepper-wrap">
        {/* Background Track & Filled Line */}
        <div className="tracker-progress-track">
          <div
            className="tracker-progress-bar"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="tracker-steps-grid">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const statusClass = isCurrent ? 'current' : isDone ? 'done' : 'pending';

            return (
              <div key={step.id} className="tracker-step-item">
                <div className={`tracker-icon-circle ${statusClass}`}>
                  <Icon style={{ width: '22px', height: '22px' }} />
                </div>
                <span className={`tracker-step-label ${statusClass}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


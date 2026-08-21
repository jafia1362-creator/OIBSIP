import React from 'react';
import { Zap, Star, Flame, Leaf, Sparkles } from 'lucide-react';
import authPizzaImg from '../assets/auth-pizza.png';

export default function AuthVisualPanel() {
  return (
    <div className="auth-visual-side">
      {/* Dynamic ambient glow backdrop */}
      <div className="auth-visual-bg-glow" />

      {/* Floating Ingredient Particles / Steam */}
      <div className="auth-floating-particle p1" style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.7, color: '#10B981', animation: 'float 7s ease-in-out infinite' }}>
        <Leaf size={22} style={{ transform: 'rotate(15deg)' }} />
      </div>
      <div className="auth-floating-particle p2" style={{ position: 'absolute', top: '65%', right: '12%', opacity: 0.6, color: '#FF8A00', animation: 'float 5s ease-in-out infinite 1s' }}>
        <Flame size={20} />
      </div>
      <div className="auth-floating-particle p3" style={{ position: 'absolute', bottom: '15%', left: '18%', opacity: 0.5, color: '#F7254F', animation: 'float 6s ease-in-out infinite 0.5s' }}>
        <Sparkles size={18} />
      </div>

      {/* Floating Speed Badge */}
      <div className="auth-badge-speed">
        <Zap style={{ width: '16px', height: '16px', color: '#FF8A00' }} />
        <span>30 Mins Express Delivery</span>
      </div>

      {/* Hero Pizza Card */}
      <div className="auth-hero-card">
        <img
          src={authPizzaImg}
          alt="SliceCraft Artisan Pizza"
          className="auth-hero-img"
        />
        <div className="auth-hero-overlay">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#F7254F', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Freshly Baked
            </span>
            <span style={{ color: '#CBD5E1', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame style={{ width: '12px', height: '12px', color: '#FF8A00' }} /> Woodfired Stone Oven
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
            Handcrafted Artisan Pizzas
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
            Made with 100% organic sourdough dough & imported Italian mozzarella.
          </p>
        </div>
      </div>

      {/* Floating Rating Badge */}
      <div className="auth-badge-rating">
        <Star style={{ width: '16px', height: '16px', color: '#F59E0B', fill: '#F59E0B' }} />
        <span>4.9 ★ (2.4k+ Gourmet Reviews)</span>
      </div>
    </div>
  );
}


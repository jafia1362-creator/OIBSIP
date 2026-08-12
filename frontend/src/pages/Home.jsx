import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PizzaBuilder from '../components/PizzaBuilder';
import OrderSummaryModal from '../components/OrderSummaryModal';
import {
  Sparkles,
  Pizza,
  Flame,
  Star,
  ShoppingBag,
  Zap,
  ChefHat,
  Truck,
  ShieldCheck,
  Clock,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function Home({ isBuilderOpen, setIsBuilderOpen }) {
  const { API_BASE_URL } = useContext(AuthContext);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPizzaForItem, setSelectedPizzaForItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/options`);
      setPresets(res.data.presets || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching presets:', err);
      setLoading(false);
    }
  };

  const handleOrderPreset = (preset) => {
    const pizzaItem = {
      base: { name: 'Thin Crust Base', price: 120 },
      sauce: { name: 'Classic Tomato Sauce', price: 30 },
      cheese: { name: '100% Mozzarella Cheese', price: 60 },
      veggies: [{ name: 'Capsicum', price: 25 }],
      customName: preset.name,
      totalPrice: preset.price,
    };
    setSelectedPizzaForItem(pizzaItem);
    setIsCheckoutOpen(true);
  };

  const handleProceedFromBuilder = (customPizzaItem) => {
    setIsBuilderOpen(false);
    setSelectedPizzaForItem(customPizzaItem);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order) => {
    setIsCheckoutOpen(false);
    setLastPlacedOrder(order);
    alert(`🎉 Order placed successfully! Order ID: #${order._id?.slice(-8) || order._id}`);
  };

  const scrollToMenu = () => {
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '60px' }}>
      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="site-container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-left">
              {/* Fresh Badge */}
              <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                <Flame style={{ width: '16px', height: '16px', color: '#F7254F' }} />
                <span>FRESHLY BAKED & DELIVERED HOT</span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-title">
                Craft Your Perfect <br />
                <span className="gradient-text">Artisan Pizza</span> Today
              </h1>

              {/* Description */}
              <p className="hero-desc">
                Choose from premium ingredients and build your perfect pizza with our interactive 4-step custom pizza builder. Stone-baked freshness delivered directly to your door in 30 minutes.
              </p>

              {/* Action Buttons */}
              <div className="hero-actions">
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="btn-primary"
                  style={{ padding: '14px 32px', fontSize: '1rem' }}
                >
                  <Sparkles style={{ width: '18px', height: '18px' }} /> Start Custom Pizza Builder
                </button>
                <button
                  onClick={scrollToMenu}
                  className="btn-secondary"
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  Explore Menu
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-stats">
                <div className="hero-stat-item">
                  <h4 style={{ color: '#FFF' }}>5+</h4>
                  <p>Crust Bases</p>
                </div>
                <div className="hero-stat-item">
                  <h4 style={{ color: '#F7254F' }}>30 Min</h4>
                  <p>Express Delivery</p>
                </div>
                <div className="hero-stat-item">
                  <h4 style={{ color: '#FF8A00' }}>4.9 ★</h4>
                  <p>Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Right Graphic / Hero Pizza Visual */}
            <div className="hero-right">
              {/* Background Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '350px',
                  height: '350px',
                  background: 'radial-gradient(circle, rgba(247,37,79,0.35) 0%, rgba(255,138,0,0.2) 50%, transparent 70%)',
                  filter: 'blur(40px)',
                  zIndex: -1,
                }}
              ></div>

              {/* Floating Hero Pizza Image Card */}
              <div className="animate-float" style={{ position: 'relative' }}>
                <div className="hero-image-card">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85"
                    alt="Artisan Stone-Baked Pizza"
                  />
                </div>

                {/* Floating Badge 1 (Speed) */}
                <div className="hero-floating-badge hero-badge-top">
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255,138,0,0.2)', color: '#FF8A00' }}>
                    <Zap style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Speed</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFF' }}>⚡ 30 Mins Delivery</span>
                  </div>
                </div>

                {/* Floating Badge 2 (Rating) */}
                <div className="hero-floating-badge hero-badge-bottom">
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(247,37,79,0.2)', color: '#F7254F' }}>
                    <Star style={{ width: '18px', height: '18px', fill: '#F7254F' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Quality</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFF' }}>⭐ 4.9 (2.4k+ Reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE SECTION */}
      <section className="site-container">
        <div className="features-grid">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(247,37,79,0.15)', color: '#F7254F', border: '1px solid rgba(247,37,79,0.25)' }}>
              <Pizza style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Fresh Ingredients</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Premium ingredients prepared fresh every day from locally certified organic farms.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(255,138,0,0.15)', color: '#FF8A00', border: '1px solid rgba(255,138,0,0.25)' }}>
              <Zap style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Fast Delivery</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Hot and fresh pizza delivered quickly to your door with thermal temperature protection.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
              <ChefHat style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Custom Pizza</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Build your own pizza exactly the way you like it with 5 bases, 5 sauces, gourmet cheese & veggies.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.25)' }}>
              <Truck style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Live Order Tracking</h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Track your order in real-time from the chef's kitchen all the way to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE MENU SECTION */}
      <section id="menu" className="site-container" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '36px' }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
              <Sparkles style={{ width: '14px', height: '14px' }} /> Handcrafted Delights
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>
              Chef's <span className="gradient-text">Signature Menu</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>
              Crafted with authentic stone-oven baking methods and top-grade cheeses
            </p>
          </div>

          <button
            onClick={() => setIsBuilderOpen(true)}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Or Build Custom Pizza <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
            Loading artisan pizza selection...
          </div>
        ) : (
          <div className="menu-grid">
            {presets.map((preset) => (
              <div key={preset._id} className="glass-panel glass-panel-hover menu-card">
                {/* Image */}
                <div className="menu-card-image">
                  <img
                    src={preset.image || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80'}
                    alt={preset.name}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
                      color: '#FFF',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 15px rgba(247,37,79,0.4)',
                    }}
                  >
                    ₹{preset.price}
                  </div>
                </div>

                {/* Details */}
                <div className="menu-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF8A00', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Star style={{ width: '14px', height: '14px', fill: '#FF8A00' }} />
                      <span>4.9</span>
                      <span style={{ color: '#64748B' }}>• (Chef's Choice)</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{preset.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {preset.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOrderPreset(preset)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                  >
                    <ShoppingBag style={{ width: '16px', height: '16px' }} /> Quick Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. CUSTOM PIZZA CALL-TO-ACTION BANNER */}
      <section className="site-container">
        <div className="custom-cta-banner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
              <ChefHat style={{ width: '16px', height: '16px' }} /> Interactive Builder Studio
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF', lineHeight: 1.2 }}>
              Build Your <span className="gradient-text">Dream Pizza</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#E2E8F0', maxWidth: '520px', lineHeight: 1.6 }}>
              Choose your base, sauce, cheese and toppings to create your perfect pizza. Watch the live price update step-by-step and track your order from our oven to your plate!
            </p>
            <div style={{ paddingTop: '8px' }}>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                <Sparkles style={{ width: '18px', height: '18px' }} /> Build My Pizza Now
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className="animate-float"
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid rgba(247,37,79,0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80"
                alt="Custom Pizza Builder Demo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="site-container" style={{ scrollMarginTop: '100px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          <div className="badge badge-warning" style={{ marginBottom: '8px' }}>
            <Clock style={{ width: '14px', height: '14px' }} /> Simple 4-Step Process
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '6px' }}>
            Enjoying your favorite artisan pizza is easy, fast, and completely seamless.
          </p>
        </div>

        <div className="steps-grid">
          {[
            { step: '01', title: 'Choose Your Pizza', desc: 'Select from our master chef recipes or start building from scratch.', icon: Pizza, color: '#F7254F', bg: 'rgba(247,37,79,0.15)' },
            { step: '02', title: 'Customize It', desc: 'Pick your preferred crust, sauce base, cheese blend and toppings.', icon: ChefHat, color: '#FF8A00', bg: 'rgba(255,138,0,0.15)' },
            { step: '03', title: 'Place Your Order', desc: 'Secure checkout with Razorpay and instant payment confirmation.', icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
            { step: '04', title: 'Get It Delivered', desc: 'Watch real-time live order tracking as our driver arrives at your door.', icon: Truck, color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="glass-panel step-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', background: item.bg, color: item.color }}>
                    <Icon style={{ width: '24px', height: '24px' }} />
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="site-container" style={{ scrollMarginTop: '100px' }}>
        <div className="glass-panel" style={{ padding: '48px', borderRadius: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                <HeartHandshake style={{ width: '16px', height: '16px' }} /> The SliceCraft Story
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2 }}>
                Passionate About <span className="gradient-text">Authentic Flavor</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                Founded with a mission to bring true artisan stone-baked pizza to food lovers, SliceCraft combines 48-hour fermented slow-rise dough with vine-ripened Italian tomato sauces and hand-selected cheeses.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                Our custom pizza builder empowers you to be your own chef. Whether you crave classic mozzarella or plant-based vegan cheese, whole-wheat crusts or fiery jalapenos, we bake every single slice to golden perfection.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} /> 100% Pure Mozzarella
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} /> Zero Preservatives
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} /> 48-Hr Slow Fermented
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} /> Thermal Packaging
                </div>
              </div>
            </div>

            <div>
              <div style={{ borderRadius: '20px', overflow: 'hidden', height: '320px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                <img
                  src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80"
                  alt="Pizza Oven Craftsmanship"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="site-container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
            <Star style={{ width: '14px', height: '14px', fill: '#F7254F' }} /> Customer Reviews
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>
            Loved by <span className="gradient-text">Thousands of Foodies</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '6px' }}>
            See what our pizza lovers have to say about the SliceCraft experience
          </p>
        </div>

        <div className="testimonials-grid">
          {[
            {
              name: 'Sarah Jenkins',
              role: 'Verified Customer',
              rating: 5,
              text: '“Absolutely delicious pizza and incredibly fast delivery! The custom builder lets me pick my exact crust and extra olives without any hassle.”',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            },
            {
              name: 'David Miller',
              role: 'Pizza Enthusiast',
              rating: 5,
              text: '“The Cheese Burst base with Garlic Alfredo sauce is out of this world. Real-time live tracking was spot-on and it arrived sizzling hot!”',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            },
            {
              name: 'Ayesha Khan',
              role: 'Regular Foodie',
              rating: 5,
              text: '“Hands down the best artisan pizza in town. Great user experience, fast Razorpay checkout, and top-tier ingredients every single time.”',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            },
          ].map((review, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover testimonial-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', color: '#FF8A00' }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', fill: '#FF8A00' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#CBD5E1', fontStyle: 'italic', lineHeight: 1.6 }}>
                  {review.text}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <img
                  src={review.avatar}
                  alt={review.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F7254F' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{review.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONTACT & LOCATION SECTION */}
      <section id="contact" className="site-container" style={{ scrollMarginTop: '100px' }}>
        <div className="glass-panel" style={{ padding: '48px', borderRadius: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                <PhoneCall style={{ width: '16px', height: '16px' }} /> Get in Touch
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900 }}>
                Have a Question or <span className="gradient-text">Bulk Order?</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                Our kitchen and support team are available 7 days a week to ensure your pizza cravings are fulfilled promptly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', fontSize: '0.85rem', color: '#FFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(247,37,79,0.15)', color: '#F7254F' }}>
                    <PhoneCall style={{ width: '18px', height: '18px' }} />
                  </div>
                  <span>+1 (800) 754-2327 (Toll Free Order Hotline)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,138,0,0.15)', color: '#FF8A00' }}>
                    <Mail style={{ width: '18px', height: '18px' }} />
                  </div>
                  <span>support@slicecraftpizza.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                    <MapPin style={{ width: '18px', height: '18px' }} />
                  </div>
                  <span>452 Artisan Boulevard, Gourmet District, Suite 100</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '28px', borderRadius: '20px', background: 'rgba(10,12,19,0.7)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Kitchen Operating Hours</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Monday – Friday:</span>
                  <span style={{ fontWeight: 700, color: '#FFF' }}>10:00 AM – 11:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Saturday – Sunday:</span>
                  <span style={{ fontWeight: 800, color: '#F7254F' }}>10:00 AM – 01:00 AM (Late Night)</span>
                </div>
              </div>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
              >
                Order Custom Pizza Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pizza Builder Modal */}
      <PizzaBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onProceedToOrder={handleProceedFromBuilder}
        API_BASE_URL={API_BASE_URL}
      />

      {/* Order Summary Checkout Modal */}
      <OrderSummaryModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pizzaItem={selectedPizzaForItem}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

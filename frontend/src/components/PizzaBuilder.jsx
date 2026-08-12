import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, AlertCircle, Pizza, Flame } from 'lucide-react';

const DEFAULT_OPTIONS = {
  bases: [
    { _id: 'b1', name: 'Thin Crust Base', category: 'base', price: 120, stockQuantity: 50, description: 'Crispy & classic thin dough base' },
    { _id: 'b2', name: 'Thick Pan Crust', category: 'base', price: 140, stockQuantity: 45, description: 'Soft & fluffy deep dish pan base' },
    { _id: 'b3', name: 'Cheese Burst Base', category: 'base', price: 200, stockQuantity: 30, description: 'Loaded with molten cheese inside the crust' },
    { _id: 'b4', name: 'Whole Wheat Crust', category: 'base', price: 150, stockQuantity: 40, description: 'Healthy 100% whole grain wheat base' },
    { _id: 'b5', name: 'Gluten-Free Crust', category: 'base', price: 180, stockQuantity: 25, description: 'Special artisan gluten-free dough' },
  ],
  sauces: [
    { _id: 's1', name: 'Classic Tomato Sauce', category: 'sauce', price: 30, stockQuantity: 60, description: 'Rich Italian sun-ripened tomato basil sauce' },
    { _id: 's2', name: 'Spicy Schezwan Sauce', category: 'sauce', price: 40, stockQuantity: 55, description: 'Fiery & zesty chilli garlic sauce' },
    { _id: 's3', name: 'Creamy Garlic Alfredo', category: 'sauce', price: 50, stockQuantity: 50, description: 'Rich white garlic butter cream sauce' },
    { _id: 's4', name: 'Smoky Barbecue Sauce', category: 'sauce', price: 45, stockQuantity: 40, description: 'Sweet & smoky hickory BBQ glaze' },
    { _id: 's5', name: 'Fresh Basil Pesto', category: 'sauce', price: 60, stockQuantity: 35, description: 'Aromatic basil & pine nut green pesto' },
  ],
  cheeses: [
    { _id: 'c1', name: '100% Mozzarella Cheese', category: 'cheese', price: 60, stockQuantity: 70, description: 'Classic stretchy Italian mozzarella' },
    { _id: 'c2', name: 'Aged Cheddar Cheese', category: 'cheese', price: 70, stockQuantity: 50, description: 'Sharp & tangy golden cheddar' },
    { _id: 'c3', name: 'Grated Parmesan Cheese', category: 'cheese', price: 80, stockQuantity: 45, description: 'Hard aged salty parmesan flakes' },
    { _id: 'c4', name: 'Plant-Based Vegan Cheese', category: 'cheese', price: 90, stockQuantity: 30, description: 'Dairy-free coconut oil based meltable cheese' },
  ],
  veggies: [
    { _id: 'v1', name: 'Crunchy Capsicum', category: 'veggie', price: 25, stockQuantity: 80 },
    { _id: 'v2', name: 'Red Onions', category: 'veggie', price: 20, stockQuantity: 90 },
    { _id: 'v3', name: 'Button Mushrooms', category: 'veggie', price: 35, stockQuantity: 65 },
    { _id: 'v4', name: 'Spicy Jalapenos', category: 'veggie', price: 30, stockQuantity: 70 },
    { _id: 'v5', name: 'Black Olives', category: 'veggie', price: 35, stockQuantity: 60 },
    { _id: 'v6', name: 'Sweet Golden Corn', category: 'veggie', price: 25, stockQuantity: 85 },
    { _id: 'v7', name: 'Juicy Tomatoes', category: 'veggie', price: 20, stockQuantity: 85 },
  ],
};

export default function PizzaBuilder({ isOpen, onClose, onProceedToOrder, API_BASE_URL }) {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Pizza Customization State
  const [selectedBase, setSelectedBase] = useState(DEFAULT_OPTIONS.bases[0]);
  const [selectedSauce, setSelectedSauce] = useState(DEFAULT_OPTIONS.sauces[0]);
  const [selectedCheese, setSelectedCheese] = useState(DEFAULT_OPTIONS.cheeses[0]);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/options`, { timeout: 4000 });
      if (res.data?.bases && res.data.bases.length > 0) {
        setOptions(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Using cached ingredient choices:', err.message);
      setLoading(false);
    }
  };

  const toggleVeggie = (veg) => {
    if (selectedVeggies.some((v) => v._id === veg._id)) {
      setSelectedVeggies(selectedVeggies.filter((v) => v._id !== veg._id));
    } else {
      setSelectedVeggies([...selectedVeggies, veg]);
    }
  };

  const calculateTotal = () => {
    const basePrice = selectedBase ? selectedBase.price : 0;
    const saucePrice = selectedSauce ? selectedSauce.price : 0;
    const cheesePrice = selectedCheese ? selectedCheese.price : 0;
    const veggiesPrice = selectedVeggies.reduce((sum, v) => sum + v.price, 0);
    return basePrice + saucePrice + cheesePrice + veggiesPrice;
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedBase) return alert('Please select a pizza base!');
    if (step === 2 && !selectedSauce) return alert('Please select a sauce!');
    if (step === 3 && !selectedCheese) return alert('Please select a cheese type!');
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Finished Builder -> Pass to checkout
      const customPizzaItem = {
        base: { name: selectedBase.name, price: selectedBase.price },
        sauce: { name: selectedSauce.name, price: selectedSauce.price },
        cheese: { name: selectedCheese.name, price: selectedCheese.price },
        veggies: selectedVeggies.map((v) => ({ name: v.name, price: v.price })),
        customName: `Custom: ${selectedBase.name} (${selectedSauce.name})`,
        totalPrice: calculateTotal(),
      };
      onProceedToOrder(customPizzaItem);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(15, 17, 26, 0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(247, 37, 79, 0.2)', color: '#F7254F' }}>
              <Sparkles style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>Custom Pizza Builder</h2>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Step {step} of 4 • Handcrafted in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Step Wizard Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-color)', backgroundColor: '#0A0C13' }}>
          {[
            { id: 1, title: '1. Crust Base (5)' },
            { id: 2, title: '2. Sauce (5)' },
            { id: 3, title: '3. Cheese' },
            { id: 4, title: '4. Veggies' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              style={{
                padding: '14px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                border: 'none',
                borderRight: s.id !== 4 ? '1px solid var(--border-color)' : 'none',
                background: step === s.id ? 'rgba(247, 37, 79, 0.15)' : 'transparent',
                color: step === s.id ? '#F7254F' : step > s.id ? '#10B981' : '#94A3B8',
                fontWeight: step === s.id ? 800 : 600,
                fontSize: '0.8rem',
                borderBottom: step === s.id ? '2px solid #F7254F' : '2px solid transparent',
                transition: 'var(--transition)',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
              Loading ingredient inventory...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', background: 'rgba(247, 37, 79, 0.15)', border: '1px solid rgba(247, 37, 79, 0.3)', borderRadius: '12px', color: '#F7254F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '20px', height: '20px' }} />
              <span>{error}</span>
            </div>
          ) : (
            <div>
              {/* STEP 1: PIZZA BASES */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Choose Your Crust Base</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select 1 of 5 signature artisan crust options:</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {options.bases.map((base) => {
                      const isSelected = selectedBase?._id === base._id;
                      const isOutOfStock = base.stockQuantity < 1;
                      return (
                        <div
                          key={base._id}
                          onClick={() => !isOutOfStock && setSelectedBase(base)}
                          style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #F7254F' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(247, 37, 79, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.4 : 1,
                            transition: 'var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{base.name}</h4>
                              <span style={{ fontWeight: 800, color: '#F7254F', fontSize: '0.95rem' }}>₹{base.price}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>{base.description}</p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span style={{ color: isOutOfStock ? '#EF4444' : '#64748B' }}>
                              {isOutOfStock ? 'Out of stock' : `Stock: ${base.stockQuantity}`}
                            </span>
                            {isSelected && (
                              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                <Check style={{ width: '12px', height: '12px' }} /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: SAUCES */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Choose Your Sauce Base</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select 1 of 5 freshly prepared gourmet sauces:</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {options.sauces.map((sauce) => {
                      const isSelected = selectedSauce?._id === sauce._id;
                      const isOutOfStock = sauce.stockQuantity < 1;
                      return (
                        <div
                          key={sauce._id}
                          onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                          style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #F7254F' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(247, 37, 79, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.4 : 1,
                            transition: 'var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{sauce.name}</h4>
                              <span style={{ fontWeight: 800, color: '#FF8A00', fontSize: '0.95rem' }}>₹{sauce.price}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>{sauce.description}</p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748B' }}>In Stock: {sauce.stockQuantity}</span>
                            {isSelected && (
                              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                <Check style={{ width: '12px', height: '12px' }} /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: CHEESE TYPE */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Choose Primary Cheese</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select 100% natural gourmet dairy or vegan cheese:</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {options.cheeses.map((cheese) => {
                      const isSelected = selectedCheese?._id === cheese._id;
                      const isOutOfStock = cheese.stockQuantity < 1;
                      return (
                        <div
                          key={cheese._id}
                          onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                          style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #F7254F' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(247, 37, 79, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.4 : 1,
                            transition: 'var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{cheese.name}</h4>
                              <span style={{ fontWeight: 800, color: '#FF8A00', fontSize: '0.95rem' }}>₹{cheese.price}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>{cheese.description}</p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span style={{ color: '#64748B' }}>In Stock: {cheese.stockQuantity}</span>
                            {isSelected && (
                              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                <Check style={{ width: '12px', height: '12px' }} /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: VEGETABLES */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Choose Vegetables & Toppings</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pick multiple fresh toppings (select all that you love):</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {options.veggies.map((veg) => {
                      const isSelected = selectedVeggies.some((v) => v._id === veg._id);
                      const isOutOfStock = veg.stockQuantity < 1;
                      return (
                        <div
                          key={veg._id}
                          onClick={() => !isOutOfStock && toggleVeggie(veg)}
                          style={{
                            padding: '14px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #10B981' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.4 : 1,
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{veg.name}</h4>
                            <span style={{ fontSize: '0.75rem', color: '#FF8A00', fontWeight: 700 }}>+₹{veg.price}</span>
                          </div>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                              border: isSelected ? '1px solid #10B981' : '1px solid var(--border-color)',
                              color: '#FFF',
                            }}
                          >
                            {isSelected && <Check style={{ width: '14px', height: '14px' }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary & Navigation */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(15, 17, 26, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', fontWeight: 600 }}>Calculated Custom Price</span>
            <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{calculateTotal()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
              </button>
            )}
            <button
              onClick={handleNextStep}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.85rem' }}
            >
              {step === 4 ? 'Review & Checkout' : 'Next Step'}
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

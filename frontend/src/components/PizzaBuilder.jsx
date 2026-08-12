import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, AlertCircle, Pizza, Flame } from 'lucide-react';

export default function PizzaBuilder({ isOpen, onClose, onProceedToOrder, API_BASE_URL }) {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState({ bases: [], sauces: [], cheeses: [], veggies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Pizza Customization State
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/options`);
      setOptions(res.data);

      // Auto select default options if available
      if (res.data.bases?.length > 0 && !selectedBase) setSelectedBase(res.data.bases[0]);
      if (res.data.sauces?.length > 0 && !selectedSauce) setSelectedSauce(res.data.sauces[0]);
      if (res.data.cheeses?.length > 0 && !selectedCheese) setSelectedCheese(res.data.cheeses[0]);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load pizza options', err);
      setError('Failed to load ingredient choices. Please try again.');
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

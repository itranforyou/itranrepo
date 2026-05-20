'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

// Robust price parser — handles 'Rs. 1,499', '₹1499', '$185', raw numbers, etc.
const parsePrice = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const clean = val.toString()
    .replace(/Rs\.?/gi, '')
    .replace(/₹/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

// Format a number as Indian Rupees: ₹1,499
const fmtINR = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function Cart() {
  const router = useRouter();
  const { cart, setCart, packagingOptions } = useAppContext();
  const [editingGiftIndex, setEditingGiftIndex] = useState(null);
  const [editGiftState, setEditGiftState] = useState(null);

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, (newCart[index].quantity || 1) + delta);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const startEditingGift = (index, currentOptions) => {
    setEditingGiftIndex(index);
    setEditGiftState({
      isGift: currentOptions?.isGift || false,
      message: currentOptions?.message || '',
      packaging: currentOptions?.packaging || null,
      selectedNote: currentOptions?.selectedNote || ''
    });
  };

  const saveGiftOptions = (index) => {
    const newCart = [...cart];
    newCart[index].giftOptions = editGiftState;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setEditingGiftIndex(null);
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = parsePrice(item.price);
    const packagingPrice = parsePrice(item.giftOptions?.packaging?.price);
    return acc + ((price + packagingPrice) * (item.quantity || 1));
  }, 0);

  const savings = cart.reduce((acc, item) => {
    const costPrice = parsePrice(item.costPrice);
    const sellPrice = parsePrice(item.price);
    if (costPrice > sellPrice) {
      return acc + ((costPrice - sellPrice) * (item.quantity || 1));
    }
    return acc;
  }, 0);

  if (cart.length === 0) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', paddingBottom: '150px' }}>
        <Reveal>
          <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Your Bag is Empty</h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem' }}>The silence is absolute. Fill it with a signature scent.</p>
          <Link href="/all-products" className="btn-primary label-caps">Continue Shopping</Link>
        </Reveal>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '8rem', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <div className="container">
        <Reveal>
          <h1 style={{ fontSize: '3rem', marginBottom: '4rem' }}>Your Shopping Bag</h1>
        </Reveal>

        <div className="cart-grid">
          <div>
            <div className="cart-header-labels label-caps">
              <div style={{ fontSize: '0.7rem' }}>Product</div>
              <div style={{ fontSize: '0.7rem' }}>Price</div>
              <div style={{ fontSize: '0.7rem', textAlign: 'center' }}>Quantity</div>
              <div style={{ fontSize: '0.7rem', textAlign: 'right' }}>Total</div>
              <div style={{ fontSize: '0.7rem' }}></div>
            </div>

            {cart.map((item, index) => {
              const basePrice = parsePrice(item.price);
              const packPrice = parsePrice(item.giftOptions?.packaging?.price);
              const itemTotal = (basePrice + packPrice) * (item.quantity || 1);
              const isEditing = editingGiftIndex === index;

              return (
                <div key={index} className="cart-item-wrapper" style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="cart-item-row">
                    <div className="cart-item-info">
                      <div className="cart-item-image">
                        <img src={item.image || item.images?.[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="cart-item-details">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                        <div className="label-caps category" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{item.category}</div>
                        
                        {item.giftOptions?.selectedNote && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span className="material-icons" style={{ fontSize: '0.9rem' }}>spa</span>
                            <span>{item.giftOptions.selectedNote}</span>
                          </div>
                        )}

                        {!isEditing && (
                          <div style={{ marginTop: '1rem' }}>
                            {item.giftOptions?.isGift ? (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                                  <span className="material-icons" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: '4px' }}>card_giftcard</span>
                                  Gift: {item.giftOptions.packaging ? `${item.giftOptions.packaging.name} (+${fmtINR(item.giftOptions.packaging.price)})` : 'Standard'}
                                </div>
                                {item.giftOptions.message && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '2px', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    "{item.giftOptions.message}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button onClick={() => startEditingGift(index, item.giftOptions)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', border: 'none', background: 'none', cursor: 'pointer', color: '#666', marginTop: '0.5rem' }} className="label-caps">
                                <span className="material-icons" style={{ fontSize: '0.9rem' }}>card_giftcard</span> Add Gift Packaging
                              </button>
                            )}
                            {item.giftOptions?.isGift && (
                              <button onClick={() => startEditingGift(index, item.giftOptions)} style={{ fontSize: '0.65rem', border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#666', marginTop: '6px' }}>
                                Edit Gift Options
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="cart-item-price-unit" style={{ fontSize: '0.95rem' }}>
                      <div>{fmtINR(basePrice)}</div>
                      {packPrice > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>+ {fmtINR(packPrice)} (Gift)</div>}
                    </div>
                    
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(index, -1)}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(index, 1)}>+</button>
                    </div>

                    <div className="cart-item-total-price">
                      {fmtINR(itemTotal)}
                    </div>

                    <div className="cart-item-delete">
                      <button 
                        onClick={() => removeItem(index)} 
                        aria-label="Remove item"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#991b1b'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#ccc'}
                      >
                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete_outline</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Form for Gift Packaging */}
                  {isEditing && (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#faf9f7', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input 
                          type="checkbox" 
                          id={`isGift-${index}`}
                          checked={editGiftState.isGift} 
                          onChange={(e) => setEditGiftState({...editGiftState, isGift: e.target.checked, packaging: e.target.checked ? editGiftState.packaging : null})} 
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor={`isGift-${index}`} className="label-caps" style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>This is a Gift</label>
                      </div>

                      {editGiftState.isGift && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                          <div className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Select Packaging</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {packagingOptions.map((opt) => (
                              <div 
                                key={opt.id}
                                onClick={() => setEditGiftState({...editGiftState, packaging: editGiftState.packaging?.id === opt.id ? null : opt})}
                                style={{ 
                                  padding: '0.75rem', 
                                  border: editGiftState.packaging?.id === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                  background: editGiftState.packaging?.id === opt.id ? 'rgba(141, 75, 0, 0.03)' : '#fff',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.2s ease',
                                  position: 'relative'
                                }}
                              >
                                {opt.image && <img src={opt.image} alt="" style={{ width: '100%', height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />}
                                <div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.25rem' }}>{opt.name}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>+{fmtINR(opt.price)}</div>
                              </div>
                            ))}
                          </div>

                          <div className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Gift Message</div>
                          <textarea 
                            placeholder="Write a silent message..."
                            value={editGiftState.message}
                            onChange={(e) => setEditGiftState({...editGiftState, message: e.target.value})}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: '#fff', resize: 'none', height: '60px', fontSize: '0.85rem' }}
                          />
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingGiftIndex(null)} className="label-caps" style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.65rem' }}>Cancel</button>
                        <button onClick={() => saveGiftOptions(index)} className="btn-primary label-caps" style={{ padding: '0.5rem 1rem', fontSize: '0.65rem' }}>Save Options</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: '#faf9f7', padding: '2.5rem', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span>{fmtINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Shipping</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>CALCULATED AT NEXT STEP</span>
            </div>

            {savings > 0 && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px dashed #166534', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>YOU SAVED</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>{fmtINR(savings)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Estimated Total</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, display: 'block' }}>{fmtINR(subtotal)}</span>
              </div>
            </div>
            <button className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>Checkout Now</button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/all-products" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Or Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

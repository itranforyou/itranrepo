'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

export default function Cart() {
  const router = useRouter();
  const { cart, setCart } = useAppContext();

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

  const subtotal = cart.reduce((acc, item) => {
    const rawPrice = item.price ? String(item.price).replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim() : '0';
    const price = parseFloat(rawPrice) || 0;
    const packagingPrice = item.giftOptions?.packaging?.price || 0;
    return acc + ((price + packagingPrice) * (item.quantity || 1));
  }, 0);

  const savings = cart.reduce((acc, item) => {
    const costPrice = item.costPrice ? parseFloat(String(item.costPrice).replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim()) : 0;
    const sellPrice = item.price ? parseFloat(String(item.price).replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim()) : 0;
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

        <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem', alignItems: 'start' }}>
          <div>
            <div className="cart-header-labels label-caps" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.7rem' }}>Product</div>
              <div style={{ fontSize: '0.7rem' }}>Price</div>
              <div style={{ fontSize: '0.7rem', textAlign: 'center' }}>Quantity</div>
              <div style={{ fontSize: '0.7rem', textAlign: 'right' }}>Total</div>
              <div style={{ fontSize: '0.7rem' }}></div>
            </div>

            {cart.map((item, index) => {
              const basePrice = parseFloat(String(item.price || '0').replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim());
              const packPrice = item.giftOptions?.packaging?.price || 0;
              const itemTotal = (basePrice + packPrice) * (item.quantity || 1);
              return (
                <div key={index} className="cart-item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '2rem', alignItems: 'center', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="cart-item-info" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div className="cart-item-image" style={{ width: '80px', height: '100px', flexShrink: 0 }}>
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
                    </div>
                  </div>

                  <div className="cart-item-price-unit" style={{ fontSize: '0.95rem' }}>{item.price}</div>
                  
                  <div className="cart-item-qty" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', width: 'fit-content', margin: '0 auto' }}>
                    <button onClick={() => updateQuantity(index, -1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 0.5rem', fontSize: '0.9rem', minWidth: '25px', textAlign: 'center' }}>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(index, 1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                  </div>

                  <div className="cart-item-total-price" style={{ textAlign: 'right', fontWeight: 600, fontSize: '1rem' }}>
                    Rs. {itemTotal.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              );
            })}
          </div>

          <div style={{ background: '#faf9f7', padding: '2.5rem', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Shipping</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>CALCULATED AT NEXT STEP</span>
            </div>

            {savings > 0 && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px dashed #166534', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>YOU SAVED</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>Rs. {savings.toFixed(2)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Estimated Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Rs. {subtotal.toFixed(2)}</span>
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

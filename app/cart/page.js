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
    return acc + (price * (item.quantity || 1));
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
            <div className="cart-header-labels label-caps" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.7rem' }}>Product</div>
              <div style={{ fontSize: '0.7rem' }}>Price</div>
              <div style={{ fontSize: '0.7rem' }}>Quantity</div>
              <div style={{ fontSize: '0.7rem' }}>Total</div>
            </div>

            {cart.map((item, index) => {
              const itemTotal = parseFloat(String(item.price || '0').replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim()) * (item.quantity || 1);
              return (
                <div key={index} className="cart-item-row">
                  <div className="cart-item-info">
                    <div className="cart-item-image">
                      <img src={item.image || item.images?.[0]} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <div className="label-caps category">{item.category}</div>
                      <button onClick={() => removeItem(index)} className="remove-btn">REMOVE</button>
                    </div>
                  </div>
                  <div className="cart-item-meta">
                    <div className="cart-item-price-unit">{item.price}</div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(index, -1)}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(index, 1)}>+</button>
                    </div>
                    <div className="cart-item-total-price">
                      Rs. {itemTotal.toFixed(2)}
                    </div>
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

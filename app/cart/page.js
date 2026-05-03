'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

export default function Cart() {
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
    <div style={{ paddingTop: '120px', paddingBottom: '8rem' }}>
      <div className="container">
        <Reveal>
          <h1 style={{ fontSize: '3rem', marginBottom: '4rem' }}>Your Shopping Bag</h1>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }} className="label-caps">
              <div style={{ fontSize: '0.7rem' }}>Product</div>
              <div style={{ fontSize: '0.7rem' }}>Price</div>
              <div style={{ fontSize: '0.7rem' }}>Quantity</div>
              <div style={{ fontSize: '0.7rem' }}>Total</div>
            </div>

            {cart.map((item, index) => {
              const itemTotal = parseFloat(String(item.price || '0').replace('$', '').replace('Rs.', '').replace('Rs. ', '').trim()) * (item.quantity || 1);
              return (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr', gap: '2rem', alignItems: 'center', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '100px', flexShrink: 0 }}>
                      <img src={item.image || item.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                      <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{item.category}</div>
                      <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', marginTop: '0.75rem', cursor: 'pointer', padding: 0 }}>REMOVE</button>
                    </div>
                  </div>
                  <div style={{ color: 'var(--muted-foreground)' }}>{item.price}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => updateQuantity(index, -1)} style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(index, 1)} style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    Rs. {itemTotal.toFixed(2)}
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

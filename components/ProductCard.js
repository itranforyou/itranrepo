'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart, wishlist, toggleWishlist } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const ref = useRef(null);

  const isInWishlist = wishlist.some(item => item.id === product.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    // Automatically select first fragrance note as it's now mandatory
    const defaultNote = product.notes && product.notes.length > 0 ? product.notes[0].name : null;
    const options = defaultNote ? { selectedNote: defaultNote } : null;
    
    addToCart(product, options);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  let discountPercentage = null;
  if (product.costPrice) {
    const cPrice = parseFloat(product.costPrice.toString().replace(/[^0-9.]/g, ''));
    const sPrice = parseFloat((product.price || '').toString().replace(/[^0-9.]/g, ''));
    if (!isNaN(cPrice) && !isNaN(sPrice) && cPrice > sPrice) {
      discountPercentage = Math.round(((cPrice - sPrice) / cPrice) * 100);
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Link 
        href={`/product/${product.id}`}
        ref={ref}
        className={`reveal-up product-card ${isActive ? 'active' : ''}`} 
        style={{ display: 'block', cursor: 'pointer', transitionDelay: `${delay}s`, textDecoration: 'none', color: 'inherit' }}
      >
        <div className="img-reveal-wrapper" style={{ aspectRatio: '4/5', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <img 
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} 
            alt={product.name} 
            className={`img-reveal ${isLoaded ? 'loaded' : ''}`}
            onLoad={() => setIsLoaded(true)}
          />
          
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 2 }}>
            {product.inStock === false && (
              <div style={{ background: '#7f1d1d', color: '#ffffff', fontSize: '0.6rem', letterSpacing: '0.15em', padding: '0.35rem 0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                SOLD OUT
              </div>
            )}
            {product.isBestSeller && (
              <div style={{ background: 'var(--foreground)', color: 'var(--background)', fontSize: '0.6rem', letterSpacing: '0.15em', padding: '0.35rem 0.75rem', textTransform: 'uppercase' }}>
                #1 Best Seller
              </div>
            )}
            {discountPercentage > 0 && (
              <div style={{ background: '#991b1b', color: '#ffffff', fontSize: '0.6rem', letterSpacing: '0.15em', padding: '0.35rem 0.75rem', textTransform: 'uppercase' }}>
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <button 
            onClick={handleWishlist}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              cursor: 'pointer',
              zIndex: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-icons" style={{ fontSize: '1.2rem', color: isInWishlist ? '#b91c1c' : '#888' }}>
              {isInWishlist ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          
          {/* Quick Add Button */}
          {product.inStock !== false && (
            <button 
              onClick={handleAddToCart}
              className="quick-add-btn"
              style={{ 
                position: 'absolute', 
                bottom: '1rem', 
                right: '1rem', 
                background: '#fff', 
                border: 'none', 
                padding: '0.75rem', 
                borderRadius: '50%', 
                display: 'flex', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 3,
                cursor: 'pointer'
              }}
            >
              <span className="material-icons" style={{ fontSize: '1.2rem', color: '#000' }}>shopping_bag</span>
            </button>
          )}
        </div>
        <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.2rem' }}>
              {product.category === 'Gift'
                ? `GIFT FOR ${(product.giftFor === 'Him' ? 'MEN' : product.giftFor === 'Her' ? 'WOMEN' : product.giftFor || 'UNISEX').toUpperCase()}`
                : product.category?.replace(' Collection', '')}
            </div>
            <h3 style={{ 
              fontSize: '1rem', 
              marginBottom: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5rem',
              lineHeight: 1.25
            }}>
              {product.name}
            </h3>
            {product.category !== 'Gift' && product.subName && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                {product.subName}
              </div>
            )}
            {product.category !== 'Gift' && product.inspiredBy && (
              <div style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontStyle: 'italic', marginTop: '0.15rem', letterSpacing: '0.02em' }}>
                Inspired by {product.inspiredBy}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            {product.costPrice ? (
              <>
                <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.95rem' }}>{product.price}</span>
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 300, textDecoration: 'line-through', fontSize: '0.75rem' }}>{product.costPrice}</span>
              </>
            ) : (
              <span style={{ color: '#8B4513', fontWeight: 600, fontSize: '0.95rem' }}>{product.price}</span>
            )}
            {product.category !== 'Gift' && product.size && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginLeft: 'auto', borderLeft: '1px solid #eee', paddingLeft: '0.6rem' }} className="label-caps">
                {['Incense Sticks', 'Dhoop Sticks', 'Sandali', 'Mohak'].includes(product.category)
                  ? `Sets of ${product.size}` 
                  : (product.size.toString().toLowerCase().endsWith('ml') ? product.size : `${product.size}ml`)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

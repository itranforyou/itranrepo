'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { isVideoUrl } from '@/lib/products';

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart, wishlist, toggleWishlist } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const ref = useRef(null);
  const imgRef = useRef(null);

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

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [product.images]);

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
          {isVideoUrl(product.images?.[0]) ? (
            <video
              src={product.images[0]}
              className={`img-reveal ${isLoaded ? 'loaded' : ''}`}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setIsLoaded(true)}
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            />
          ) : (
            <img 
              ref={imgRef}
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} 
              alt={product.name} 
              className={`img-reveal ${isLoaded ? 'loaded' : ''}`}
              onLoad={() => setIsLoaded(true)}
            />
          )}
          
          <div className="product-card-tags">
            {product.inStock === false && (
              <div className="product-tag tag-sold-out">
                SOLD OUT
              </div>
            )}
            {product.isBestSeller && (
              <div className="product-tag tag-best-seller">
                #1 Best Seller
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

          {/* Discount Tag at the bottom-left of the image wrapper */}
          {discountPercentage > 0 && (
            <div className="product-tag tag-discount tag-discount-bottom">
              {discountPercentage}% OFF
            </div>
          )}
          
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
                ? `GIFT SET OF ${product.giftSize || product.giftProducts?.length || 1}`
                : product.category?.replace(' Collection', '')}
            </div>
            <h3 style={{ 
              fontSize: '1rem', 
              marginBottom: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.25
            }}>
              {product.name}
            </h3>
            {product.category === 'Gift' && Array.isArray(product.giftProducts) && product.giftProducts.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.1rem', lineHeight: 1.3, fontStyle: 'italic' }}>
                Contains: {product.giftProducts.map(gp => gp.name).join(', ')}
              </div>
            )}
            {product.category !== 'Gift' && product.inspiredBy && (
              <div style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontStyle: 'italic', marginTop: '0.1rem', letterSpacing: '0.02em' }}>
                Inspired by {product.inspiredBy}
              </div>
            )}
            {product.category !== 'Gift' && product.subName && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.1rem', lineHeight: 1.3 }}>
                {product.subName}
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

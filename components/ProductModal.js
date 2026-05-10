'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart, products } = useAppContext();
  const [imageIndex, setImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const modalContainerRef = useRef(null);

  useEffect(() => {
    if (selectedProduct) {
      setImageIndex(0);
      setActiveAccordion(0);
      setQuantity(1);
      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTop = 0;
      }
      document.body.style.overflow = 'hidden';
      
      // Only start interval if there are images
      let interval;
      if (selectedProduct.images && selectedProduct.images.length > 1) {
        interval = setInterval(() => {
          setImageIndex(prev => (prev + 1) % selectedProduct.images.length);
        }, 4000);
      }
      
      return () => {
        if (interval) clearInterval(interval);
        document.body.style.overflow = '';
      };
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const recommendations = products.filter(
    p => p.category === selectedProduct.category && p.id !== selectedProduct.id
  ).slice(0, 4);

  return (
    <div className="product-modal active">
      <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}></div>
      <div className="product-modal-container" ref={modalContainerRef}>
        <button className="product-modal-close" onClick={() => setSelectedProduct(null)}>
          <span className="material-icons">close</span>
        </button>
        
        <div className="product-modal-main">
          <div className="product-modal-gallery">
            <div className="modal-gallery-container">
              <img 
                src={selectedProduct.images?.[imageIndex] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} 
                alt={selectedProduct.name} 
                id="modal-img" 
                style={{ opacity: 1, transition: 'opacity 0.3s ease' }} 
              />
              <button className="gallery-nav prev" onClick={handlePrev}>
                <span className="material-icons">chevron_left</span>
              </button>
              <button className="gallery-nav next" onClick={handleNext}>
                <span className="material-icons">chevron_right</span>
              </button>
              <div className="gallery-dots">
                {selectedProduct.images.map((_, i) => (
                  <div 
                    key={i} 
                    className={`dot ${i === imageIndex ? 'active' : ''}`}
                    onClick={() => setImageIndex(i)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="product-modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
                {selectedProduct.category}
              </div>
              {selectedProduct.isBestSeller && (
                <div style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: 'var(--foreground)', color: 'var(--background)', letterSpacing: '0.1em' }}>
                  BEST SELLER
                </div>
              )}
            </div>
            <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              {selectedProduct.name}
            </h2>
            <div style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--muted-foreground)', fontWeight: 300 }}>
              {selectedProduct.price}
            </div>
            
            <p style={{ lineHeight: 1.8, marginBottom: '3rem', color: 'var(--muted-foreground)', fontSize: '1.05rem' }}>
              {selectedProduct.desc}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', background: '#fff' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >-</button>
                <span style={{ padding: '0 0.5rem', fontSize: '0.9rem', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >+</button>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const defaultNote = selectedProduct.notes && selectedProduct.notes.length > 0 ? selectedProduct.notes[0].name : null;
                  const options = defaultNote ? { selectedNote: defaultNote } : null;
                  addToCart(selectedProduct, options, quantity);
                }}
                style={{ flex: 1, padding: '1.25rem' }}
              >
                ADD TO CART
              </button>
            </div>
            
            <div className="product-accordion">
              <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`}>
                <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 0 ? -1 : 0)}>
                  Product Information
                  <span className="material-icons">add</span>
                </button>
                <div className="accordion-content">
                  <p>{selectedProduct.desc}</p>
                  <ul style={{ marginTop: '1rem', listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--muted-foreground)' }}>
                    <li>Hand-poured in small batches</li>
                    <li>Long-lasting concentration (Eau de Parfum)</li>
                  </ul>
                </div>
              </div>
              <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
                <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 1 ? -1 : 1)}>
                  How to Wear
                  <span className="material-icons">add</span>
                </button>
                <div className="accordion-content">
                  <p>Apply to pulse points—wrists, neck, and behind the ears.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-extra-section">
          <div className="container" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
              Customer Experience
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="review-card" style={{ background: '#fff', padding: '2rem', border: '1px solid var(--border)' }}>
                <div className="review-stars" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons" style={{ fontSize: '1.2rem' }}>star</span>
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--foreground)' }}>
                  &quot;The most evocative scent I&apos;ve ever owned.&quot;
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aria R.</div>
              </div>
              <div className="review-card" style={{ background: '#fff', padding: '2rem', border: '1px solid var(--border)' }}>
                <div className="review-stars" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="material-icons" style={{ fontSize: '1.2rem' }}>star</span>
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--foreground)' }}>
                  &quot;Beautifully complex. The dry down is incredible.&quot;
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Julian K.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-extra-section">
          <div className="container" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
              You May Also Savor
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto', justifyContent: 'center' }}>
              {recommendations.map(p => (
                <div key={p.id} className="rec-item" style={{ textAlign: 'center', cursor: 'pointer', maxWidth: '220px', margin: '0 auto' }} onClick={() => setSelectedProduct(p)}>
                  <div style={{ aspectRatio: '1', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </h4>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

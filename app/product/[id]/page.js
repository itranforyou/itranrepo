'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Reveal from '@/components/Reveal';
import Link from 'next/link';

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, loading } = useAppContext();
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(0);

  useEffect(() => {
    if (products.length > 0) {
      const p = products.find(p => p.id === id);
      setProduct(p);
    }
  }, [id, products]);

  if (loading || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="label-caps">Loading Scent...</p>
      </div>
    );
  }

  const recommendations = products.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const fallbackImg = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000';
  const mainImage = product.images?.[imageIndex] || product.image || fallbackImg;

  let discountPercentage = null;
  if (product.costPrice) {
    const cPrice = parseFloat(product.costPrice.toString().replace(/[^0-9.]/g, ''));
    const sPrice = parseFloat((product.price || '').toString().replace(/[^0-9.]/g, ''));
    if (!isNaN(cPrice) && !isNaN(sPrice) && cPrice > sPrice) {
      discountPercentage = Math.round(((cPrice - sPrice) / cPrice) * 100);
    }
  }

  return (
    <div style={{ paddingTop: '100px', background: 'var(--background)', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back_ios_new</span>
        </button>
      </div>
      <div className="container" style={{ maxWidth: '1200px', padding: '4rem 2rem' }}>
        
        <div className="product-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
          
          {/* Gallery Section */}
          <div className="product-gallery-sticky" style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
            <Reveal>
              <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f5f5f5', overflow: 'hidden' }}>
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {product.images?.length > 1 && (
                  <>
                    <button 
                      onClick={() => setImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', padding: '0.5rem', cursor: 'pointer', borderRadius: '50%', display: 'flex' }}
                    >
                      <span className="material-icons">chevron_left</span>
                    </button>
                    <button 
                      onClick={() => setImageIndex((prev) => (prev + 1) % product.images.length)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', padding: '0.5rem', cursor: 'pointer', borderRadius: '50%', display: 'flex' }}
                    >
                      <span className="material-icons">chevron_right</span>
                    </button>
                  </>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images?.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setImageIndex(i)}
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      flexShrink: 0, 
                      cursor: 'pointer', 
                      border: i === imageIndex ? '2px solid #000' : '1px solid var(--border)',
                      opacity: i === imageIndex ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Content Section */}
          <div>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
                  {product.category}
                </div>
                {product.isBestSeller && (
                  <div style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: 'var(--foreground)', color: 'var(--background)', letterSpacing: '0.1em' }}>
                    BEST SELLER
                  </div>
                )}
              </div>
              
              <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', lineHeight: 1.1 }}>
                {product.name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '1.75rem', color: product.costPrice ? '#991b1b' : 'var(--muted-foreground)', fontWeight: product.costPrice ? 600 : 300 }}>
                  {product.price}
                </div>
                {product.costPrice && (
                  <div style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', textDecoration: 'line-through', fontWeight: 300 }}>
                    {product.costPrice}
                  </div>
                )}
                {discountPercentage && (
                  <div style={{ background: '#991b1b', color: '#ffffff', fontSize: '0.8rem', letterSpacing: '0.15em', padding: '0.4rem 0.8rem', textTransform: 'uppercase' }}>
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>

              <p style={{ lineHeight: 1.9, marginBottom: '3rem', color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                {product.desc}
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => addToCart(product)}
                  style={{ flex: 1, padding: '1.5rem', fontSize: '0.8rem' }}
                >
                  ADD TO CART
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  style={{ 
                    width: '64px', 
                    background: 'none', 
                    border: '1px solid var(--border)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <span className="material-icons" style={{ color: wishlist.some(item => item.id === product.id) ? '#b91c1c' : '#000' }}>
                    {wishlist.some(item => item.id === product.id) ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>

              <div className="product-accordion">
                <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border)' }}>
                  <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 0 ? -1 : 0)} style={{ padding: '1.5rem 0' }}>
                    Product Information
                    <span className="material-icons" style={{ transition: 'transform 0.3s ease', transform: activeAccordion === 0 ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '1.4rem' }}>add</span>
                  </button>
                  <div className="accordion-content">
                    <p>{product.desc}</p>
                    <ul style={{ marginTop: '1rem', listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--muted-foreground)' }}>
                      <li>Hand-poured in small batches</li>
                      <li>Long-lasting concentration (Eau de Parfum)</li>
                      <li>Ethically sourced natural essences</li>
                    </ul>
                  </div>
                </div>
                <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 1 ? -1 : 1)} style={{ padding: '1.5rem 0' }}>
                    How to Wear
                    <span className="material-icons" style={{ transition: 'transform 0.3s ease', transform: activeAccordion === 1 ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '1.4rem' }}>add</span>
                  </button>
                  <div className="accordion-content">
                    <p>Apply to pulse points—wrists, neck, and behind the ears. For a longer-lasting trail, mist over clothing or hair.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Experience Section */}
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Customer Experience</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <Reveal className="review-card" style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
              <div className="review-stars" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-icons" style={{ fontSize: '1.2rem' }}>star</span>
                ))}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--foreground)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                &quot;The most evocative scent I&apos;ve ever owned. It captures a sense of timelessness.&quot;
              </p>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Aria R.</div>
            </Reveal>
            <Reveal className="review-card" delay={0.1} style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
              <div className="review-stars" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-icons" style={{ fontSize: '1.2rem' }}>star</span>
                ))}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--foreground)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                &quot;Beautifully complex. The dry down is incredible and lasts for hours.&quot;
              </p>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Julian K.</div>
            </Reveal>
          </div>
        </section>

        {/* Recommendations */}
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '6rem' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>You May Also Savor</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4rem', justifyContent: 'center' }}>
            {recommendations.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: '1.5rem', background: '#f5f5f5' }}>
                    <img src={p.images?.[0] || p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: p.costPrice ? '#991b1b' : 'var(--muted-foreground)', fontWeight: p.costPrice ? 600 : 300 }}>{p.price}</span>
                    {p.costPrice && <span style={{ color: 'var(--muted-foreground)', textDecoration: 'line-through', fontSize: '0.8rem' }}>{p.costPrice}</span>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .product-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .product-gallery-sticky {
            position: static !important;
            top: auto !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

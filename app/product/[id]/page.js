'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { isVideoUrl } from '@/lib/products';

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, loading, isLoggedIn, userAvatar, user } = useAppContext();
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });

  const [selectedNote, setSelectedNote] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const toggleNoteSelection = (noteName) => {
    // Note is mandatory, so clicking selected note doesn't deselect
    setSelectedNote(noteName);
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      setReviewForm(prev => ({ ...prev, name: user.displayName || user.email.split('@')[0] }));
    }
  }, [isLoggedIn, user]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const p = products.find(p => p.id === id);
      setProduct(p);
      // Auto-select first note if available
      if (p && p.notes && Array.isArray(p.notes) && p.notes.length > 0) {
        setSelectedNote(p.notes[0].name);
      }
    }
  }, [id, products]);

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid needing a composite index in Firebase
      reviewsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setReviews(reviewsData);
    });
    return () => unsubscribe();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!reviewForm.name || !reviewForm.comment) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid, // Track ownership for cleanup
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
        avatar: isLoggedIn ? userAvatar : null
      });
      setReviewForm({ name: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error adding review: ", error);
    }
    setIsSubmittingReview(false);
  };

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
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <div className="container" style={{ maxWidth: '1200px', padding: '4rem 2rem' }}>
        
        <div className="product-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
          
          {/* Gallery Section */}
          <div className="product-gallery-sticky" style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
            <Reveal>
              <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f5f5f5', overflow: 'hidden' }}>
                {isVideoUrl(mainImage) ? (
                  <video 
                    src={mainImage}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                
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
                      opacity: i === imageIndex ? 1 : 0.6,
                      position: 'relative'
                    }}
                  >
                    {isVideoUrl(img) ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
                        <video src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                          <span className="material-icons" style={{ color: '#fff', fontSize: '1.5rem' }}>play_circle</span>
                        </div>
                      </div>
                    ) : (
                      <img src={img || fallbackImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Content Section */}
          <div>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
                  {product.category === 'Gift'
                    ? `GIFT SET OF ${product.giftSize || product.giftProducts?.length || 1}`
                    : product.category?.replace(' Collection', '')}
                </div>
                {product.isBestSeller && (
                  <div style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: 'var(--foreground)', color: 'var(--background)', letterSpacing: '0.1em' }}>
                    BEST SELLER
                  </div>
                )}
                {product.inStock === false ? (
                  <div style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: '#7f1d1d', color: '#fff', letterSpacing: '0.1em', fontWeight: 600 }} className="label-caps">
                    OUT OF STOCK
                  </div>
                ) : (
                  <div style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: '#f0fdf4', color: '#15803d', letterSpacing: '0.1em', fontWeight: 600 }} className="label-caps">
                    IN STOCK
                  </div>
                )}
              </div>
              
              <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', lineHeight: 1.1 }}>
                {product.name}
              </h1>

              {product.category !== 'Gift' && product.subName && (
                <div style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  {product.subName}
                </div>
              )}
              {product.category !== 'Gift' && product.inspiredBy && (
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                  Inspired by <strong>{product.inspiredBy}</strong>
                </div>
              )}
              
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
                {product.category !== 'Gift' && product.size && (
                  <div style={{ marginLeft: 'auto', border: '1px solid var(--border)', padding: '0.4rem 1rem', fontSize: '0.75rem' }} className="label-caps">
                    {['Incense Sticks', 'Dhoop Sticks'].includes(product.category)
                      ? `Sets of ${product.size}` 
                      : (product.size.toString().toLowerCase().endsWith('ml') ? product.size : `${product.size}ml`)}
                  </div>
                )}
                {product.category === 'Gift' && (
                  <div style={{ marginLeft: 'auto', border: '1px solid var(--border)', padding: '0.4rem 1rem', fontSize: '0.75rem' }} className="label-caps">
                    Set of {product.giftSize || product.giftProducts?.length || 1}
                  </div>
                )}
              </div>

              <p style={{ lineHeight: 1.9, marginBottom: '2rem', color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                {product.desc}
              </p>

              {product.category === 'Gift' && Array.isArray(product.giftProducts) && product.giftProducts.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <div className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
                    INCLUDED IN THIS SET ({product.giftSize || product.giftProducts.length} ITTARS)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1.25rem' }}>
                    {product.giftProducts.map((item, idx) => (
                      <Link 
                        key={item.id || idx} 
                        href={`/product/${item.id}`}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', alignItems: 'center' }}
                      >
                        <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#f5f5f5', border: '1px solid var(--border)', borderRadius: '4px' }}>
                          <img 
                            src={item.image || 'https://via.placeholder.com/150'} 
                            alt={item.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.3, textAlign: 'center', color: 'var(--foreground)' }}>
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {product.category !== 'Gift' && product.notes && Array.isArray(product.notes) && product.notes.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <div className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>Fragrance Notes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {product.notes.map((note, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.5rem 1.25rem',
                          border: '1px solid var(--border)',
                          background: 'rgba(212, 175, 55, 0.04)',
                          borderRadius: '30px',
                          fontSize: '0.7rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          color: 'var(--foreground)',
                          userSelect: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
                        {note.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}



               <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', background: '#fff', opacity: product.inStock === false ? 0.5 : 1 }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.inStock === false}
                    style={{ padding: '0 1rem', background: 'none', border: 'none', cursor: product.inStock === false ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}
                  >-</button>
                  <span style={{ padding: '0 1rem', fontSize: '1rem', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.inStock === false}
                    style={{ padding: '0 1rem', background: 'none', border: 'none', cursor: product.inStock === false ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}
                  >+</button>
                </div>
                <button 
                  className="btn-primary" 
                  disabled={product.inStock === false}
                  onClick={() => {
                    if (product.inStock === false) return;

                    const extraData = {
                      selectedNote: selectedNote
                    };
                    addToCart(product, extraData, quantity);
                  }}
                  style={{ flex: 1, padding: '1.5rem', fontSize: '0.8rem', opacity: product.inStock === false ? 0.6 : 1, cursor: product.inStock === false ? 'not-allowed' : 'pointer', background: product.inStock === false ? '#7f1d1d' : 'var(--foreground)' }}
                >
                  {product.inStock === false ? 'OUT OF STOCK' : 'ADD TO CART'}
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
                <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border)' }}>
                  <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 1 ? -1 : 1)} style={{ padding: '1.5rem 0' }}>
                    How to Wear
                    <span className="material-icons" style={{ transition: 'transform 0.3s ease', transform: activeAccordion === 1 ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '1.4rem' }}>add</span>
                  </button>
                  <div className="accordion-content">
                    <p style={{ marginBottom: '0.75rem' }}>As a highly concentrated perfume oil, we recommend applying it primarily onto clothing (cuffs, collar, or inner layers) for a magnificent and long-lasting trail.</p>
                    <p style={{ fontSize: '0.85rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1rem' }}>warning</span>
                      Safety: Avoid using directly on highly sensitive body areas. We advise performing a small patch test first if applying to the skin.
                    </p>
                  </div>
                </div>
                <div className={`accordion-item ${activeAccordion === 2 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 2 ? -1 : 2)} style={{ padding: '1.5rem 0' }}>
                    Shipping & Returns
                    <span className="material-icons" style={{ transition: 'transform 0.3s ease', transform: activeAccordion === 2 ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '1.4rem' }}>add</span>
                  </button>
                  <div className="accordion-content">
                    <p style={{ fontWeight: 600, color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="material-icons" style={{ fontSize: '1.1rem' }}>gavel</span>
                      No Exchange & No Return Policy
                    </p>
                    <p>Due to the personal, artisanal, and hygiene-sensitive nature of our handcrafted formulations, Scented Silence enforces a strict <strong>No Return & No Exchange</strong> policy. All purchases are final. In the rare event of transit damage, please contact our support team within 48 hours.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Experience Section */}
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
            <Reveal>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Customer Experience</h2>
            </Reveal>
            <Reveal>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-outline"
                style={{ padding: '0.8rem 1.5rem', fontSize: '0.7rem' }}
              >
                {showReviewForm ? 'CANCEL REVIEW' : 'SHARE YOUR EXPERIENCE'}
              </button>
            </Reveal>
          </div>

          {showReviewForm && (
            <Reveal>
              <form onSubmit={handleReviewSubmit} style={{ maxWidth: '600px', margin: '0 auto 4rem auto', padding: '2rem', background: '#fcfcfc', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>Your Name</label>
                  <input 
                    type="text" 
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                    placeholder="Enter your name"
                    required
                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="material-icons"
                        style={{ cursor: 'pointer', color: star <= reviewForm.rating ? 'var(--primary)' : '#ddd' }}
                      >
                        {star <= reviewForm.rating ? 'star' : 'star_outline'}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>Your Review</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Describe your experience with this scent..."
                    required
                    rows="4"
                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent', resize: 'vertical' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmittingReview}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  {isSubmittingReview ? 'POSTING...' : isLoggedIn ? 'POST REVIEW' : 'SIGN IN TO POST REVIEW'}
                </button>
              </form>
            </Reveal>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <Reveal key={review.id} delay={i * 0.1} className="review-card" style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    {review.avatar ? (
                      <img src={review.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '1.2rem', color: '#ccc' }}>person</span>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{review.name}</div>
                      <div className="review-stars" style={{ color: 'var(--primary)' }}>
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx} className="material-icons" style={{ fontSize: '0.9rem' }}>
                            {idx < review.rating ? 'star' : 'star_outline'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontStyle: 'italic', color: 'var(--foreground)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    &quot;{review.comment}&quot;
                  </p>
                </Reveal>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                <span className="material-icons" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>rate_review</span>
                <p>Be the first to share your experience with this scent.</p>
              </div>
            )}
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
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: '1.5rem', background: '#f5f5f5', position: 'relative' }}>
                    {isVideoUrl(p.images?.[0] || p.image) ? (
                      <video src={p.images?.[0] || p.image} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    ) : (
                      <img src={p.images?.[0] || p.image || fallbackImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    )}
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

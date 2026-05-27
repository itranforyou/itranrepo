'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function LuxuryGiftSetsPage() {
  const router = useRouter();
  const { products, addToCart } = useAppContext();

  // Dynamic Box size prices and images from settings
  const [boxPrices, setBoxPrices] = useState({ price1: 1499, price2: 2699, price4: 4999 });
  const [boxImages, setBoxImages] = useState({ image1: '', image2: '', image4: '' });

  useEffect(() => {
    // Admin saves to 'gift_box_prices' collection
    const unsubscribe = onSnapshot(doc(db, "settings", "gift_box_prices"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBoxPrices({
          price1: Number(data.price1) || 1499,
          price2: Number(data.price2) || 2699,
          price4: Number(data.price4) || 4999
        });
        // Admin uses img1/img2/img4 field names
        setBoxImages({
          image1: data.img1 || '',
          image2: data.img2 || '',
          image4: data.img4 || ''
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Box size options
  const boxOptions = useMemo(() => [
    { value: '1', label: 'Only 1 Fragrance', price: boxPrices.price1, slots: 1, image: boxImages.image1 },
    { value: '2', label: 'Two Fragrances', price: boxPrices.price2, slots: 2, image: boxImages.image2 },
    { value: '4', label: 'Four Fragrances', price: boxPrices.price4, slots: 4, image: boxImages.image4 },
  ], [boxPrices, boxImages]);

  const [selectedBox, setSelectedBox] = useState({ value: '2', label: 'Two Fragrances', price: 2699, slots: 2, image: '' });
  const [selectedSlots, setSelectedSlots] = useState(Array(2).fill(null)); 
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  useEffect(() => {
    const updated = boxOptions.find(o => o.value === selectedBox.value);
    if (updated) {
      setSelectedBox(updated);
    }
  }, [boxOptions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const categories = ['ALL', 'PERFUME OIL', 'DIFFUSERS', 'DHOOP STICKS'];

  const handleBoxChange = (val) => {
    const opt = boxOptions.find(o => o.value === val);
    setSelectedBox(opt);
    setSelectedSlots(Array(opt.slots).fill(null));
    setActiveSlotIndex(0);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.subName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.inspiredBy?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCat = true;
      if (selectedCategory === 'PERFUME OIL') {
        matchesCat = pCat.includes('him') || pCat.includes('her') || pCat.includes('unisex') || pCat.includes('perfume');
      } else if (selectedCategory === 'DIFFUSERS') {
        matchesCat = pCat.includes('diffuser') || pCat.includes('car') || pCat.includes('home');
      } else if (selectedCategory === 'DHOOP STICKS') {
        matchesCat = pCat.includes('dhoop') || pCat.includes('sandali') || pCat.includes('mohak') || pCat.includes('incense');
      }

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const selectProductForActiveSlot = (product) => {
    const newSlots = [...selectedSlots];
    newSlots[activeSlotIndex] = product;
    setSelectedSlots(newSlots);
    const nextEmpty = newSlots.findIndex((s, i) => s === null && i !== activeSlotIndex);
    if (nextEmpty !== -1) {
      setActiveSlotIndex(nextEmpty);
    } else {
      const firstEmpty = newSlots.findIndex(s => s === null);
      if (firstEmpty !== -1) {
        setActiveSlotIndex(firstEmpty);
      }
    }
  };

  const clearSlot = (index, e) => {
    e.stopPropagation();
    const newSlots = [...selectedSlots];
    newSlots[index] = null;
    setSelectedSlots(newSlots);
    setActiveSlotIndex(index);
  };

  const isBoxComplete = selectedSlots.every(s => s !== null);

  // Parse price safely
  const parseProductPrice = (p) => {
    if (!p) return 0;
    // Remove "Rs.", spaces, and commas. Leave decimal points if they exist.
    const raw = (p.price || '').toString().replace(/rs\.?/i, '').replace(/[,\s]/g, '').trim();
    return parseFloat(raw) || 0;
  };

  const productsSubtotal = selectedSlots.reduce((acc, curr) => acc + parseProductPrice(curr), 0);
  const totalCartPrice = selectedBox.price + productsSubtotal;

  const handleAddSetToCart = () => {
    if (!isBoxComplete) return;

    const names = selectedSlots.map(p => p.name).join(', ');
    const giftBoxProduct = {
      id: `giftset-${Date.now()}`,
      name: `Luxury Gift Box (${selectedBox.label})`,
      price: totalCartPrice,
      priceNum: totalCartPrice,
      desc: `Custom curated set containing: ${names}`,
      images: [selectedBox.image],
      category: 'Gift Set',
      inStock: true,
      size: `${selectedBox.slots} Pcs`
    };

    addToCart(giftBoxProduct, { isGift: true, selectedNote: 'Premium Box Curated' });
  };

  const defaultBoxImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1000';
  const defaultProductImg = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000';

  return (
    <div style={{ background: '#faf9f6', minHeight: '100vh', paddingTop: '80px', paddingBottom: '6rem' }}>
      {/* Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      {/* Hero */}
      <section style={{ padding: '4rem 0 2rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.25em', fontSize: '0.75rem', marginBottom: '1rem' }}>
            Bespoke Gifting Experience
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Curate Your Luxury Gift Box
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Select your desired box size and handpick your signature fragrances. Each set is elegantly presented in our custom handcrafted gift box.
          </p>
        </div>
      </section>

      <section className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem' }}>
        <div className="gift-sets-grid">
          <div className="gift-sets-sidebar">
            <h3 className="label-caps" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              1. Choose Gift Box Size
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <select value={selectedBox.value} onChange={(e) => handleBoxChange(e.target.value)} style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                {boxOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} — ₹{opt.price}</option>)}
              </select>
            </div>
            <h3 className="label-caps" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              2. Your Box Slots ({selectedSlots.filter(s => s !== null).length}/{selectedBox.slots} filled)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {selectedSlots.map((slot, idx) => {
                const isActive = idx === activeSlotIndex;
                return (
                  <div key={idx} onClick={() => setActiveSlotIndex(idx)} className="gift-slot-item" style={{ border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)', background: isActive ? 'rgba(212,175,55,0.02)' : '#fafafa' }}>
                    {slot ? (
                      <img src={slot.images?.[0] || defaultProductImg} alt={slot.name} className="slot-number" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="slot-number" style={{ background: '#eee', color: 'var(--muted-foreground)' }}>{idx + 1}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      {slot ? (
                        <div>
                          <div className="slot-name">{slot.name}</div>
                          <div className="slot-category">
                            <span>{slot.category?.replace(' Collection', '')}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{parseProductPrice(slot)}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>{isActive ? 'Select a fragrance...' : 'Click to select slot'}</div>
                      )}
                    </div>
                    {slot && <button onClick={(e) => clearSlot(idx, e)} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: '1.2rem' }}>cancel</span></button>}
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            {selectedSlots.some(s => s !== null) && (
              <div style={{ background: '#faf9f6', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                <div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.75rem', color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}>Price Breakdown</div>
                {selectedSlots.map((slot, i) => slot && (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--muted-foreground)' }}>
                    <span style={{ fontSize: '0.8rem' }}>{slot.name}</span>
                    <span style={{ fontWeight: 600 }}>₹{parseProductPrice(slot)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--muted-foreground)' }}>
                  <span style={{ fontSize: '0.8rem' }}>Gift Box ({selectedBox.label})</span>
                  <span style={{ fontWeight: 600 }}>₹{selectedBox.price}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.95rem' }}>
                  <span>Total</span>
                  <span>₹{totalCartPrice}</span>
                </div>
              </div>
            )}

            <button onClick={handleAddSetToCart} disabled={!isBoxComplete} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.75rem', letterSpacing: '0.15em', background: isBoxComplete ? 'var(--foreground)' : '#ccc', cursor: isBoxComplete ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease' }}>
              {isBoxComplete ? `ADD TO CART — ₹${totalCartPrice}` : 'FILL ALL SLOTS TO ADD'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', fontSize: '1.2rem' }}>search</span>
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.9rem', background: '#fafafa' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '0.5rem 1rem', fontSize: '0.65rem', letterSpacing: '0.1em', border: selectedCategory === cat ? '1px solid var(--foreground)' : '1px solid var(--border)', background: selectedCategory === cat ? 'var(--foreground)' : 'none', color: selectedCategory === cat ? 'var(--background)' : 'var(--muted-foreground)', cursor: 'pointer', borderRadius: '20px' }} className="label-caps">{cat}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="gift-products-grid">
              {filteredProducts.map(p => (
                <div key={p.id} className="gift-product-card">
                  <div style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                    <img src={p.images?.[0] || defaultProductImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 600, fontSize: '0.6rem' }} className="label-caps">{p.category?.replace(' Collection', '')}</div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', margin: '0.2rem 0', fontWeight: 500 }}>{p.name}</h4>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>{p.price}</div>
                  </div>
                  <button onClick={() => selectProductForActiveSlot(p)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.65rem', letterSpacing: '0.15em', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 600 }} className="label-caps btn-secondary-hover">
                    <span className="material-icons" style={{ fontSize: '0.9rem' }}>add</span> Select For Slot {activeSlotIndex + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

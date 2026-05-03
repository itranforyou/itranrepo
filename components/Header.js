'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const { cart, isLoggedIn, logout, userAvatar, setUserAvatar } = useAppContext();
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  const avatarOptions = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Bubba',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Daisy',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  ];

  const shopCollections = [
    { name: 'HIM', slug: 'him' },
    { name: 'HER', slug: 'her' },
    { name: 'UNISEX', slug: 'unisex' },
    { name: 'SPIRITUAL', slug: 'spiritual' },
    { name: 'CAR DIFFUSERS', slug: 'car-diffusers' },
    { name: 'SHOP ALL', slug: 'all-products' }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const checkUser = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        auth.onAuthStateChanged((u) => setUser(u));
      } catch (err) {}
    };
    checkUser();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const iconColor = '#1a1c1c';

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
      </div>

      <Link href="/" className="logo">
        SCENTED SILENCE
      </Link>

      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link 
          href="/" 
          onClick={() => setIsMenuOpen(false)}
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          style={{ color: pathname === '/' ? 'var(--primary)' : '' }}
        >
          Home
        </Link>
        
        <div 
          className={`nav-dropdown ${isShopOpen ? 'active' : ''}`}
          onMouseEnter={() => { if (typeof window !== 'undefined' && window.innerWidth > 768) setIsShopOpen(true); }}
          onMouseLeave={() => { if (typeof window !== 'undefined' && window.innerWidth > 768) setIsShopOpen(false); }}
        >
          <div 
            className={`nav-link-item ${shopCollections.some(col => pathname === (col.slug === 'all-products' ? '/all-products' : `/${col.slug}`)) ? 'active' : ''}`}
            style={{ 
              color: shopCollections.some(col => pathname === (col.slug === 'all-products' ? '/all-products' : `/${col.slug}`)) ? 'var(--primary)' : '' 
            }}
            onClick={() => { if (typeof window !== 'undefined' && window.innerWidth <= 768) setIsShopOpen(!isShopOpen); }}
          >
            <span>Shop</span>
            <span className="material-icons" style={{ fontSize: '18px', transition: 'transform 0.3s', transform: isShopOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </div>

          <div className="nav-dropdown-content">
            {shopCollections.map((col) => (
              <Link 
                key={col.slug}
                href={col.slug === 'all-products' ? '/all-products' : `/${col.slug}`}
                onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                className="dropdown-link"
                style={{ color: pathname === (col.slug === 'all-products' ? '/all-products' : `/${col.slug}`) ? 'var(--primary)' : '' }}
              >
                {col.name}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/bulk-enquiry" className={`nav-link ${pathname === '/bulk-enquiry' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/bulk-enquiry' ? 'var(--primary)' : '' }}>Bulk Queries</Link>
        <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/contact' ? 'var(--primary)' : '' }}>Contact</Link>
        <Link href="/our-story" className={`nav-link ${pathname === '/our-story' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/our-story' ? 'var(--primary)' : '' }}>Our Story</Link>
        <Link href="/blog" className={`nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname?.startsWith('/blog') ? 'var(--primary)' : '' }}>Journal</Link>
        <Link href="/track-order" className={`nav-link ${pathname === '/track-order' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/track-order' ? 'var(--primary)' : '' }}>Track Your Order</Link>
      </nav>

      <div className="header-actions">
        <Link href="/cart" className="cart-icon">
          <span className="material-icons" style={{ color: iconColor }}>shopping_bag</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsEditingAvatar(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
          >
            {isLoggedIn ? (
              <img src={userAvatar} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${isScrolled ? '#ddd' : 'rgba(255,255,255,0.3)'}` }} />
            ) : (
              <span className="material-icons" style={{ fontSize: '1.6rem', color: iconColor }}>person_outline</span>
            )}
          </button>

          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '1.5rem',
              width: '340px',
              background: '#ffffff',
              border: '1px solid #eeeeee',
              boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
              padding: '2.5rem',
              zIndex: 1000,
              borderRadius: '16px',
              animation: 'fadeInScale 0.3s ease'
            }}>
              {isLoggedIn && user ? (
                <div>
                  <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                      <img src={userAvatar} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #f8f8f8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <button 
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#000', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                      >
                        <span className="material-icons" style={{ fontSize: '14px' }}>{isEditingAvatar ? 'close' : 'edit'}</span>
                      </button>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', letterSpacing: '-0.02em' }}>{user.displayName || user.email.split('@')[0]}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                  </div>

                  {isEditingAvatar && (
                    <div style={{ marginBottom: '2rem', background: '#fcfcfc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #f0f0f0', animation: 'fadeInUp 0.3s ease' }}>
                      <div className="label-caps" style={{ fontSize: '0.6rem', color: '#aaa', marginBottom: '1rem', letterSpacing: '0.1em' }}>Switch Your Persona</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem' }}>
                        {avatarOptions.map((opt, i) => (
                          <img 
                            key={i} 
                            src={opt} 
                            onClick={() => setUserAvatar(opt)}
                            style={{ 
                              width: '100%', 
                              cursor: 'pointer', 
                              borderRadius: '8px',
                              border: userAvatar === opt ? '2px solid #000' : '1px solid #eee',
                              opacity: userAvatar === opt ? 1 : 0.6,
                              transition: 'all 0.2s',
                              background: '#fff'
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #f5f5f5', paddingTop: '1.75rem' }}>
                    <Link href="/orders" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#222', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem', color: '#999' }}>history</span> Order History
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#222', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem', color: '#999' }}>favorite_border</span> Wishlist
                    </Link>
                    <button onClick={() => { logout(); setIsProfileOpen(false); }} style={{ background: 'none', border: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem' }}>logout</span> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #eee' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', color: '#ddd' }}>person</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)', color: '#111', fontWeight: 500 }}>Your Journey Awaits</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2.5rem', lineHeight: 1.6, padding: '0 1rem' }}>Sign in to access your curated collection and trace your unique orders.</p>
                  <Link href="/login" onClick={() => setIsProfileOpen(false)} className="btn-primary label-caps" style={{ width: '100%', display: 'block', padding: '1.25rem', fontSize: '0.75rem', borderRadius: '8px' }}>SIGN IN</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

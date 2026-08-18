'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { isVideoUrl } from '@/lib/products';
import AnnouncementTicker from '@/components/AnnouncementTicker';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const { cart, isLoggedIn, logout, deleteAccount, userAvatar, setUserAvatar, products } = useAppContext();
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const shopCollections = [
    { 
      name: 'PERFUME OIL', 
      slug: 'perfume-oil',
      subcategories: [
        { name: 'HIM', slug: 'him' },
        { name: 'HER', slug: 'her' },
        { name: 'UNISEX', slug: 'unisex' },
      ]
    },
    { name: 'DIFFUSERS', slug: 'diffusers' },
    { name: 'DHOOP STICKS', slug: 'dhoop-sticks' },
    { 
      name: 'GIFTS', 
      slug: 'gift',
      subcategories: [
        { name: 'HIM', slug: 'gift-him' },
        { name: 'HER', slug: 'gift-her' },
        { name: 'COUPLE', slug: 'gift-couple' },
      ]
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const checkUser = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        auth.onAuthStateChanged((u) => setUser(u));
      } catch (err) { }
    };
    checkUser();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile submenu when Shop is closed
  useEffect(() => {
    if (!isShopOpen) {
      setOpenMobileSubmenus({});
    }
  }, [isShopOpen]);

  // Handle Outside Click for Profile & Menu State for Back Button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isProfileOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Add class to body to hide floating elements (like back buttons)
    if (isMenuOpen || isProfileOpen) {
      document.body.classList.add('menu-active');
    } else {
      document.body.classList.remove('menu-active');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('menu-active');
    };
  }, [isProfileOpen, isMenuOpen, isSearchOpen]);

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const iconColor = 'var(--foreground)';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim() || !products) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => {
      if ((p.name || '').toLowerCase().includes(q)) return true;
      if ((p.category || '').toLowerCase().includes(q)) return true;
      if (Array.isArray(p.notes) && p.notes.some(n => (n.name || '').toLowerCase().includes(q))) return true;
      return false;
    }).slice(0, 4); // Show top 4 instant results
  }, [searchQuery, products]);

  return (
    <>
      <AnnouncementTicker />
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="mobile-left-group">
        <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
        </div>
        {/* Search Icon (Beside Hamburger on Mobile) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', height: '32px', width: '32px' }}
        >
          <span className="material-icons" style={{ fontSize: '1.5rem', color: iconColor }}>search</span>
        </button>
      </div>

      <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 11 }}>
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/ittar.png"
            alt="Itran"
            style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>
        
        {/* Search Icon (Beside Logo on Desktop) */}
        <button
          className="search-desktop"
          onClick={() => setIsSearchOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', height: '32px', width: '32px' }}
        >
          <span className="material-icons" style={{ fontSize: '1.5rem', color: iconColor }}>search</span>
        </button>
      </div>

      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          style={{ color: pathname === '/' ? 'var(--primary)' : '' }}
        >
          Home
        </Link>

        {/* Shop Dropdown */}
        <div
          className={`nav-dropdown ${isShopOpen ? 'active' : ''}`}
          onMouseEnter={() => { if (typeof window !== 'undefined' && window.innerWidth > 768) setIsShopOpen(true); }}
          onMouseLeave={() => { if (typeof window !== 'undefined' && window.innerWidth > 768) setIsShopOpen(false); }}
        >
          <div
            className={`nav-link-item ${shopCollections.some(col => pathname === `/${col.slug}` || (col.subcategories && col.subcategories.some(sub => pathname === `/${sub.slug}`))) ? 'active' : ''}`}
            style={{
              color: shopCollections.some(col => pathname === `/${col.slug}` || (col.subcategories && col.subcategories.some(sub => pathname === `/${sub.slug}`))) ? 'var(--primary)' : ''
            }}
            onClick={() => { if (typeof window !== 'undefined' && window.innerWidth <= 768) setIsShopOpen(!isShopOpen); }}
          >
            <span>Shop</span>
            <span className="material-icons" style={{ fontSize: '18px', transition: 'transform 0.3s', transform: isShopOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </div>

          <div className="nav-dropdown-content">
            {shopCollections.map((col) => {
              if (col.subcategories) {
                return (
                  <div key={col.slug} className="dropdown-submenu-container">
                    {/* Desktop View */}
                    <div className="desktop-submenu-item">
                      <div className="dropdown-submenu">
                        <Link
                          href={`/${col.slug}`}
                          onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                          className="dropdown-link"
                          style={{ 
                            color: pathname === `/${col.slug}` || col.subcategories.some(sub => pathname === `/${sub.slug}`) ? 'var(--primary)' : '',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: '1.5rem'
                          }}
                        >
                          <span>{col.name}</span>
                          <span className="material-icons submenu-arrow" style={{ fontSize: '16px' }}>chevron_right</span>
                        </Link>
                        <div className="dropdown-submenu-content">
                          {col.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/${sub.slug}`}
                              onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                              className="dropdown-link"
                              style={{ 
                                color: pathname === `/${sub.slug}` ? 'var(--primary)' : '',
                                textTransform: 'uppercase'
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="mobile-submenu-item">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                        <Link
                          href={`/${col.slug}`}
                          onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                          className="dropdown-link"
                          style={{ 
                            color: pathname === `/${col.slug}` || col.subcategories.some(sub => pathname === `/${sub.slug}`) ? 'var(--primary)' : '',
                            textTransform: 'uppercase',
                            paddingRight: '3.5rem'
                          }}
                        >
                          {col.name}
                        </Link>
                        <span 
                          className="material-icons" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMobileSubmenus(prev => ({
                              ...prev,
                              [col.slug]: !prev[col.slug]
                            }));
                          }}
                          style={{ 
                            position: 'absolute',
                            right: '2rem',
                            fontSize: '20px', 
                            cursor: 'pointer',
                            color: '#444',
                            transition: 'transform 0.3s', 
                            transform: openMobileSubmenus[col.slug] ? 'rotate(180deg)' : 'none',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          expand_more
                        </span>
                      </div>
                      <div className={`mobile-submenu-content ${openMobileSubmenus[col.slug] ? 'open' : ''}`} style={{
                        maxHeight: openMobileSubmenus[col.slug] ? '200px' : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease-in-out',
                        background: 'rgba(0, 0, 0, 0.04)'
                      }}>
                        {col.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/${sub.slug}`}
                            onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                            className="dropdown-link mobile-sub-link"
                            style={{ 
                              color: pathname === `/${sub.slug}` ? 'var(--primary)' : '',
                              textTransform: 'uppercase',
                            }}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={col.slug}
                  href={`/${col.slug}`}
                  onClick={() => { setIsShopOpen(false); setIsMenuOpen(false); }}
                  className="dropdown-link"
                  style={{ 
                    color: pathname === `/${col.slug}` ? 'var(--primary)' : '',
                    textTransform: 'uppercase'
                  }}
                >
                  {col.name}
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          href="/all-products"
          className={`nav-link ${pathname === '/all-products' ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
          style={{ color: pathname === '/all-products' ? 'var(--primary)' : '' }}
        >
          Shop All
        </Link>

        <Link href="/bulk-enquiry" className={`nav-link ${pathname === '/bulk-enquiry' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/bulk-enquiry' ? 'var(--primary)' : '' }}>Bulk Gifting</Link>
        <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/contact' ? 'var(--primary)' : '' }}>Contact</Link>
        <Link href="/our-story" className={`nav-link ${pathname === '/our-story' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/our-story' ? 'var(--primary)' : '' }}>Our Story</Link>
        <Link href="/blog" className={`nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname?.startsWith('/blog') ? 'var(--primary)' : '' }}>Journal</Link>
        <Link href="/track-order" className={`nav-link ${pathname === '/track-order' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} style={{ color: pathname === '/track-order' ? 'var(--primary)' : '' }}>Track Order</Link>
      </nav>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Full Width Search Overlay */}
        {isSearchOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem var(--spacing-gutter)',
            animation: 'slideDown 0.3s ease',
            borderBottom: '1px solid var(--border)'
          }} ref={searchRef}>
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for fragrances, categories or notes..."
                  autoFocus
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    borderBottom: '1px solid var(--border)', 
                    padding: '0.5rem 3rem 0.5rem 0.5rem', 
                    outline: 'none', 
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', 
                    fontFamily: 'var(--font-serif)',
                    background: 'transparent',
                    color: 'var(--foreground)'
                  }}
                />
                <button type="submit" style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span className="material-icons" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>search</span>
                </button>
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '3rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>close</span>
                  </button>
                )}
              </form>
              <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <span className="material-icons" style={{ fontSize: '1.8rem', color: 'var(--foreground)' }}>close</span>
              </button>
            </div>

            {/* Predictive Results */}
            {searchQuery.trim() && (
              <div style={{ width: '100%', maxWidth: '900px', marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                
                {/* Suggestions Column */}
                <div>
                  <h4 className="label-caps" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted-foreground)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Suggestions</h4>
                  {filteredProducts.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {filteredProducts.map(p => (
                        <li key={p.id}>
                          <Link href={`/product/${p.id}`} onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '0.95rem', display: 'block' }}>
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>No suggestions found.</p>
                  )}
                  
                  {/* Static Pages Links */}
                  <h4 className="label-caps" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted-foreground)', marginTop: '2.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Pages</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li><Link href="/our-story" onClick={() => setIsSearchOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '0.95rem' }}>Our Heritage</Link></li>
                    <li><Link href="/bulk-enquiry" onClick={() => setIsSearchOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '0.95rem' }}>Bulk Gifting</Link></li>
                  </ul>
                </div>

                {/* Products Column */}
                <div>
                  <h4 className="label-caps" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted-foreground)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Products</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <Link key={p.id} href={`/product/${p.id}`} onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '60px', height: '60px', background: '#f5f5f5', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                            {isVideoUrl(p.images?.[0]) ? (
                              <video src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline autoPlay loop />
                            ) : (
                              <img src={p.images?.[0] || 'https://via.placeholder.com/60'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.2rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>₹{p.price}</div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>No products matching "{searchQuery}"</p>
                    )}
                  </div>
                  
                  {filteredProducts.length > 0 && (
                    <button 
                      onClick={handleSearch}
                      style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                      className="label-caps"
                    >
                      Search for "{searchQuery}" <span className="material-icons" style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>arrow_forward</span>
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        <Link href="/cart" className="cart-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '32px', width: '32px', textDecoration: 'none' }}>
          <span className="material-icons" style={{ fontSize: '1.6rem', color: iconColor }}>shopping_bag</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '32px' }} ref={profileRef}>
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setShowDeleteConfirm(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, height: '32px', width: '32px' }}
          >
            <span className="material-icons" style={{ fontSize: '1.75rem', color: iconColor }}>person_outline</span>
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
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', letterSpacing: '-0.02em' }}>{user.displayName || user.email.split('@')[0]}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                  </div>



                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #f5f5f5', paddingTop: '1.75rem' }}>
                    <Link href="/orders" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#222', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem', color: '#999' }}>history</span> Order History
                    </Link>
                    <Link href="/bulk-history" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#222', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem', color: '#999' }}>card_giftcard</span> Bulk Gifting History
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#222', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem', color: '#999' }}>favorite_border</span> Wishlist
                    </Link>
                    <button onClick={() => { logout(); setIsProfileOpen(false); }} style={{ background: 'none', border: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#666', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}>
                      <span className="material-icons" style={{ fontSize: '1.3rem' }}>logout</span> Sign Out
                    </button>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid #f5f5f5', paddingTop: '1.5rem' }}>
                      {showDeleteConfirm ? (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                          <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '1rem', lineHeight: 1.4 }}>Enter password to confirm permanent deletion.</p>
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={async () => {
                                try {
                                  await deleteAccount(deletePassword);
                                  setIsProfileOpen(false);
                                } catch (err) {
                                  // Error already handled in context notification
                                }
                              }}
                              style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              DELETE FOREVER
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              style={{ flex: 1, background: '#f5f5f5', color: '#666', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            if (window.confirm("ARE YOU SURE? This will permanently erase your profile, cart, and all curated data. This action cannot be undone.")) {
                              try {
                                await deleteAccount();
                                setIsProfileOpen(false);
                              } catch (err) {
                                if (err.code === 'auth/requires-recent-login') {
                                  setShowDeleteConfirm(true);
                                }
                              }
                            }
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}
                          className="label-caps"
                        >
                          DELETE MY ACCOUNT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #eee' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', color: '#ddd' }}>person</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)', color: '#111', fontWeight: 500 }}>Your Journey Awaits</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2.5rem', lineHeight: 1.6, padding: '0 1rem' }}>Sign in to access your curated collection and trace your unique orders.</p>
                  <Link href="/login" onClick={() => setIsProfileOpen(false)} className="btn-primary label-caps" style={{ width: '100%', display: 'block', padding: '1.25rem', fontSize: '0.75rem', borderRadius: '8px', color: 'var(--background)', textAlign: 'center' }}>SIGN IN</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}

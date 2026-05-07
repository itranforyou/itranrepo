'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

export default function RealmTicker() {
  const trackRef = useRef(null);
  const tickerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const realms = [
    { name: 'Him', href: '/him', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Her', href: '/her', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800' },
    { name: 'Unisex', href: '/unisex', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800' },
    { name: 'Spiritual', href: '/spiritual', img: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Car Diffusers', href: '/car-diffusers', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Incense Sticks', href: '/incense-sticks', img: 'https://images.unsplash.com/photo-1602928294241-7662c19e5d41?auto=format&fit=crop&q=80&w=800' },
  ];

  // Duplicate for seamless infinite loop
  const displayRealms = [...realms, ...realms, ...realms];

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // Initial center to allow scrolling in both directions
    setTimeout(() => {
      ticker.scrollLeft = ticker.scrollWidth / 3;
    }, 100);
  }, []);

  const handleManualScroll = () => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const singleSetWidth = ticker.scrollWidth / 3;
    
    // Infinite warp logic
    if (ticker.scrollLeft >= singleSetWidth * 2) {
      ticker.scrollLeft = singleSetWidth;
    } else if (ticker.scrollLeft <= 10) { // Small buffer for smooth reverse
      ticker.scrollLeft = singleSetWidth;
    }
  };

  const handleScroll = (direction) => {
    const CARD_WIDTH = 448;
    if (tickerRef.current) {
      tickerRef.current.scrollBy({ left: direction * CARD_WIDTH, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button className="realm-arrow realm-arrow-left" onClick={() => handleScroll(-1)} aria-label="Scroll left">
        <span className="material-icons">chevron_left</span>
      </button>
      <button className="realm-arrow realm-arrow-right" onClick={() => handleScroll(1)} aria-label="Scroll right">
        <span className="material-icons">chevron_right</span>
      </button>

      <div className="realm-ticker" id="realm-ticker" ref={tickerRef} onScroll={handleManualScroll}>
        <div 
          className="realm-ticker-track" 
          ref={trackRef}
        >
          {displayRealms.map((realm, index) => (
            <Link key={index} href={realm.href} className="realm-item">
              <div className="img-reveal-wrapper" style={{ height: '500px', marginBottom: '1.5rem' }}>
                <img src={realm.img} alt={`${realm.name} Collection`} className="img-reveal loaded" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>{realm.name}</h3>
                <span className="material-icons" style={{ color: 'var(--muted-foreground)' }}>arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

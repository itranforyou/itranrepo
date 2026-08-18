'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function AnnouncementTicker() {
  const defaultText = "WE OFFER FREE SHIPPING ON ALL ORDERS PAN INDIA !!";
  const [tickerConfig, setTickerConfig] = useState({
    text: defaultText,
    enabled: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'ticker'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTickerConfig({
          text: data.text || defaultText,
          enabled: data.enabled !== undefined ? data.enabled : true
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Update CSS custom property --ticker-height dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const heightVal = tickerConfig.enabled ? (isMobile ? '30px' : '32px') : '0px';
      document.documentElement.style.setProperty('--ticker-height', heightVal);
    }
  }, [tickerConfig.enabled]);

  if (!tickerConfig.enabled) {
    return null;
  }

  const message = tickerConfig.text || defaultText;
  const items = Array(6).fill(message);

  return (
    <div className="announcement-ticker-bar" aria-label="Announcement">
      <div className="announcement-ticker-track">
        {/* First track set */}
        <div className="announcement-ticker-content">
          {items.map((text, index) => (
            <span key={`first-${index}`} className="announcement-ticker-item">
              <span>{text}</span>
              <span className="announcement-ticker-separator" aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
        {/* Duplicate track set for seamless, zero-gap infinite marquee */}
        <div className="announcement-ticker-content" aria-hidden="true">
          {items.map((text, index) => (
            <span key={`second-${index}`} className="announcement-ticker-item">
              <span>{text}</span>
              <span className="announcement-ticker-separator">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

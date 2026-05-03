'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on login page
  if (pathname === '/login') return null;

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>Scented Silence</div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Crafted in quiet devotion.</p>
        </div>
        <div className="footer-links label-caps">
          <Link href="/our-story">Our Story</Link>
          <Link href="/heritage">Heritage</Link>
          <Link href="/sustainability">Sustainability</Link>
        </div>
        <div className="footer-links label-caps">
          <Link href="/shipping-returns">Shipping & Returns</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

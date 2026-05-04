'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, loading } = useAppContext();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="label-caps">Loading Favorites...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '90vh', background: 'var(--background)', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Curated Selections</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>My Wishlist</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              A personal gallery of your most evocative scents. These are the fragments of silence you&apos;ve chosen to remember.
            </p>
          </Reveal>

          {wishlist.length > 0 ? (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '3.5rem' }}>
              {wishlist.map((product, index) => (
                <ProductCard key={product.id} product={product} delay={index * 0.1} />
              ))}
            </div>
          ) : (
            <Reveal style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px dashed var(--border)', borderRadius: '2px' }}>
              <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--border)', marginBottom: '1.5rem' }}>favorite_border</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Your wishlist is currently a whisper</h2>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem' }}>Start exploring our anthology to find the scents that speak to you.</p>
              <Link href="/all-products" className="btn-primary label-caps" style={{ padding: '1rem 3rem' }}>
                Explore Anthology
              </Link>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

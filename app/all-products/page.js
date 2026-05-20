'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';
import FilterSort from '@/components/FilterSort';

export default function AllProducts() {
  const router = useRouter();
  const { products } = useAppContext();
  const [filter, setFilter] = useState('ALL SCENTS');
  const [finalProducts, setFinalProducts] = useState([]);

  const categories = ['ALL SCENTS', 'PERFUME OIL', 'DIFFUSERS', 'DHOOP STICKS'];

  const baseFilteredProducts = useMemo(() => {
    return filter === 'ALL SCENTS' 
      ? products 
      : products.filter(p => {
          const pCat = (p.category || '').toLowerCase();
          if (filter === 'PERFUME OIL') return pCat.includes('him') || pCat.includes('her') || pCat.includes('unisex') || pCat.includes('perfume');
          if (filter === 'DIFFUSERS') return pCat.includes('diffuser') || pCat.includes('car') || pCat.includes('home');
          if (filter === 'DHOOP STICKS') return pCat.includes('dhoop') || pCat.includes('sandali') || pCat.includes('mohak') || pCat.includes('incense');
          return true;
        });
  }, [products, filter]);

  return (
    <div style={{ paddingTop: '0', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <section className="shop-hero">
        <img 
          src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000"
          alt="Shop All Hero"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>The Complete Anthology</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontFamily: 'var(--font-serif)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Shop All</h1>
            <p style={{ maxWidth: '650px', margin: '0 auto', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, fontSize: '1.125rem', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              Explore our complete collection of curated scents. From ancient attars to contemporary olfactory silhouettes, every bottle tells a story of quiet devotion.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '6rem 0', background: 'var(--background)' }}>
        <div className="shop-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-gutter)' }}>
          <Reveal className="filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`filter-item ${filter === cat ? 'active' : ''}`}
                style={{ 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 1.5rem 0'
                }}
              >
                {cat}
              </button>
            ))}
          </Reveal>

          {/* Premium Filter & Sort controls */}
          <Suspense fallback={<div>Loading...</div>}>
            <FilterSort products={baseFilteredProducts} onFilterSortChange={setFinalProducts} />
          </Suspense>

          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
            {finalProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.05} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}

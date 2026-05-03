'use client';

import { useState } from 'react';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';

export default function AllProducts() {
  const { products } = useAppContext();
  const [filter, setFilter] = useState('ALL SCENTS');

  const categories = ['ALL SCENTS', 'HIM', 'HER', 'SPIRITUAL', 'HOME FRAGRANCE'];

  const filteredProducts = filter === 'ALL SCENTS' 
    ? products 
    : products.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        if (filter === 'HIM') return pCat.includes('him');
        if (filter === 'HER') return pCat.includes('her');
        if (filter === 'SPIRITUAL') return pCat.includes('spiritual');
        if (filter === 'HOME FRAGRANCE') return pCat.includes('home');
        return true;
      });

  return (
    <div style={{ paddingTop: '0' }}>
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

          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.05} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}

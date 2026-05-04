'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';

const COLLECTION_MAP = {
  'him': {
    title: 'Him',
    subtitle: 'Bold, architectural scents designed for the modern man. Earthy vetivers, smoky woods, and crisp citrus notes create an aura of quiet confidence.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=2000',
    category: 'Him Collection',
    label: 'Curated Realm'
  },
  'her': {
    title: 'Her',
    subtitle: 'Ethereal bouquets and radiant ambers. A collection that mirrors the multifaceted nature of femininity — from the softness of a petal to the strength of a thorn.',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=2000',
    category: 'Her Collection',
    label: 'Curated Realm'
  },
  'unisex': {
    title: 'Unisex',
    subtitle: 'Harmonious blends designed to transcend boundaries. A shared olfactory language combining crisp freshness with warm depths.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=2000',
    category: 'Unisex Collection',
    label: 'Curated Realm'
  },
  'spiritual': {
    title: 'Spiritual',
    subtitle: 'Sacred resins and ancient woods. Scents designed to anchor the soul and create a bridge between the physical and the infinite.',
    image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=2000',
    category: 'Spiritual Collection',
    label: 'Curated Realm'
  },
  'car-diffusers': {
    title: 'Car Diffusers',
    subtitle: 'Elevate your daily commute. Sophisticated aromas designed specifically for your vehicle, turning every drive into a tranquil journey.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000',
    category: 'Car Diffusers',
    label: 'Curated Realm'
  }
};

export default function CollectionPage({ params }) {
  const { products } = useAppContext();
  const { collection: collectionKey } = use(params);
  const router = useRouter();
  const config = COLLECTION_MAP[collectionKey];

  if (!config) {
    return notFound();
  }

  const filteredProducts = products.filter(p => {
    const pCat = (p.category || '').toLowerCase();
    const targetCat = config.category.toLowerCase();
    // Match if it contains the word (e.g. "Him" matches "Him Collection") or vice versa
    return pCat.includes(targetCat) || targetCat.includes(pCat);
  });

  return (
    <div style={{ paddingTop: '0' }}>
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      <section className="shop-hero">
        <img 
          src={config.image}
          alt={config.title}
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1rem', letterSpacing: '0.2em' }}>{config.label}</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{config.title}</h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              {config.subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4rem 2rem' }}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

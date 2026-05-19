'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';
import FilterSort from '@/components/FilterSort';

const COLLECTION_MAP = {
  'perfume-oil': {
    title: 'Perfume Oil',
    subtitle: 'From ancient attars to contemporary olfactory silhouettes, every bottle tells a story of quiet devotion.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000',
    category: 'Perfume Oil',
    label: 'The Complete Anthology',
    isSuper: true,
    subcategories: ['ALL PERFUMES', 'HIM', 'HER', 'UNISEX']
  },
  'diffusers': {
    title: 'Diffusers',
    subtitle: 'Elevate your daily commute or living space with sophisticated aromas designed for tranquility.',
    image: 'https://images.unsplash.com/photo-1602928294241-7662c19e5d41?auto=format&fit=crop&q=80&w=2000',
    category: 'Diffusers',
    label: 'Atmosphere',
    isSuper: true,
    subcategories: ['ALL DIFFUSERS', 'CAR DIFFUSER', 'HOME DIFFUSER']
  },
  'dhoop-sticks': {
    title: 'Dhoop Sticks',
    subtitle: 'Hand-rolled sticks of pure devotion. Infuse your space with timeless aromas of sacred woods and natural resins.',
    image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=2000',
    category: 'Dhoop Sticks',
    label: 'Sacred Smoke',
    isSuper: true,
    subcategories: ['ALL DHOOP STICKS', 'SANDALI', 'MOHAK']
  },
  'him': {
    title: 'Him',
    subtitle: 'Bold, architectural scents designed for the modern man. Earthy vetivers, smoky woods, and crisp citrus notes create an aura of quiet confidence.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=2000',
    category: 'Him',
    label: 'Perfume Oil'
  },
  'her': {
    title: 'Her',
    subtitle: 'Ethereal bouquets and radiant ambers. A collection that mirrors the multifaceted nature of femininity — from the softness of a petal to the strength of a thorn.',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=2000',
    category: 'Her',
    label: 'Perfume Oil'
  },
  'unisex': {
    title: 'Unisex',
    subtitle: 'Harmonious blends designed to transcend boundaries. A shared olfactory language combining crisp freshness with warm depths.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=2000',
    category: 'Unisex',
    label: 'Perfume Oil'
  },
  'car-diffusers': {
    title: 'Car Diffusers',
    subtitle: 'Elevate your daily commute. Sophisticated aromas designed specifically for your vehicle, turning every drive into a tranquil journey.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000',
    category: 'Car Diffuser',
    label: 'Diffusers'
  },
  'home-diffuser': {
    title: 'Home Diffusers',
    subtitle: 'Transform your living space into a sanctuary of peace. Continuous, subtle fragrance dispersal for an inviting atmosphere.',
    image: 'https://images.unsplash.com/photo-1602928294241-7662c19e5d41?auto=format&fit=crop&q=80&w=2000',
    category: 'Home Diffuser',
    label: 'Diffusers'
  },
  'sandali': {
    title: 'Sandali',
    subtitle: 'Hand-rolled sticks of pure devotion. Infuse your space with the timeless aroma of sacred sandalwood and natural resins.',
    image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=2000',
    category: 'Sandali',
    label: 'Dhoop Sticks'
  },
  'mohak': {
    title: 'Mohak',
    subtitle: 'Enchanting floral and earthy notes designed to captivate the senses and elevate your daily rituals to a state of bliss.',
    image: 'https://images.unsplash.com/photo-1602928294241-7662c19e5d41?auto=format&fit=crop&q=80&w=2000',
    category: 'Mohak',
    label: 'Dhoop Sticks'
  }
};

export default function CollectionPage({ params }) {
  const { products } = useAppContext();
  const { collection: collectionKey } = use(params);
  const router = useRouter();
  const config = COLLECTION_MAP[collectionKey];
  const [filter, setFilter] = useState('');
  const [finalProducts, setFinalProducts] = useState([]);

  // Reset filter if collectionKey changes
  useEffect(() => {
    if (config?.subcategories) {
      setFilter(config.subcategories[0]);
    }
  }, [collectionKey, config]);

  if (!config) {
    return notFound();
  }

  const baseFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      
      if (config.isSuper) {
        let belongsToSuper = false;
        if (collectionKey === 'perfume-oil') belongsToSuper = pCat.includes('him') || pCat.includes('her') || pCat.includes('unisex') || pCat.includes('perfume');
        if (collectionKey === 'diffusers') belongsToSuper = pCat.includes('diffuser') || pCat.includes('car') || pCat.includes('home');
        if (collectionKey === 'dhoop-sticks') belongsToSuper = pCat.includes('dhoop') || pCat.includes('sandali') || pCat.includes('mohak') || pCat.includes('incense');
        
        if (!belongsToSuper) return false;
        if (filter && filter.startsWith('ALL ')) return true;
        
        return pCat.includes(filter.toLowerCase().replace(' diffuser', '')); // 'car diffuser' vs 'car', though includes handles it mostly
      } else {
        const targetCat = config.category.toLowerCase();
        return pCat.includes(targetCat) || targetCat.includes(pCat);
      }
    });
  }, [products, filter, config, collectionKey]);

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

      <section style={{ padding: '6rem 0', background: 'var(--background)' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-gutter)' }}>
          {config.isSuper && (
            <Reveal className="filter-bar">
              {config.subcategories.map((cat) => (
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
          )}

          {/* Premium Filter & Sort controls */}
          <FilterSort products={baseFilteredProducts} onFilterSortChange={setFinalProducts} />

          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4rem 2rem' }}>
            {finalProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

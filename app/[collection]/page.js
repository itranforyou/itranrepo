'use client';

import { use, useState, useEffect, useMemo, Suspense } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';
import FilterSort from '@/components/FilterSort';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
    isSuper: true
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
  'gift': {
    title: 'Gifts',
    subtitle: 'Curated gifting experiences — wrapped in intention, delivered with love. Find the perfect fragrance gift for someone special.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=2000',
    category: 'Gift',
    label: 'Gift Collection',
    isSuper: true,
    subcategories: ['ALL GIFTS', 'HIM', 'HER', 'COUPLE']
  },
  'gift-him': {
    title: 'Gifts For Him',
    subtitle: 'Curated fragrance gifts designed for the modern man. Bold, architectural scents wrapped with premium presentation.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=2000',
    category: 'Gift',
    label: 'Gift Collection',
    giftFor: 'Him'
  },
  'gift-her': {
    title: 'Gifts For Her',
    subtitle: 'Ethereal and premium fragrance collections for her. A thoughtful gesture of luxury and elegance.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=2000',
    category: 'Gift',
    label: 'Gift Collection',
    giftFor: 'Her'
  },
  'gift-couple': {
    title: 'Couple Gifts',
    subtitle: 'Harmonious fragrance sets designed for couples. Curated with love for distinct and shared impressions.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=2000',
    category: 'Gift',
    label: 'Gift Collection',
    giftFor: 'Couple'
  },
  'gift-unisex': {
    title: 'Couple Gifts',
    subtitle: 'Harmonious fragrance sets designed for couples. Curated with love for distinct and shared impressions.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=2000',
    category: 'Gift',
    label: 'Gift Collection',
    giftFor: 'Couple'
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

  const [heroImages, setHeroImages] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero-images'), (snap) => {
      if (snap.exists()) {
        setHeroImages(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const getCollectionHeroImage = () => {
    if (heroImages) {
      if (collectionKey === 'perfume-oil' && heroImages.perfumeOil) return heroImages.perfumeOil;
      if (collectionKey === 'him' && heroImages.him) return heroImages.him;
      if (collectionKey === 'her' && heroImages.her) return heroImages.her;
      if (collectionKey === 'unisex' && heroImages.unisex) return heroImages.unisex;
    }
    return config?.image;
  };

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
        if (collectionKey === 'gift') belongsToSuper = pCat === 'gift';
        
        if (!belongsToSuper) return false;
        if (filter && filter.startsWith('ALL ')) return true;

        // Gift collection: filter by giftFor field
        if (collectionKey === 'gift') {
          const f = filter.toLowerCase();
          const targetGiftFor = (p.giftFor || '').toLowerCase();
          if (f === 'couple') {
            return targetGiftFor === 'couple' || targetGiftFor === 'unisex';
          }
          return targetGiftFor === f;
        }
        
        return pCat.includes(filter.toLowerCase().replace(' diffuser', '')); // 'car diffuser' vs 'car', though includes handles it mostly
      } else {
        const targetCat = config.category.toLowerCase();
        const matchesCategory = pCat.includes(targetCat) || targetCat.includes(pCat);
        if (!matchesCategory) return false;
        if (config.giftFor) {
          const targetGiftFor = (p.giftFor || '').toLowerCase();
          const configGiftFor = config.giftFor.toLowerCase();
          if (configGiftFor === 'couple') {
            return targetGiftFor === 'couple' || targetGiftFor === 'unisex';
          }
          return targetGiftFor === configGiftFor;
        }
        return true;
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
          src={getCollectionHeroImage()}
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
          {config.isSuper && config.subcategories && (
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
          <Suspense fallback={<div>Loading...</div>}>
            <FilterSort products={baseFilteredProducts} onFilterSortChange={setFinalProducts} />
          </Suspense>

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

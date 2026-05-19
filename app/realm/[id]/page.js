'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function RealmPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { products } = useAppContext();
  const [realm, setRealm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealm = async () => {
      try {
        const d = await getDoc(doc(db, 'realms', id));
        if (d.exists()) {
          setRealm({ id: d.id, ...d.data() });
        }
      } catch (err) { }
      setLoading(false);
    };
    fetchRealm();
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ letterSpacing: '0.2em' }} className="label-caps">Loading...</div>
      </div>
    );
  }
  
  if (!realm) {
    return notFound();
  }

  const realmProducts = products.filter(p => realm.productIds?.includes(p.id));

  return (
    <div style={{ paddingTop: '0' }}>
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      <section className="shop-hero">
        <img 
          src={realm.img || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000'}
          alt={realm.name}
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1rem', letterSpacing: '0.2em' }}>Curated Realm</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{realm.name}</h1>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4rem 2rem' }}>
            {realmProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.1} />
            ))}
            {realmProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <p className="label-caps" style={{ color: 'var(--muted-foreground)' }}>No products found in this realm.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

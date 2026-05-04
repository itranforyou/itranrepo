'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAppContext();

  // Simulated orders for now
  const orders = [
    { id: 'SS-98234', date: 'April 28, 2026', total: 'Rs. 4,398.00', status: 'In Transit', items: ['Oud of Silence', 'Midnight Jasmine'] },
    { id: 'SS-97112', date: 'March 15, 2026', total: 'Rs. 2,199.00', status: 'Delivered', items: ['Spiritual Mist'] }
  ];

  if (!isLoggedIn) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
        <Reveal>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Sign in to view orders</h1>
          <Link href="/login" className="btn-primary label-caps">Sign In</Link>
        </Reveal>
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
        <div className="container" style={{ maxWidth: '1000px' }}>
          <Reveal style={{ marginBottom: '5rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Archive</div>
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Order History</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>A chronological collection of your olfactory choices.</p>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order, idx) => (
              <Reveal key={idx} delay={idx * 0.1}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  <div>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Order ID</div>
                    <div style={{ fontWeight: 600 }}>{order.id}</div>
                  </div>
                  <div>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Date</div>
                    <div>{order.date}</div>
                  </div>
                  <div>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Items</div>
                    <div style={{ fontSize: '0.9rem' }}>{order.items.join(', ')}</div>
                  </div>
                  <div>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Status</div>
                    <div style={{ color: order.status === 'Delivered' ? '#166534' : 'var(--primary)', fontWeight: 600 }}>{order.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Link href={`/track-order?id=${order.id}`} className="btn-primary label-caps" style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem' }}>TRACK</Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

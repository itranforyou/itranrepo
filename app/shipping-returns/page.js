'use client';

import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ShippingReturns() {
  const router = useRouter();

  return (
    <div style={{ paddingTop: '0', background: '#faf9f7', minHeight: '100vh' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="shop-hero">
        <img 
          src="/images/shipping-hero.png"
          alt="Shipping and Returns"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Client Service</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Shipping & Returns</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              Our commitment to excellence extends from our distillery to your doorstep.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* SHIPPING SECTION */}
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)' }}>Shipping Information</h2>
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Domestic Shipping (India)</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  We offer complimentary standard shipping on all domestic orders within India. 
                  <br />• <strong>Processing Time:</strong> 1-2 business days.
                  <br />• <strong>Delivery Time:</strong> 3-5 business days for metro cities, 5-7 business days for other locations.
                </p>
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>International Shipping</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  We ship to over 50 countries worldwide using premium couriers like DHL and FedEx. Shipping rates are calculated at checkout based on destination.
                  <br />• <strong>Delivery Time:</strong> 7-12 business days depending on customs clearance.
                  <br />• <strong>Duties & Taxes:</strong> Please note that international orders may be subject to import duties and taxes, which are the responsibility of the recipient.
                </p>
              </div>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Order Tracking</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  Once your order is shipped, you will receive a confirmation email with a tracking number. You can also track your order in real-time through our <Link href="/track-order" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Tracking Page</Link>.
                </p>
              </div>
            </div>
          </Reveal>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '5rem' }} />

          {/* RETURNS SECTION */}
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)' }}>Returns & Exchanges</h2>
            <div style={{ marginBottom: '4rem' }}>
              <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                Due to the artisanal and personal nature of our products, we take extreme care in ensuring every bottle meets our quality standards. Please review our policy below:
              </p>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Damaged or Incorrect Items</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  If your order arrives damaged or you receive the incorrect item, please contact us within <strong>48 hours</strong> of delivery. We will arrange a complimentary replacement immediately.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>7-Day Returns</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  For unused and unopened products in their original packaging, we offer a 7-day return window. Please note that for hygiene and safety reasons, we cannot accept returns for bottles that have been opened or tested.
                </p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>How to Start a Return</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  To initiate a return or exchange, please email our client care team at <strong>ittar@2026</strong> with your order number and reason for return. We will provide you with a return authorization and instructions.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '6rem 0', background: '#faf9f7', textAlign: 'center' }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Need Further Assistance?</h2>
            <p style={{ marginBottom: '2.5rem', color: '#666' }}>Our client care team is available Monday through Friday to assist you.</p>
            <Link href="/contact" className="btn-outline label-caps" style={{ padding: '1rem 3rem' }}>Contact Support</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

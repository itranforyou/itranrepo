'use client';

import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sustainability() {
  const router = useRouter();

  return (
    <div style={{ paddingTop: '0', background: '#faf9f7', minHeight: '100vh' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back_ios_new</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="shop-hero">
        <img 
          src="/images/sustainability-hero.png"
          alt="Sustainability"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Ethical Luxury</div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Sustainability</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              Crafting fragrances that honor the earth as much as they delight the senses.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>Our Green Commitment</h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', marginBottom: '4rem' }}>
              Sustainability is not a trend for us; it is a fundamental part of our heritage. For over 130 years, our processes have relied on the health of the soil and the purity of the water. We recognize that to continue our craft for the next century, we must protect the very ecosystems that provide our raw materials.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', marginBottom: '8rem' }}>
            <Reveal delay={0.1}>
              <div style={{ padding: '2.5rem', background: '#faf9f7', borderRadius: '12px', height: '100%' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>spa</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Ethical Sourcing</h3>
                <p style={{ color: '#666', lineHeight: 1.7 }}>
                  We work directly with small-scale farmers in Kannauj, Taif, and Mysore. By cutting out middle-men, we ensure fair wages and support traditional agricultural practices that keep local communities thriving.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div style={{ padding: '2.5rem', background: '#faf9f7', borderRadius: '12px', height: '100%' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>inventory_2</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Zero-Waste Packaging</h3>
                <p style={{ color: '#666', lineHeight: 1.7 }}>
                  Our bottles are designed to be kept forever. For our shipping materials, we use 100% recycled cardboard and biodegradable cornstarch peanuts. No plastic, no compromise.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ padding: '2.5rem', background: '#faf9f7', borderRadius: '12px', height: '100%' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>local_fire_department</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Clean Distillation</h3>
                <p style={{ color: '#666', lineHeight: 1.7 }}>
                  Our traditional hydro-distillation uses natural fuels like wood and biomass. It is a low-energy process that produces no toxic chemical runoff, preserving the purity of our local waterways.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>Refill, Reuse, Remember</h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', marginBottom: '2rem' }}>
              We encourage our customers to view our glass and copper bottles as heirlooms. We are currently developing a circular refill program that will allow you to top up your favorite scents at a reduced price while reducing glass waste.
            </p>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444' }}>
              At Scented Silence, we believe that the most beautiful scents are those that leave no footprint, only a memory.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0', background: 'var(--foreground)', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#fff' }}>Join Our Mission</h2>
            <p style={{ marginBottom: '3rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 3rem' }}>Learn more about how we're working to preserve the art of attar for future generations.</p>
            <Link href="/contact" className="btn-primary label-caps" style={{ background: '#fff', color: '#111' }}>Get In Touch</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

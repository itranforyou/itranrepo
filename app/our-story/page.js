'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/navigation';

export default function OurStory() {
  const router = useRouter();

  return (
    <div style={{ paddingTop: '0' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="shop-hero">
        <img 
          src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000"
          alt="Our Story Hero"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Our Legacy</div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>The Scent of Memory</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              A personal journey of passion, composition, and reclaiming the pride of Indian perfume craft.
            </p>
          </Reveal>
        </div>
      </section>

      {/* OUR STORY DETAILS */}
      <section style={{ padding: 'var(--spacing-section) 0', background: 'var(--background)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.25em', fontSize: '0.7rem' }}>A Personal Statement</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '2rem' }}>Our Story</h2>
            <p style={{ color: 'var(--foreground)', lineHeight: 1.9, fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              At Itran, fragrance is more than just a scent — it’s a feeling, a memory, and a reflection of personality.
            </p>
          </Reveal>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem', marginBottom: '6rem' }}>
            <Reveal direction="right" className="img-reveal-wrapper" style={{ flex: '1 1 420px', maxWidth: '100%', height: '600px', maxHeight: '70vh' }}>
              <img src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1000" alt="Fragrance Inspiration" className="img-reveal loaded" />
            </Reveal>
            <Reveal direction="left" style={{ flex: '1 1 380px', maxWidth: '100%' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>The Beginning</div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>A Fascinating Obsession</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                My journey with perfume oils began long before Itran was created. I have always been deeply fascinated by fragrances — the way a single scent can create memories, spark emotions, and leave a lasting impression. Perfume oils, in particular, always stood out to me because of their richness, depth, and long-lasting nature.
              </p>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, fontSize: '1.05rem' }}>
                Everything changed when a close friend visiting from Qatar gifted me a premium perfume oil. The moment I wore it, I instantly noticed the difference. The fragrance lasted for hours, felt luxurious, and attracted compliments everywhere I went. People constantly asked me what fragrance I was wearing, and every time I mentioned it was a perfume oil from abroad, one thought stayed in my mind — why should such beautiful fragrances only come from foreign countries?
              </p>
            </Reveal>
          </div>

          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '6rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <Reveal>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>Reclaiming the Pride</div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Our Eternal Heritage</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 2, fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto' }}>
                India has always had a deep connection with fragrances, attars, and natural perfume oils. From traditional ittars to exotic floral and woody notes, our culture has celebrated scents for generations. So I began asking myself: when we have the knowledge, heritage, and love for fragrances right here in our country, why should people depend on imported perfume oils at premium prices?
              </p>
              <p style={{ color: 'var(--primary)', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: '3rem' }}>
                That question became the foundation of Itran.
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '5rem', marginTop: '6rem' }}>
            <Reveal direction="right" style={{ flex: '1 1 380px', maxWidth: '100%' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>The Purpose</div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Luxury Within Reach</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                I started researching perfume oils, fragrance compositions, and the art behind long-lasting scents with one goal in mind — to create premium-quality perfume oils that feel luxurious, last all day, and remain affordable for everyone.
              </p>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '2rem', fontSize: '1.05rem' }}>
                Itran was built to bring high-quality perfume oils closer to people who truly appreciate fragrance. Every bottle represents passion, craftsmanship, and the belief that luxury fragrances can be proudly created for our people, in our own country.
              </p>
              <p style={{ color: 'var(--foreground)', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600 }}>
                Because fragrance is not just something you wear — it becomes a part of your identity.
              </p>
            </Reveal>
            <Reveal direction="left" className="img-reveal-wrapper" style={{ flex: '1 1 420px', maxWidth: '100%', height: '550px', maxHeight: '70vh' }}>
              <img src="https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=1000" alt="Itran Formulation Craft" className="img-reveal loaded" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '10rem 0', textAlign: 'center', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '4rem' }}>Experience Itran</h2>
            <Link href="/all-products" className="btn-primary label-caps" style={{ padding: '1.5rem 4rem' }}>Explore The Full Collection</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

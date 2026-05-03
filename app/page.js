'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import RealmTicker from '@/components/RealmTicker';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const { products } = useAppContext();
  
  const bestSellers = products.filter(p => p.isBestSeller).length > 0 
    ? products.filter(p => p.isBestSeller).slice(0, 4)
    : [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  return (
    <>
      {/* HERO SECTION */}
      <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
        {/* Premium Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: 0.6, 
            zIndex: 0 
          }}
        >
          <source src="/videos/homePage.mp4" type="video/mp4" />
        </video>

        {/* Code-based Animated Mist Background */}
        <div className="smoke-video-placeholder" style={{ zIndex: 1 }}>
          <div className="smoke-layer"></div>
          <div className="smoke-layer"></div>
        </div>

        <div style={{ zIndex: 10, maxWidth: '800px', padding: '0 2rem', position: 'relative' }}>
          <Reveal>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              Crafted in Quiet<br />Devotion
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.85)', marginBottom: '3rem', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              Scented Silence was born from a desire to escape the noise. Every drop of our fragrance is composed slowly, honoring ancient distillation methods and sourcing only the rarest, most emotive botanicals.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div>
              <a href="#collection" className="btn-primary label-caps" style={{ backgroundColor: '#ffffff', color: '#1a1a1a' }}>Explore Collection</a>
            </div>
          </Reveal>
        </div>
      </section>

      <main>
        {/* CURATED REALMS SECTION */}
        <section id="collection" style={{ padding: 'var(--spacing-section) 0', backgroundColor: '#ffffff' }}>
          <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
            <Reveal>
              <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '4rem' }}>Curated Realms</h2>
            </Reveal>
            <RealmTicker />
          </div>
        </section>

        {/* BEST SELLERS SECTION */}
        <section id="best-sellers" style={{ padding: 'var(--spacing-section) 0', background: '#faf9f7' }}>
          <div className="container">
            <Reveal style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '0.2em', fontSize: '0.7rem' }}>Most Loved</div>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 0 }}>Best Sellers</h2>
              </div>
              <Link href="/all-products" className="btn-outline label-caps" style={{ padding: '0.85rem 1.75rem', display: 'inline-block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                View More <span className="material-icons" style={{ fontSize: '1rem', marginLeft: '0.5rem', verticalAlign: 'middle' }}>arrow_forward</span>
              </Link>
            </Reveal>

            <div className="best-sellers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
              {bestSellers.map((product, index) => (
                <ProductCard key={product.id} product={product} delay={index * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* OUR STORY SECTION (Makhulal reference) */}
        <section id="our-story" style={{ padding: 'var(--spacing-section) 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            
            {/* Section Heading */}
            <Reveal style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 6rem' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.25em', fontSize: '0.7rem' }}>Since 1887</div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '2rem' }}>Our Story</h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, fontSize: '1.05rem' }}>
                Born in the ancient city of Kannauj — the perfume capital of India — Scented Silence carries five generations of distillation wisdom. We believe fragrance is not worn. It is remembered.
              </p>
            </Reveal>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem', marginBottom: '7rem' }}>
              <Reveal direction="right" className="img-reveal-wrapper" style={{ flex: '1 1 420px', maxWidth: '100%', height: '600px', maxHeight: '70vh' }}>
                <img src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1000" alt="Traditional Distillation" className="img-reveal loaded" />
              </Reveal>
              <Reveal direction="left" style={{ flex: '1 1 380px', maxWidth: '100%' }}>
                <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>The Foundation</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Makhulal Ayodhya Prasad & Co.</h3>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                  Established in 1887 in the heart of Kannauj, our house — Makhulal Ayodhya Prasad and Co. — began as a small workshop near the banks of the Ganga. Our founders mastered the ancient art of <em>deg-bhapka</em>, a hydro-distillation process that coaxes pure attar from flowers at dawn, capturing the soul of each bloom before the morning sun evaporates it.
                </p>
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem' }}>137+</div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Years of Craft</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem' }}>5</div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Generations</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem' }}>100%</div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Natural Ingredients</div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Philosophy Strip */}
            <div style={{ background: '#faf9f7', padding: '5rem', display: 'flex', flexWrap: 'wrap', gap: '4rem', marginBottom: '7rem' }}>
              <Reveal className="reveal-up" style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>eco</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Ethically Sourced</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>Every botanical is hand-selected from its native habitat — rose petals from Taif, vetiver roots from Haiti, sandalwood from Mysore.</p>
              </Reveal>
              <Reveal className="reveal-up" delay={0.1} style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>science</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Ancient Craft</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>We use traditional copper <em>degs</em> and bhapka vessels — unchanged for centuries — because patience and heat coax what machines cannot.</p>
              </Reveal>
              <Reveal className="reveal-up" delay={0.2} style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>favorite</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>No Compromise</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>No synthetic shortcuts. Each bottle is numbered, filled by hand, and sealed with intention in Kannauj, India.</p>
              </Reveal>
            </div>

            {/* CTA */}
            <Reveal className="reveal-up" style={{ textAlign: 'center' }}>
              <Link href="/our-story" style={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, padding: '1.125rem 3rem', background: 'var(--foreground)', color: 'var(--background)', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', transition: 'all 0.3s ease' }}>
                Read The Full Story <span className="material-icons" style={{ fontSize: '1rem', marginLeft: '0.75rem' }}>arrow_forward</span>
              </Link>
            </Reveal>

          </div>
        </section>
      </main>
    </>
  );
}

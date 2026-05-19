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
              Itran was born from a desire to escape the noise. Every drop of our fragrance is composed slowly, honoring ancient distillation methods and sourcing only the rarest, most emotive botanicals.
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
        <section id="collection" style={{ padding: 'var(--spacing-section) 0', backgroundColor: 'var(--background)' }}>
          <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
            <Reveal>
              <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem' }}>Curated Realms</h2>
              <div className="label-caps" style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '4rem', letterSpacing: '0.25em', fontSize: '0.75rem' }}>Artfully Handcrafted</div>
            </Reveal>
            <RealmTicker />
          </div>
        </section>

        {/* BEST SELLERS SECTION */}
        <section id="best-sellers" style={{ padding: 'var(--spacing-section) 0', background: 'var(--muted)' }}>
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

        {/* HERITAGE STORYTELLING SECTION (Kannauj Craftsmanship) */}
        <section style={{ padding: 'var(--spacing-section) 0', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '0 2rem' }}>
            <Reveal>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.3em', fontSize: '0.75rem' }}>Indian Heritage</div>
              <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontFamily: 'var(--font-serif)', marginBottom: '2rem', lineHeight: 1.3 }}>
                Craftsmanship from the Perfume Capital of India
              </h2>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 2, fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
                Nestled on the historic banks of the Ganges, the ancient city of Kannauj has stood as the perfume capital of India for thousands of years. Here, traditional attar-making craftsmanship is preserved like sacred wisdom—where copper <em>degs</em> whisper to clay receivers, and delicate blossoms are slowly coaxed into precious drops of pure, oil-based elixir. Every handcrafted fragrance from Itran is a living tribute to this timeless legacy, capturing the soul of the earth in its most silent and expressive form.
              </p>
            </Reveal>
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <section id="our-story" style={{ padding: 'var(--spacing-section) 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            
            {/* Section Heading */}
            <Reveal style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.25em', fontSize: '0.75rem' }}>Our Story</div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '2rem' }}>The Story Behind Itran</h2>
              <p style={{ color: 'var(--foreground)', lineHeight: 1.9, fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginBottom: '2.5rem' }}>
                At Itran, fragrance is more than just a scent — it’s a feeling, a memory, and a reflection of personality.
              </p>
            </Reveal>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem', marginBottom: '7rem' }}>
              <Reveal direction="right" className="img-reveal-wrapper" style={{ flex: '1 1 420px', maxWidth: '100%', height: '550px', maxHeight: '70vh' }}>
                <img src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1000" alt="Itran Journey" className="img-reveal loaded" />
              </Reveal>
              <Reveal direction="left" style={{ flex: '1 1 380px', maxWidth: '100%' }}>
                <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>The Spark</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>A Fascinating Obsession</h3>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                  My journey with perfume oils began long before Itran was created. I have always been deeply fascinated by fragrances — the way a single scent can create memories, spark emotions, and leave a lasting impression. Perfume oils stood out because of their richness and depth.
                </p>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                  Everything changed when a close friend visiting from Qatar gifted me a premium perfume oil. The fragrance lasted for hours, attracted compliments everywhere, and sparked a deep curiosity in me — why should such beautiful, luxury fragrances only come from abroad?
                </p>
              </Reveal>
            </div>

            {/* Philosophy Strip */}
            <div style={{ background: 'var(--muted)', padding: '5rem', display: 'flex', flexWrap: 'wrap', gap: '4rem', marginBottom: '7rem' }}>
              <Reveal className="reveal-up" style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>eco</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Premium Quality</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>Artisanal formulation that feels incredibly luxurious, lasts all day, and remains accessible to true fragrance appreciators.</p>
              </Reveal>
              <Reveal className="reveal-up" delay={0.1} style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>gavel</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Proudly Handcrafted</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>We celebrate our country&apos;s deep connection, knowledge, and heritage of natural perfume oils and ittars.</p>
              </Reveal>
              <Reveal className="reveal-up" delay={0.2} style={{ flex: '1 1 220px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'block' }}>fingerprint</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Your Scent Identity</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.8 }}>A beautiful fragrance becomes a permanent part of your identity and the memories you leave behind.</p>
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

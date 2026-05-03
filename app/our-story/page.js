'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/navigation';

export default function OurStory() {
  const router = useRouter();
  
  const timeline = [
    {
      year: '1887',
      title: 'The First Drop',
      description: 'Makhulal Ayodhya Prasad establishes our first copper distillery in Kannauj. The air begins to carry the scent of pure Mitti Attar.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=600'
    },
    {
      year: '1924',
      title: 'The Royal Patronage',
      description: 'Our fragrances travel to the courts of India. We become the keepers of scent for those who value quiet luxury over loud noise.',
      image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600'
    },
    {
      year: '1968',
      title: 'Mastering the Bloom',
      description: 'The third generation perfects the hydro-distillation of the Damascus Rose, creating a fragrance that captures the soul of dawn.',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600'
    },
    {
      year: '1992',
      title: 'A Global Whisper',
      description: 'Scented Silence begins to share the secrets of Kannauj with the world, exporting rare resins and oils to the finest houses in Paris and London.',
      image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600'
    },
    {
      year: '2026',
      title: 'The Digital Rebirth',
      description: 'We bring five generations of wisdom to the modern world, proving that true luxury is not about speed, but about the silence between the notes.',
      image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div style={{ paddingTop: '0' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back_ios_new</span>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="shop-hero">
        <img 
          src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000"
          alt="Our Legacy"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Our Legacy</div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>The Scent of Generations</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              Born from a legacy that spans over a century, we are the custodians of Kannauj's liquid gold.
            </p>
          </Reveal>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section style={{ padding: '12rem 0', background: '#faf9f7', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '10rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.2em' }}>Chronicles of Devotion</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>A Century in Silence</h2>
          </Reveal>

          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Center Line - Thicker and more visible */}
            <div style={{ 
              position: 'absolute', 
              left: '50%', 
              top: '0', 
              bottom: '0', 
              width: '2px', 
              background: 'var(--primary)', 
              opacity: 0.3,
              transform: 'translateX(-50%)',
              zIndex: 1
            }}></div>

            {timeline.map((item, index) => (
              <div key={item.year} style={{ 
                display: 'flex', 
                justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                alignItems: 'center',
                marginBottom: '12rem',
                position: 'relative',
                zIndex: 2,
                width: '100%'
              }}>
                {/* Year Marker - More prominent */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  border: '4px solid var(--primary)',
                  boxShadow: '0 0 15px rgba(141, 75, 0, 0.2)',
                  zIndex: 10
                }}></div>

                <Reveal 
                  direction={index % 2 === 0 ? 'right' : 'left'} 
                  style={{ width: '42%' }}
                >
                  <div style={{ 
                    padding: '3.5rem', 
                    background: '#111111', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(141, 75, 0, 0.2)',
                    textAlign: index % 2 === 0 ? 'right' : 'left',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}>
                    {/* Floating Year Tag */}
                    <div style={{ 
                      fontSize: '4rem', 
                      fontFamily: 'var(--font-serif)', 
                      color: 'var(--primary)', 
                      marginBottom: '1rem',
                      fontWeight: 700,
                      lineHeight: 1
                    }}>{item.year}</div>
                    
                    <h3 style={{ fontSize: '1.85rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', color: '#ffffff', letterSpacing: '-0.01em' }}>{item.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, fontSize: '1.05rem' }}>{item.description}</p>
                    
                    <div className="img-reveal-wrapper" style={{ height: '240px', marginTop: '2.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={item.image} alt={item.year} className="img-reveal loaded" style={{ objectPosition: 'center', opacity: 0.8 }} />
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY STRIP */}
      <section style={{ padding: '10rem 0', background: '#faf9f7', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '7rem' }}>
            <Reveal>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>Our Philosophy</h2>
              <div className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.4em' }}>Slow • Pure • Quiet</div>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '5.5rem' }}>
            <Reveal delay={0.1}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>01. The Art of Waiting</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9 }}>
                Modern perfumery is fast. We are intentionally slow. Some of our attars age for over a decade in leather pouches before they are deemed ready to be bottled.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>02. Sacred Sourcing</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9 }}>
                We don't buy from wholesalers. We partner with local farmers, ensuring flowers are harvested at the precise moment.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>03. Zero Noise</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9 }}>
                We believe a fragrance should whisper, not scream. Our compositions are designed to stay close to the skin.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '14rem 0', textAlign: 'center', background: '#fff' }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '4rem' }}>Experience the Silence</h2>
            <Link href="/all-products" className="btn-primary label-caps" style={{ padding: '1.5rem 4rem' }}>Explore The Full Collection</Link>
          </Reveal>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 860px) {
          div[style*="width: 42%"] {
            width: 85% !important;
            margin-left: auto !important;
            margin-right: 0 !important;
          }
          div[style*="left: 50%"] {
            left: 5% !important;
          }
          div[style*="justify-content: flex-start"] {
            justify-content: flex-end !important;
          }
          div[style*="text-align: right"] {
            text-align: left !important;
          }
          div[style*="padding: 3.5rem"] {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

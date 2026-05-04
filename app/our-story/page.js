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

      {/* OUR STORY DETAILS */}
      <section style={{ padding: 'var(--spacing-section) 0', background: 'var(--background)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 6rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.25em', fontSize: '0.7rem' }}>Since 1887</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '2rem' }}>Our Story</h2>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, fontSize: '1.05rem' }}>
              Born in the ancient city of Kannauj — the perfume capital of India — Scented Silence carries five generations of distillation wisdom. We believe fragrance is not worn. It is remembered.
            </p>
          </Reveal>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem', marginBottom: '2rem' }}>
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
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="timeline-section">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.2em' }}>Chronicles of Devotion</div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>A Century in Silence</h2>
          </Reveal>

          <div className="timeline-container">
            {timeline.map((item, index) => (
              <div key={item.year} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <Reveal 
                  direction={index % 2 === 0 ? 'right' : 'left'} 
                  className="timeline-content-wrapper"
                >
                  <div className="timeline-content">
                    <div className="timeline-ornament">
                      <span className="timeline-ornament-line"></span>
                      <span className="material-icons timeline-ornament-icon">local_florist</span>
                      <span className="timeline-ornament-line"></span>
                    </div>
                    <div className="timeline-year">{item.year}</div>
                    <h3 className="timeline-title">{item.title}</h3>
                    <p className="timeline-desc">{item.description}</p>
                    
                    <div className="img-reveal-wrapper timeline-img">
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
        .timeline-section {
          padding: 6rem 0;
          background: #faf9f7;
          position: relative;
          overflow: hidden;
        }
        .timeline-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }
        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--primary);
          opacity: 0.3;
          transform: translateX(-50%);
          z-index: 1;
        }
        .timeline-item {
          display: flex;
          align-items: center;
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 2;
          width: 100%;
        }
        .timeline-item.left {
          justify-content: flex-start;
        }
        .timeline-item.right {
          justify-content: flex-end;
        }
        .timeline-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid var(--primary);
          box-shadow: 0 0 10px rgba(141, 75, 0, 0.2);
          z-index: 10;
        }
        .timeline-content-wrapper {
          width: 40%;
        }
        .timeline-content {
          padding: 1.5rem;
          background: #fffdf9;
          border-radius: 12px;
          border: 1px solid rgba(141, 75, 0, 0.25);
          border-left: 4px solid var(--primary);
          box-shadow: 0 6px 24px rgba(141, 75, 0, 0.08);
          position: relative;
          overflow: hidden;
        }
        .timeline-item.left .timeline-content {
          text-align: right;
          border-left: none;
          border-right: 4px solid var(--primary);
        }
        .timeline-item.right .timeline-content {
          text-align: left;
        }
        /* Ornament row inside the card */
        .timeline-ornament {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          justify-content: flex-start;
        }
        .timeline-item.left .timeline-content .timeline-ornament {
          justify-content: flex-end;
          flex-direction: row-reverse;
        }
        .timeline-ornament-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, var(--primary), transparent);
          opacity: 0.4;
        }
        .timeline-item.left .timeline-content .timeline-ornament-line {
          background: linear-gradient(to left, var(--primary), transparent);
        }
        .timeline-ornament-icon {
          font-size: 0.9rem !important;
          color: var(--primary);
          opacity: 0.7;
          flex-shrink: 0;
        }
        .timeline-year {
          font-size: 1.8rem;
          font-family: var(--font-serif);
          color: var(--primary);
          margin-bottom: 0.25rem;
          font-weight: 700;
          line-height: 1;
        }
        .timeline-title {
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          font-family: var(--font-serif);
          color: #2c1a0e;
          letter-spacing: -0.01em;
        }
        .timeline-desc {
          color: #6b4c2e;
          line-height: 1.6;
          font-size: 0.85rem;
        }
        .timeline-img {
          height: 100px;
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
          opacity: 0.85;
        }

        @media (max-width: 860px) {
          .timeline-line {
            left: 20px;
          }
          .timeline-marker {
            left: 20px;
          }
          .timeline-item.left, .timeline-item.right {
            justify-content: flex-end;
          }
          .timeline-content-wrapper {
            width: calc(100% - 60px);
          }
          .timeline-item.left .timeline-content {
            text-align: left;
          }
          .timeline-content {
            padding: 1.25rem;
          }
          .timeline-item {
            margin-bottom: 2rem;
          }
          .timeline-year {
            font-size: 1.5rem;
          }
          .timeline-title {
            font-size: 1.1rem;
          }
          .timeline-img {
            height: 90px;
            margin-top: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

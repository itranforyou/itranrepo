'use client';

import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Heritage() {
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
          src="/images/heritage-hero.png"
          alt="Heritage"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Est. 1887</div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Heritage</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              A lineage of scent, preserved in the copper vessels of Kannauj for over five generations.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>The Kannauj Connection</h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', marginBottom: '2rem' }}>
              Kannauj, often called the 'Grasse of the East', is a city that lives and breathes fragrance. Situated on the banks of the river Ganga, its fertile soil and unique climate have made it the global capital of traditional attar for centuries.
            </p>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', marginBottom: '4rem' }}>
              It was here, in 1887, that our founder Makhulal Ayodhya Prasad set up his first copper still. He didn't just want to create perfume; he wanted to capture the very essence of the Indian soul—the smell of the earth after the first rain, the intoxicating bloom of the night-flowering jasmine, and the sacred smoke of ancient resins.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', margin: '6rem 0' }}>
            <Reveal direction="right">
              <div className="img-reveal-wrapper" style={{ height: '400px' }}>
                <img src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800" alt="Copper Vessel" className="img-reveal loaded" />
              </div>
            </Reveal>
            <Reveal direction="left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>The Deg-Bhapka Method</h3>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Our distillation process remains untouched by modern machinery. We use 'Degs' (copper stills) and 'Bhapkas' (receiving vessels) connected by bamboo pipes. This hydro-distillation method, using wood and cow-dung cakes for heat, ensures that the most delicate aromatic molecules are preserved, resulting in a depth of scent that synthetic alternatives simply cannot replicate.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>Custodians of Silence</h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444', marginBottom: '2rem' }}>
              For five generations, our family has passed down the secrets of the craft. We are not just business owners; we are custodians of a fading art form. In an era of mass-produced chemical fragrances, we choose the path of slow, intentional creation.
            </p>
            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#444' }}>
              Every bottle of Scented Silence is a piece of this 137-year-old journey. It is a testament to the belief that some things are worth waiting for, and that the most powerful languages are often the quietest.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: '8rem 0', background: '#faf9f7', textAlign: 'center' }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Discover the Legacy</h2>
            <Link href="/all-products" className="btn-primary label-caps">Explore The Collection</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

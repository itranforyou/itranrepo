'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function OurStory() {
  const router = useRouter();
  const [storyData, setStoryData] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'our-story'), (snap) => {
      if (snap.exists()) {
        setStoryData(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const defaultStory = {
    mainHeading: "A Fascinating Obsession",
    subHeading: "At Itran, fragrance is more than just a scent — it’s a feeling, a memory, and a reflection of personality.",
    description1: "My journey with perfume oils began long before Itran was created. I have always been deeply fascinated by fragrances — the way a single scent can create memories, spark emotions, and leave a lasting impression. Perfume oils, in particular, always stood out to me because of their richness, depth, and long-lasting nature.",
    description2: "Everything changed when a close friend visiting from Qatar gifted me a premium perfume oil. The moment I wore it, I instantly noticed the difference. The fragrance lasted for hours, felt luxurious, and attracted compliments everywhere I went. People constantly asked me what fragrance I was wearing, and every time I mentioned it was a perfume oil from abroad, one thought stayed in my mind — why should such beautiful fragrances only come from foreign countries?",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1000",
    stats: [
      { number: "1887", label: "Year Founded", icon: "calendar_today" },
      { number: "5", label: "Generations", icon: "people" },
      { number: "137+", label: "Years of Craft", icon: "history" },
      { number: "40+", label: "Rare Botanicals", icon: "eco" },
      { number: "100%", label: "Natural", icon: "spa" }
    ]
  };

  const story = storyData || defaultStory;

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
            {story.subHeading && (
              <p style={{ color: 'var(--foreground)', lineHeight: 1.9, fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {story.subHeading}
              </p>
            )}
          </Reveal>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem' }}>
            {story.image && (
              <Reveal direction="right" className="img-reveal-wrapper" style={{ flex: '1 1 420px', maxWidth: '100%', height: '600px', maxHeight: '70vh' }}>
                <img src={story.image} alt={story.mainHeading} className="img-reveal loaded" />
              </Reveal>
            )}
            <Reveal direction="left" style={{ flex: '1 1 380px', maxWidth: '100%' }}>
              <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.2em' }}>The Beginning</div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>{story.mainHeading || "A Fascinating Obsession"}</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                {story.description1}
              </p>
              {story.description2 && (
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.9, fontSize: '1.05rem' }}>
                  {story.description2}
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      {story.stats && story.stats.length > 0 && (
        <section style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '5rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-around', textAlign: 'center' }}>
              {story.stats.map((stat, i) => (
                <Reveal key={i} delay={i * 0.1} className="reveal-up">
                  {stat.icon && (
                    <span className="material-icons" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', opacity: 0.8 }}>{stat.icon}</span>
                  )}
                  <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>{stat.number}</div>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7 }}>{stat.label}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OUR STORY DETAILS CONTINUED */}
      <section style={{ padding: 'var(--spacing-section) 0', background: 'var(--background)', paddingTop: '0' }}>
        <div className="container">

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

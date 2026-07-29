'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function Blog() {
  const router = useRouter();
  const [postsData, setPostsData] = useState([]);
  const [heroImages, setHeroImages] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'journal'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPostsData(docs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero-images'), (snap) => {
      if (snap.exists()) {
        setHeroImages(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const [journalSettings, setJournalSettings] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'journal'), (snap) => {
      if (snap.exists()) {
        setJournalSettings(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const defaultPosts = [
    {
      id: '1',
      title: 'The Alchemy of Rose at Dawn',
      date: 'April 24, 2026',
      excerpt: 'In the fields of Kannauj, the harvest begins while the world sleeps. Discover why dawn is the only time to capture the true soul of the Rose.',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: '2',
      title: 'Aging Gracefully: The Story of Our Vetiver',
      date: 'April 12, 2026',
      excerpt: 'Like a fine wine, certain oils require the passage of time to reach their full potential. Our latest batch of Midnight Vetiver has been aging since 2018.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      title: 'The Language of Scent: Finding Your Signature',
      date: 'March 28, 2026',
      excerpt: 'A signature scent is a silent introduction. Here is how to navigate the olfactory families to find the one that speaks your truth.',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const posts = postsData.length > 0 ? postsData : defaultPosts;

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
          src={heroImages?.journal || posts[0]?.image || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000"}
          alt="The Journal"
        />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>{journalSettings?.heroLabel || "The Journal"}</div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '2rem', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{journalSettings?.heroHeading || "Stories in Silence"}</h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: '700px', margin: '0 auto', textShadow: '0 2px 6px rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
              {journalSettings?.heroSubheading || "Reflections on the art of slow perfumery, heritage distillation, and the emotive power of nature's rarest essences."}
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '5rem 4rem' }}>
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.1}>
                <div style={{ cursor: 'pointer' }}>
                  <div className="img-reveal-wrapper" style={{ aspectRatio: '16/10', marginBottom: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                    <img src={post.image || null} alt={post.title} className="img-reveal loaded" style={{ transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>
                  <div className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.15em' }}>{post.date}</div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)', color: '#111' }}>{post.title}</h2>
                  <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '1rem' }}>{post.excerpt}</p>
                  <Link href={`/blog/${post.id}`} className="label-caps" style={{ fontSize: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '6px', color: '#111', fontWeight: 600 }}>Read More</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

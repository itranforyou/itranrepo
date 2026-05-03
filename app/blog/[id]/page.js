'use client';

import { use } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useRouter, notFound } from 'next/navigation';

const BLOG_POSTS = {
  '1': {
    title: 'The Alchemy of Rose at Dawn',
    date: 'April 24, 2026',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000',
    content: [
      "In the fields of Kannauj, the harvest begins while the world sleeps. The air is cool, the dew is fresh, and the roses are at their most potent. This is not just tradition; it is alchemy.",
      "The Damascus rose, or 'Rosa Damascena', is a fragile creature. If harvested under the midday sun, its delicate essential oils begin to evaporate, losing the complex, honeyed notes that define a true attar. Our artisans arrive at 4:00 AM, hand-picking each bloom with a speed and gentleness born of decades of experience.",
      "By 6:00 AM, the flowers are already in the copper 'degs'. As the fire beneath them is stoked with wood and cow dung cakes, the steam carries the soul of the rose through bamboo pipes into the receiving vessels. This process, hydro-distillation, has remained unchanged for over 400 years.",
      "What emerges is more than a fragrance. It is a moment of time, captured in a bottle. A reminder that some things in this world simply cannot be rushed."
    ]
  },
  '2': {
    title: 'Aging Gracefully: The Story of Our Vetiver',
    date: 'April 12, 2026',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000',
    content: [
      "Like a fine wine or a rare manuscript, certain oils require the passage of time to reach their full potential. Vetiver, or 'Khus', is one of them.",
      "Our latest batch of Midnight Vetiver has been aging in our subterranean cellars since 2018. When first distilled, vetiver can be sharp, even aggressive. But as it rests in traditional leather pouches, the molecules slow down. The harsh edges soften into a deep, velvety smokiness that smells like the very heart of the earth.",
      "We believe in the philosophy of 'Slow Scent'. In an industry obsessed with speed and volume, we choose to wait. Because we know that the depth you smell in our bottles isn't just about the roots; it's about the years."
    ]
  },
  '3': {
    title: 'The Language of Scent: Finding Your Signature',
    date: 'March 28, 2026',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=2000',
    content: [
      "A signature scent is a silent introduction. It is the aura you leave behind in a room, the olfactory fingerprint that speaks your truth before you say a word.",
      "Finding that scent is a journey of self-discovery. Are you drawn to the architectural clarity of woods? The ethereal radiation of florals? Or perhaps the grounding sacredness of resins?",
      "At Scented Silence, we categorize our collections into 'Realms'. Each realm is designed to mirror a facet of the human experience. When you choose a fragrance, you aren't just choosing a smell; you are choosing a silence that speaks for you."
    ]
  }
};

export default function BlogPostDetail({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const post = BLOG_POSTS[id];

  if (!post) return notFound();

  return (
    <div style={{ paddingTop: '0' }}>
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back_ios_new</span>
        </button>
      </div>

      <section className="shop-hero">
        <img src={post.image} alt={post.title} />
        <div className="container">
          <Reveal>
            <div className="label-caps" style={{ color: '#dbc2b0', marginBottom: '1.5rem', letterSpacing: '0.2em' }}>{post.date}</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{post.title}</h1>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '8rem 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {post.content.map((para, i) => (
                <p key={i} style={{ fontSize: '1.15rem', lineHeight: 2, color: '#333' }}>
                  {para}
                </p>
              ))}
            </div>
            
            <div style={{ marginTop: '6rem', borderTop: '1px solid #eee', paddingTop: '4rem', textAlign: 'center' }}>
              <Link href="/blog" className="label-caps" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--primary)', paddingBottom: '4px' }}>
                Back to Journal
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

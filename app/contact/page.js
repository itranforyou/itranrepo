'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <div className="floating-back">
        <Link href="/" className="back-btn" aria-label="Go back">
          <span className="material-icons">arrow_back</span>
        </Link>
      </div>

      <section style={{ padding: '8rem 0 4rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Get in Touch</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '2.5rem' }}>Speak in Whispers</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              Whether you seek a signature scent or wish to discuss a bespoke creation, our doors are always open to those who appreciate the art of silence.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '4rem 0 8rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem' }}>
            <Reveal direction="right">
              <div style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Our Atelier</h2>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Visit us in the heart of Kannauj, where five generations of fragrance history come to life.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>place</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Location</div>
                      <p style={{ fontSize: '0.9rem' }}>Atelier Scented Silence, Main Market, Kannauj, Uttar Pradesh - 209725</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>mail</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Email</div>
                      <p style={{ fontSize: '0.9rem' }}>devotion@scentedsilence.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>call</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Phone</div>
                      <p style={{ fontSize: '0.9rem' }}>+91 5694 234567</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Follow Our Journey</h3>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <Link href="#" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Instagram</Link>
                  <Link href="#" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Pinterest</Link>
                  <Link href="#" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Twitter</Link>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div style={{ background: '#faf9f7', padding: '3.5rem', border: '1px solid var(--border)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>First Name</label>
                      <input type="text" required style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} />
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Last Name</label>
                      <input type="text" required style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} />
                    </div>
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Email Address</label>
                    <input type="email" required style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Subject</label>
                    <select style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', appearance: 'none' }}>
                      <option>General Inquiry</option>
                      <option>Bespoke Consultation</option>
                      <option>Press & Media</option>
                      <option>Wholesale</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Your Message</label>
                    <textarea rows="5" required style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', resize: 'none' }}></textarea>
                  </div>
                  <button type="submit" className="btn-primary label-caps" style={{ width: '100%', marginTop: '1rem' }}>Send Message</button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

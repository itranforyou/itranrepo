'use client';

import Reveal from '@/components/Reveal';

export default function BulkEnquiry() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Enquiry submitted. Our team will contact you shortly.');
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <section style={{ padding: '8rem 0 4rem', backgroundColor: '#faf9f7' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Bespoke & Volume</div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '2.5rem' }}>Bulk Enquiries</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              For weddings, corporate gifts, or luxury hospitality partnerships, we offer curated selections and bespoke packaging tailored to your vision.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <Reveal className="reveal-up">
            <div style={{ background: '#fff', padding: '4rem', border: '1px solid var(--border)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Company / Event Name</label>
                  <input type="text" required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Contact Name</label>
                    <input type="text" required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Email Address</label>
                    <input type="email" required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Approximate Quantity</label>
                  <input type="number" required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Tell us about your needs</label>
                  <textarea rows="6" required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent', resize: 'none' }} placeholder="Preferred scents, packaging requirements, timeline..."></textarea>
                </div>
                <button type="submit" className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>Submit Inquiry</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

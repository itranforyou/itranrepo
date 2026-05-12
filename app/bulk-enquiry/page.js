'use client';

import { useState } from 'react';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BulkEnquiry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    productName: '',
    quantity: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'bulkEnquiries'), {
        ...formData,
        quantity: parseInt(formData.quantity),
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting enquiry: ", error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <Reveal>
            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '2rem' }}>check_circle_outline</span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Enquiry Received</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: '3rem' }}>
              Thank you for your interest in Itran. Our bespoke partnerships team will review your request and reach out within 24-48 business hours.
            </p>
            <button onClick={() => router.push('/')} className="btn-primary label-caps" style={{ padding: '1.25rem 3rem' }}>Return Home</button>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
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
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} 
                    />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Product Interest</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Amber Oud, Incense Sets..."
                      value={formData.productName}
                      onChange={(e) => setFormData({...formData, productName: e.target.value})}
                      style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} 
                    />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Quantity Required</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent' }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Your Message / Vision</label>
                  <textarea 
                    rows="6" 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', background: 'transparent', resize: 'none' }} 
                    placeholder="Tell us about the event, packaging requirements, timeline..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary label-caps" 
                  style={{ width: '100%', padding: '1.25rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Submitting Enquiry...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}


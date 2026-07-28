'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setContactInfo(snap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const defaultContact = {
    location: "51, Rama Rd, near GURU RAM SINGH METRO STATION\nNew Delhi, Delhi, 110015",
    email: "Itranforyou06@gmail.com",
    phone: "+91 93116 05860",
    whatsappNumber: "919311605860",
    instagram: "#",
    pinterest: "#",
    twitter: "#"
  };

  const contact = contactInfo || defaultContact;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'contactEnquiries'), {
        ...formData,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: ''
        });
      }, 5000);
    } catch (error) {
      console.error("Error submitting contact form: ", error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = contact.whatsappNumber || "919311605860";
  const whatsappMessage = encodeURIComponent("Hello, I would like to know more about your perfumes.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div style={{ paddingTop: '80px', position: 'relative' }}>
      <div className="floating-back">
        <Link href="/" className="back-btn" aria-label="Go back">
          <span className="material-icons">arrow_back</span>
        </Link>
      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#25D366',
          color: '#fff',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.029.563 2.025.873 3.162.874l.001-.001c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.585-5.766-5.77-5.766zm3.377 8.203c-.158-.079-1.055-.521-1.213-.579s-.263-.079-.368.079c-.105.158-.421.521-.526.631s-.21.132-.368.053c-.158-.079-.668-.246-1.272-.784-.471-.419-.788-.937-.881-1.096s-.01-.244.069-.323c.071-.071.158-.184.237-.276s.105-.158.158-.263.026-.197-.013-.276c-.039-.079-.368-.887-.513-1.214-.141-.334-.282-.284-.368-.288-.095-.001-.21-.001-.315-.001s-.263.039-.421.21c-.158.184-.605.592-.605 1.447s.618 1.683.71 1.802c.092.118 1.214 1.854 2.941 2.596.411.177.732.282.982.361.412.13.788.112 1.084.068.331-.05.158-.421.105-.579z" />
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.029.563 2.025.873 3.162.874l.001-.001c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.585-5.766-5.77-5.766zm3.377 8.203c-.158-.079-1.055-.521-1.213-.579s-.263-.079-.368.079c-.105.158-.421.521-.526.631s-.21.132-.368.053c-.158-.079-.668-.246-1.272-.784-.471-.419-.788-.937-.881-1.096s-.01-.244.069-.323c.071-.071.158-.184.237-.276s.105-.158.158-.263.026-.197-.013-.276c-.039-.079-.368-.887-.513-1.214-.141-.334-.282-.284-.368-.288-.095-.001-.21-.001-.315-.001s-.263.039-.421.21c-.158.184-.605.592-.605 1.447s.618 1.683.71 1.802c.092.118 1.214 1.854 2.941 2.596.411.177.732.282.982.361.412.13.788.112 1.084.068.331-.05.158-.421.105-.579z" />
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 2.2.6 4.3 1.6 6.1L0 25l6.6-1.6c1.8.9 3.8 1.4 5.9 1.4 6.9 0 12.5-5.6 12.5-12.5S19.4 0 12.5 0zm0 22.9c-2 0-3.9-.5-5.6-1.5l-.4-.2-4.1 1 1-4-.2-.4c-1.1-1.7-1.7-3.7-1.7-5.8 0-5.7 4.7-10.4 10.4-10.4S22.9 6.8 22.9 12.5s-4.7 10.4-10.4 10.4z" />
        </svg>
      </a>

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
                  Visit us in the heart of New Delhi, where five generations of fragrance history come to life.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>place</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Location</div>
                      <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{contact.location}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>mail</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Email</div>
                      <p style={{ fontSize: '0.9rem' }}>{contact.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>call</span>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Phone</div>
                      <p style={{ fontSize: '0.9rem' }}>{contact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Follow Our Journey</h3>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {contact.instagram && <Link href={contact.instagram} target="_blank" rel="noopener noreferrer" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Instagram</Link>}
                  {contact.pinterest && <Link href={contact.pinterest} target="_blank" rel="noopener noreferrer" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Pinterest</Link>}
                  {contact.twitter && <Link href={contact.twitter} target="_blank" rel="noopener noreferrer" className="label-caps" style={{ fontSize: '0.7rem', borderBottom: '1px solid var(--border)' }}>Twitter</Link>}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div style={{ background: 'var(--muted)', padding: '3.5rem', border: '1px solid var(--border)' }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <span className="material-icons" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>check_circle</span>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Message Sent</h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>Your message has been sent successfully. We will be in touch with you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} 
                        />
                      </div>
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent' }} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Subject</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', appearance: 'none' }}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Bespoke Consultation">Bespoke Consultation</option>
                        <option value="Press & Media">Press & Media</option>
                        <option value="Wholesale">Wholesale</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>Your Message</label>
                      <textarea 
                        rows="5" 
                        required 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        style={{ width: '100%', padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', resize: 'none' }}
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary label-caps" 
                      style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}


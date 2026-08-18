'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function BulkGiftingHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading, user } = useAppContext();
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoadingEnquiries(false);
      return;
    }

    // Query enquiries matching user ID or user email
    const q = query(
      collection(db, 'bulkEnquiries'),
      where('email', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawDate = data.createdAt?.seconds 
          ? data.createdAt.seconds * 1000 
          : (data.createdAt ? new Date(data.createdAt).getTime() : Date.now());

        return {
          id: doc.id,
          ...data,
          rawDate,
          formattedDate: new Date(rawDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        };
      });

      // Sort by creation date descending (newest first)
      fetched.sort((a, b) => b.rawDate - a.rawDate);
      setEnquiries(fetched);
      setLoadingEnquiries(false);
    }, (error) => {
      console.error("Error fetching bulk gifting history:", error);
      setLoadingEnquiries(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  if (authLoading || loadingEnquiries) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh', background: 'var(--background)' }}>
        <Reveal>
          <p className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em' }}>
            Loading your bulk gifting history...
          </p>
        </Reveal>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh', background: 'var(--background)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Reveal>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#f8f4ee', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem', 
              border: '1px solid rgba(212, 175, 55, 0.3)' 
            }}>
              <span className="material-icons" style={{ fontSize: '2.5rem', color: '#c19a5b' }}>card_giftcard</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1.25rem', color: '#1a1a1a' }}>
              Sign In to View History
            </h1>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Access your previous bulk gifting enquiries, track custom sample curations, and review direct responses from our fragrance team.
            </p>
            <Link href="/login" className="btn-primary label-caps" style={{ padding: '1rem 3rem', display: 'inline-block' }}>
              Sign In
            </Link>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '90vh', background: 'var(--background)', position: 'relative' }}>
      
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>

      <section style={{ padding: '4rem 0 7rem' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          
          {/* Header Section */}
          <Reveal style={{ marginBottom: '3.5rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.3em' }}>
              Bespoke Archive
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: '#1a1a1a' }}>
              Bulk Gifting History
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Track the progress of your customized gifting inquiries, wedding favors, and corporate orders.
            </p>
          </Reveal>

          {enquiries.length === 0 ? (
            /* Empty State */
            <Reveal>
              <div style={{ 
                background: '#fff', 
                border: '1px solid var(--border)', 
                padding: '4.5rem 2rem', 
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}>
                <div style={{ 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '50%', 
                  background: '#faf6f0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem', 
                  border: '1px solid rgba(212, 175, 55, 0.25)' 
                }}>
                  <span className="material-icons" style={{ fontSize: '2rem', color: '#c19a5b' }}>inventory_2</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem', color: '#1a1a1a' }}>
                  No Gifting Enquiries Found
                </h3>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                  You haven't submitted any bulk gifting enquiries yet. Explore our curated collections for weddings, corporate events, and celebrations.
                </p>
                <Link href="/bulk-enquiry" className="btn-primary label-caps" style={{ padding: '1rem 2.5rem', display: 'inline-block' }}>
                  Explore Bulk Gifting
                </Link>
              </div>
            </Reveal>
          ) : (
            /* Enquiries List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {enquiries.map((enq, idx) => {
                const typeLabel = 
                  enq.giftingType === 'wedding' ? 'WEDDING GIFTING' :
                  enq.giftingType === 'corporate' ? 'CORPORATE GIFTING' :
                  enq.giftingType === 'return' ? 'RETURN GIFTING' : 'BULK GIFTING';

                const typeColor = 
                  enq.giftingType === 'wedding' ? '#b45309' :
                  enq.giftingType === 'corporate' ? '#1e40af' :
                  enq.giftingType === 'return' ? '#047857' : 'var(--primary)';

                const statusColor = 
                  enq.status === 'Completed' ? '#15803d' :
                  enq.status === 'In Progress' ? '#b45309' :
                  enq.status === 'Contacted' ? '#2563eb' :
                  enq.status === 'Cancelled' ? '#b91c1c' : '#c2410c';

                const statusBg = 
                  enq.status === 'Completed' ? '#f0fdf4' :
                  enq.status === 'In Progress' ? '#fefce8' :
                  enq.status === 'Contacted' ? '#eff6ff' :
                  enq.status === 'Cancelled' ? '#fef2f2' : '#fff7ed';

                return (
                  <Reveal key={enq.id} delay={idx * 0.08}>
                    <div style={{ 
                      background: '#fff', 
                      border: '1px solid var(--border)', 
                      padding: '2rem 2.5rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease'
                    }}>
                      
                      {/* Top Meta Bar */}
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        borderBottom: '1px solid #f0ebe4', 
                        paddingBottom: '1.25rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span className="label-caps" style={{ 
                            fontSize: '0.65rem', 
                            padding: '0.25rem 0.75rem', 
                            background: '#faf6f0', 
                            border: `1px solid ${typeColor}`, 
                            color: typeColor,
                            letterSpacing: '0.15em'
                          }}>
                            {typeLabel}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            Ref: #{enq.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            • Submitted on {enq.formattedDate}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div style={{ 
                          padding: '0.35rem 0.9rem', 
                          borderRadius: '20px', 
                          background: statusBg, 
                          color: statusColor, 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          border: `1px solid ${statusColor}33`
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
                          {enq.status || 'Pending'}
                        </div>
                      </div>

                      {/* Main Summary Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                        gap: '1.5rem', 
                        marginBottom: '1.75rem' 
                      }}>
                        <div>
                          <div className="label-caps" style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.35rem' }}>
                            Occasion / Purpose
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                            {enq.occasion || enq.weddingOccasion || enq.returnOccasion || enq.purposeOfGifting || 'Custom Gifting'}
                          </div>
                        </div>

                        <div>
                          <div className="label-caps" style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.35rem' }}>
                            Quantity Required
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                            {enq.quantity || enq.numberOfRecipients || enq.expectedGuests || '—'} Units
                          </div>
                        </div>

                        <div>
                          <div className="label-caps" style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.35rem' }}>
                            Target Budget
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                            {enq.budgetPerGift || enq.returnBudget || 'Custom Quote'}
                          </div>
                        </div>

                        <div>
                          <div className="label-caps" style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.35rem' }}>
                            Event / Delivery Date
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>
                            {enq.deliveryDate || enq.eventDate || 'Flexible'}
                          </div>
                        </div>
                      </div>

                      {/* Admin Reply Highlight Box */}
                      {enq.adminReply ? (
                        <div style={{ 
                          background: '#faf6f0', 
                          border: '1px solid rgba(212, 175, 55, 0.4)', 
                          padding: '1.25rem 1.5rem', 
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}>
                          <span className="material-icons" style={{ color: '#c19a5b', fontSize: '22px', marginTop: '2px' }}>
                            mark_email_read
                          </span>
                          <div style={{ flex: 1 }}>
                            <div className="label-caps" style={{ fontSize: '0.65rem', color: '#c19a5b', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>
                              MESSAGE FROM ITRĀN TEAM
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#2a2622', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                              {enq.adminReply}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          background: '#faf9f7', 
                          border: '1px dashed #e5dfd7', 
                          padding: '0.85rem 1.25rem', 
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: '#7c6d63',
                          fontSize: '0.82rem'
                        }}>
                          <span className="material-icons" style={{ fontSize: '18px', color: '#c19a5b' }}>hourglass_empty</span>
                          <span>Our gifting curation team is currently reviewing your inquiry. An artisan specialist will respond with fragrance recommendations shortly.</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0ebe4', paddingTop: '1.25rem' }}>
                        <button 
                          onClick={() => setSelectedEnquiry(enq)}
                          className="btn-secondary label-caps"
                          style={{ 
                            padding: '0.65rem 1.5rem', 
                            fontSize: '0.7rem', 
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span>VIEW COMPLETE DETAILS</span>
                          <span className="material-icons" style={{ fontSize: '16px' }}>open_in_new</span>
                        </button>
                      </div>

                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMPLETE ENQUIRY DETAILS MODAL                                            */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(28, 30, 28, 0.65)', 
            backdropFilter: 'blur(6px)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div 
            style={{ 
              background: '#fdfaf7', 
              border: '1px solid rgba(212, 175, 55, 0.35)', 
              width: '100%', 
              maxWidth: '780px', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: '#f8f4ee'
            }}>
              <div>
                <div className="label-caps" style={{ fontSize: '0.62rem', color: '#c19a5b', letterSpacing: '0.2em', marginBottom: '0.2rem' }}>
                  ENQUIRY REFERENCE #{selectedEnquiry.id.slice(0, 8).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', color: '#1a1a1a', margin: 0 }}>
                  {selectedEnquiry.occasion || 'Bulk Gifting Details'}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1c1e1c' }}
                aria-label="Close modal"
              >
                <span className="material-icons" style={{ fontSize: '26px' }}>close</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Admin Reply (if present) */}
              {selectedEnquiry.adminReply && (
                <div style={{ background: '#faf6f0', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '1.25rem 1.5rem' }}>
                  <div className="label-caps" style={{ fontSize: '0.65rem', color: '#c19a5b', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>
                    DIRECT RESPONSE FROM TEAM
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#2a2622', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedEnquiry.adminReply}
                  </p>
                </div>
              )}

              {/* Grid 1: Customer & Event Logistics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: '#fff', border: '1px solid #ede8e1', padding: '1.5rem' }}>
                <div>
                  <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                    Recipient & Contact
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Name:</strong> {selectedEnquiry.fullName}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Email:</strong> {selectedEnquiry.email}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Phone:</strong> {selectedEnquiry.phone}</p>
                  {selectedEnquiry.city && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>City:</strong> {selectedEnquiry.city}</p>}
                </div>

                <div>
                  <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                    Gifting Requirements
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Type:</strong> {selectedEnquiry.giftType || 'Curated Gift Set'}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Quantity:</strong> {selectedEnquiry.quantity || '—'} Units</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Budget:</strong> {selectedEnquiry.budgetPerGift || 'Custom Quote'}</p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Fragrance:</strong> {selectedEnquiry.productName || selectedEnquiry.preferredFragrance || 'Need Recommendation'}</p>
                </div>

                <div>
                  <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                    Delivery Timeline
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Event Date:</strong> {selectedEnquiry.eventDate || 'Flexible'}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Delivery:</strong> {selectedEnquiry.deliveryDate || 'Standard'}</p>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}><strong>Location:</strong> {selectedEnquiry.deliveryLocation || 'Single Location'}</p>
                  {selectedEnquiry.pinCode && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>PIN:</strong> {selectedEnquiry.pinCode}</p>}
                </div>
              </div>

              {/* Corporate Specifics (if corporate) */}
              {selectedEnquiry.companyName && (
                <div style={{ background: '#fff', border: '1px solid #ede8e1', padding: '1.5rem' }}>
                  <div className="label-caps" style={{ fontSize: '0.6rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                    Corporate Organisation Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Company:</strong> {selectedEnquiry.companyName}</p>
                    {selectedEnquiry.designation && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Designation:</strong> {selectedEnquiry.designation}</p>}
                    {selectedEnquiry.purposeOfGifting && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Purpose:</strong> {selectedEnquiry.purposeOfGifting}</p>}
                    {selectedEnquiry.gstNumber && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>GST Number:</strong> {selectedEnquiry.gstNumber}</p>}
                  </div>
                </div>
              )}

              {/* Personalisation Options */}
              {((selectedEnquiry.personalization && selectedEnquiry.personalization.length > 0) || selectedEnquiry.packagingPreference) && (
                <div style={{ background: '#fff', border: '1px solid #ede8e1', padding: '1.25rem 1.5rem' }}>
                  <div className="label-caps" style={{ fontSize: '0.6rem', color: '#7c6d63', marginBottom: '0.75rem' }}>
                    Selected Personalisation & Packaging
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedEnquiry.packagingPreference && (
                      <span style={{ fontSize: '0.78rem', background: '#f5efe6', border: '1px solid #d4c8be', padding: '0.25rem 0.75rem', color: '#2a2622' }}>
                        📦 {selectedEnquiry.packagingPreference}
                      </span>
                    )}
                    {Array.isArray(selectedEnquiry.personalization) && selectedEnquiry.personalization.map((p, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', background: '#f5efe6', border: '1px solid #d4c8be', padding: '0.25rem 0.75rem', color: '#2a2622' }}>
                        ✨ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              <div>
                <div className="label-caps" style={{ fontSize: '0.62rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  Your Message & Requirements
                </div>
                <div style={{ background: '#fff', border: '1px solid #ede8e1', padding: '1rem 1.25rem', fontSize: '0.9rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedEnquiry.additionalRequirements || selectedEnquiry.message || 'No additional message.'}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', justifyContent: 'flex-end', background: '#f8f4ee' }}>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="btn-primary label-caps"
                style={{ padding: '0.75rem 2rem', fontSize: '0.72rem' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

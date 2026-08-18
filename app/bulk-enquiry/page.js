'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, onSnapshot } from 'firebase/firestore';

export default function BulkGiftingPage() {
  const { user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('wedding'); // 'wedding' | 'corporate' | 'return' | 'bespoke'
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic Gifting Images from Firestore settings with fallbacks
  const [giftingImages, setGiftingImages] = useState({
    hero: '/images/bulk-gifting-hero.jpg',
    wedding: '/images/wedding-gifting.jpg',
    corporate: '/images/corporate-gifting.jpg',
    returnGifting: '/images/return-gifting.jpg'
  });

  // Form State
  const [formData, setFormData] = useState({
    // 01 Customer Details
    fullName: '',
    phone: '',
    email: '',
    city: '',
    
    // 02 Event Details
    eventDate: '',
    deliveryDate: '',

    // 03 Wedding-specific
    weddingOccasion: 'Wedding',
    expectedGuests: '',
    weddingPackaging: 'Premium Luxury Packaging',

    // 03 Corporate-specific
    companyName: '',
    designation: '',
    purposeOfGifting: 'Client Gifts',
    numberOfRecipients: '',
    gstRequired: false,
    gstNumber: '',
    billingCompanyName: '',
    billingAddress: '',

    // 03 Return-specific
    returnOccasion: 'Wedding Favors',
    returnGuests: '',
    returnBudget: '₹500 – ₹1,000',
    returnPackaging: 'Custom Branded Boxes',

    // 04 Gifting Requirements
    budgetPerGift: '',
    quantity: '',
    giftType: 'Gift Box',
    preferredFragrance: 'Need Recommendation',
    specificProduct: '',

    // 05 Personalisation
    personalization: ['Custom Greeting Card', 'Custom Satin Ribbon'],

    // 06 Delivery
    deliveryLocation: '',
    pinCode: '',
    deliveryType: 'Single Location',

    // 07 Additional Requirements
    message: ''
  });

  // Pre-fill user profile information if customer is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Subscribe to real-time gifting images settings from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'gifting-images'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGiftingImages(prev => ({
          ...prev,
          hero: data.hero || prev.hero,
          wedding: data.wedding || prev.wedding,
          corporate: data.corporate || prev.corporate,
          returnGifting: data.returnGifting || prev.returnGifting
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch products for catalogue dropdown
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProductsList(prods);
      } catch {
        // Fallback gracefully
        setProductsList([]);
      }
    };
    fetchCatalog();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const openEnquiryModal = (occasion = 'wedding') => {
    setSelectedOccasion(occasion);
    setErrors({});
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePersonalizationToggle = (option) => {
    const current = formData.personalization || [];
    if (current.includes(option)) {
      setFormData({ ...formData, personalization: current.filter(item => item !== option) });
    } else {
      setFormData({ ...formData, personalization: [...current, option] });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name.';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid mobile number.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.city.trim()) newErrors.city = 'Please enter your city/location.';

    if (!formData.eventDate) newErrors.eventDate = 'Please select an event date.';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Please select a preferred delivery date.';

    if (selectedOccasion === 'corporate') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Please enter your company or organisation name.';
      if (formData.gstRequired && !formData.gstNumber.trim()) {
        newErrors.gstNumber = 'Please enter your GST number.';
      }
    }

    const calculatedQty = parseInt(formData.quantity) || parseInt(formData.numberOfRecipients) || parseInt(formData.expectedGuests) || parseInt(formData.returnGuests) || 0;
    if (!calculatedQty || calculatedQty <= 0) {
      newErrors.quantity = 'Please specify the number of gifts / packages required.';
    }

    if (!formData.deliveryLocation.trim()) newErrors.deliveryLocation = 'Please enter delivery address/location.';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Please enter delivery PIN code.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const modalBody = document.getElementById('enquiry-modal-body');
      if (modalBody) modalBody.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const qty = parseInt(formData.quantity) || parseInt(formData.numberOfRecipients) || parseInt(formData.expectedGuests) || parseInt(formData.returnGuests) || 1;
      
      const occasionName = 
        selectedOccasion === 'wedding' ? (formData.weddingOccasion || 'Wedding') :
        selectedOccasion === 'corporate' ? (formData.purposeOfGifting || 'Corporate Event') :
        selectedOccasion === 'return' ? (formData.returnOccasion || 'Return Gifting') :
        'Bespoke Bulk Gifting';

      const selectedProductName = formData.preferredFragrance === 'Specific Product'
        ? (formData.specificProduct || 'Specific Catalogue Selection')
        : (formData.preferredFragrance || formData.giftType || 'Perfume Gift Set');

      const budgetVal = 
        selectedOccasion === 'return' ? formData.returnBudget :
        formData.budgetPerGift || 'Custom Budget';

      const packagingVal = 
        selectedOccasion === 'wedding' ? formData.weddingPackaging :
        selectedOccasion === 'return' ? formData.returnPackaging :
        'Standard Luxury Packaging';

      // Save to existing bulkEnquiries collection with backwards-compatibility fields and customer auth link
      const enquiryDoc = {
        // Customer Auth association
        userId: user?.uid || null,
        userEmail: user?.email || formData.email.trim(),

        // Backwards compatibility core fields
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        productName: selectedProductName,
        quantity: qty,
        message: formData.message || `Occasion: ${occasionName} | Gifting Type: ${selectedOccasion} | Budget: ${budgetVal}`,
        status: 'Pending',
        createdAt: serverTimestamp(),

        // Extended Rich Fields
        giftingType: selectedOccasion, // 'wedding', 'corporate', 'return', 'bespoke'
        occasion: occasionName,
        budgetPerGift: budgetVal,
        giftType: formData.giftType,
        preferredFragrance: formData.preferredFragrance,
        specificProduct: formData.specificProduct || '',
        
        // Corporate details (if applicable)
        companyName: formData.companyName || '',
        designation: formData.designation || '',
        purposeOfGifting: formData.purposeOfGifting || '',
        numberOfRecipients: parseInt(formData.numberOfRecipients) || qty,
        gstRequired: !!formData.gstRequired,
        gstNumber: formData.gstNumber || '',
        billingCompanyName: formData.billingCompanyName || '',
        billingAddress: formData.billingAddress || '',

        // Wedding/Return specific
        expectedGuests: parseInt(formData.expectedGuests) || 0,
        returnGuests: parseInt(formData.returnGuests) || 0,
        packagingPreference: packagingVal,

        // Dates & Delivery
        eventDate: formData.eventDate,
        deliveryDate: formData.deliveryDate,
        city: formData.city.trim(),
        deliveryLocation: formData.deliveryLocation.trim(),
        pinCode: formData.pinCode.trim(),
        deliveryType: formData.deliveryType,

        // Personalization
        personalization: formData.personalization || [],
        additionalRequirements: formData.message || '',

        // Admin Response placeholder
        adminReply: ''
      };

      await addDoc(collection(db, 'bulkEnquiries'), enquiryDoc);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bulk enquiry: ', error);
      alert('Unable to submit your enquiry at this moment. Please check your connection or contact us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setIsModalOpen(false);
    setFormData({
      fullName: user?.displayName || '',
      phone: '',
      email: user?.email || '',
      city: '',
      eventDate: '',
      deliveryDate: '',
      weddingOccasion: 'Wedding',
      expectedGuests: '',
      weddingPackaging: 'Premium Luxury Packaging',
      companyName: '',
      designation: '',
      purposeOfGifting: 'Client Gifts',
      numberOfRecipients: '',
      gstRequired: false,
      gstNumber: '',
      billingCompanyName: '',
      billingAddress: '',
      returnOccasion: 'Wedding Favors',
      returnGuests: '',
      returnBudget: '₹500 – ₹1,000',
      returnPackaging: 'Custom Branded Boxes',
      budgetPerGift: '',
      quantity: '',
      giftType: 'Gift Box',
      preferredFragrance: 'Need Recommendation',
      specificProduct: '',
      personalization: ['Custom Greeting Card', 'Custom Satin Ribbon'],
      deliveryLocation: '',
      pinCode: '',
      deliveryType: 'Single Location',
      message: ''
    });
  };

  return (
    <div style={{ paddingTop: '80px', backgroundColor: '#fdfaf7', minHeight: '100vh', position: 'relative' }}>
      
      {/* Floating Back Button */}
      <div className="floating-back">
        <Link href="/" className="back-btn" aria-label="Go back to Home">
          <span className="material-icons">arrow_back</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section style={{ padding: '4.5rem 0 3.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.18)' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '3.5rem', 
            alignItems: 'center' 
          }}>
            
            {/* Hero Left Column: Editorial Text */}
            <Reveal direction="right">
              <div style={{ maxWidth: '540px' }}>
                <h1 style={{ 
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', 
                  letterSpacing: '0.04em', 
                  color: '#1a1a1a', 
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  lineHeight: 1.1,
                  marginBottom: '1.25rem'
                }}>
                  BULK GIFTING
                </h1>

                {/* Decorative Gold Emblem */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ height: '1px', width: '30px', background: '#c19a5b' }}></span>
                  <span style={{ color: '#c19a5b', fontSize: '1rem' }}>✦</span>
                  <span style={{ height: '1px', width: '30px', background: '#c19a5b' }}></span>
                </div>

                <h2 style={{ 
                  fontSize: 'clamp(1.2rem, 2.2vw, 1.65rem)', 
                  color: '#2a2622', 
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  marginBottom: '1.25rem'
                }}>
                  Elevate every occasion with the gift of fragrance.
                </h2>

                <p style={{ 
                  fontSize: '1rem', 
                  color: '#6d5a50', 
                  lineHeight: 1.8, 
                  marginBottom: '2.5rem' 
                }}>
                  Thoughtfully curated gifts for weddings, corporate events and special celebrations. Beautifully packaged. Made to be remembered.
                </p>

                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => openEnquiryModal('wedding')}
                    className="btn-primary label-caps"
                    style={{ 
                      padding: '1rem 2.25rem', 
                      letterSpacing: '0.2em',
                      fontSize: '0.75rem',
                      background: '#1c1e1c',
                      color: '#fff',
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    EXPLORE GIFTING
                  </button>
                  <a 
                    href="#occasions"
                    className="btn-secondary label-caps"
                    style={{ 
                      padding: '1rem 2rem', 
                      letterSpacing: '0.15em',
                      fontSize: '0.75rem',
                      borderRadius: '0px',
                      border: '1px solid #c19a5b',
                      color: '#2a2622',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    VIEW OCCASIONS
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Hero Right Column: High-End Photography */}
            <Reveal direction="left">
              <div style={{ 
                position: 'relative', 
                borderRadius: '4px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 40px -15px rgba(28, 30, 28, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}>
                <img 
                  src={giftingImages.hero || "/images/bulk-gifting-hero.jpg"} 
                  alt="Itran Luxury Perfume Bulk Gifting" 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: '520px', 
                    objectFit: 'cover',
                    display: 'block' 
                  }} 
                />
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CHOOSE YOUR OCCASION SECTION                                           */}
      {/* ========================================================================= */}
      <section id="occasions" style={{ padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          
          {/* Section Header with Golden Lines & Diamond Motif */}
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '1.25rem',
                width: '100%',
                maxWidth: '600px'
              }}>
                <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c19a5b)' }}></span>
                <span style={{ color: '#c19a5b', fontSize: '0.85rem' }}>✦</span>
                <h2 style={{ 
                  fontSize: 'clamp(1.15rem, 2vw, 1.45rem)', 
                  letterSpacing: '0.22em', 
                  textTransform: 'uppercase', 
                  fontFamily: 'var(--font-serif)',
                  color: '#1a1a1a',
                  whiteSpace: 'nowrap'
                }}>
                  CHOOSE YOUR OCCASION
                </h2>
                <span style={{ color: '#c19a5b', fontSize: '0.85rem' }}>✦</span>
                <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c19a5b)' }}></span>
              </div>
            </div>
          </Reveal>

          {/* 3 Occasion Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            
            {/* CARD 1: WEDDING GIFTING */}
            <Reveal direction="up" delay={0.1}>
              <div style={{ 
                background: '#f8f4ee', 
                border: '1px solid rgba(212, 175, 55, 0.22)', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 30px -10px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                  <img 
                    src={giftingImages.wedding || "/images/wedding-gifting.jpg"} 
                    alt="Wedding Gifting" 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                </div>

                <div style={{ padding: '2.5rem 2rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ marginBottom: '1rem', color: '#c19a5b', display: 'flex', justifyContent: 'center' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="9" cy="14" r="5" />
                      <circle cx="15" cy="11" r="5" />
                      <path d="M12 4l1.5 2h-3z" fill="currentColor" stroke="none" />
                    </svg>
                  </div>

                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    letterSpacing: '0.12em', 
                    textTransform: 'uppercase', 
                    fontFamily: 'var(--font-serif)', 
                    color: '#1a1a1a',
                    marginBottom: '0.6rem'
                  }}>
                    WEDDING GIFTING
                  </h3>

                  <div style={{ color: '#c19a5b', fontSize: '0.65rem', marginBottom: '0.9rem' }}>✦</div>

                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#6d5a50', 
                    lineHeight: 1.6, 
                    marginBottom: '2rem',
                    flex: 1
                  }}>
                    Celebrate love with a fragrance that stays forever.
                  </p>

                  <button 
                    onClick={() => openEnquiryModal('wedding')}
                    className="btn-primary label-caps"
                    style={{ 
                      width: '100%', 
                      padding: '0.9rem', 
                      fontSize: '0.7rem', 
                      letterSpacing: '0.2em',
                      background: '#1c1e1c',
                      color: '#fff',
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    EXPLORE
                  </button>
                </div>
              </div>
            </Reveal>

            {/* CARD 2: CORPORATE GIFTING */}
            <Reveal direction="up" delay={0.2}>
              <div style={{ 
                background: '#f8f4ee', 
                border: '1px solid rgba(212, 175, 55, 0.22)', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 30px -10px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                  <img 
                    src={giftingImages.corporate || "/images/corporate-gifting.jpg"} 
                    alt="Corporate Gifting" 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                </div>

                <div style={{ padding: '2.5rem 2rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ marginBottom: '1rem', color: '#c19a5b', display: 'flex', justifyContent: 'center' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="12" y1="12" x2="12" y2="12.01" />
                    </svg>
                  </div>

                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    letterSpacing: '0.12em', 
                    textTransform: 'uppercase', 
                    fontFamily: 'var(--font-serif)', 
                    color: '#1a1a1a',
                    marginBottom: '0.6rem'
                  }}>
                    CORPORATE GIFTING
                  </h3>

                  <div style={{ color: '#c19a5b', fontSize: '0.65rem', marginBottom: '0.9rem' }}>✦</div>

                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#6d5a50', 
                    lineHeight: 1.6, 
                    marginBottom: '2rem',
                    flex: 1
                  }}>
                    Thoughtful gifts that leave a lasting impression.
                  </p>

                  <button 
                    onClick={() => openEnquiryModal('corporate')}
                    className="btn-primary label-caps"
                    style={{ 
                      width: '100%', 
                      padding: '0.9rem', 
                      fontSize: '0.7rem', 
                      letterSpacing: '0.2em',
                      background: '#1c1e1c',
                      color: '#fff',
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    EXPLORE
                  </button>
                </div>
              </div>
            </Reveal>

            {/* CARD 3: RETURN GIFTING */}
            <Reveal direction="up" delay={0.3}>
              <div style={{ 
                background: '#f8f4ee', 
                border: '1px solid rgba(212, 175, 55, 0.22)', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 30px -10px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                  <img 
                    src={giftingImages.returnGifting || "/images/return-gifting.jpg"} 
                    alt="Return Gifting" 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                </div>

                <div style={{ padding: '2.5rem 2rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ marginBottom: '1rem', color: '#c19a5b', display: 'flex', justifyContent: 'center' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="20 12 20 22 4 22 4 12" />
                      <rect x="2" y="7" width="20" height="5" />
                      <line x1="12" y1="22" x2="12" y2="7" />
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                  </div>

                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    letterSpacing: '0.12em', 
                    textTransform: 'uppercase', 
                    fontFamily: 'var(--font-serif)', 
                    color: '#1a1a1a',
                    marginBottom: '0.6rem'
                  }}>
                    RETURN GIFTING
                  </h3>

                  <div style={{ color: '#c19a5b', fontSize: '0.65rem', marginBottom: '0.9rem' }}>✦</div>

                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#6d5a50', 
                    lineHeight: 1.6, 
                    marginBottom: '2rem',
                    flex: 1
                  }}>
                    A little fragrance. A beautiful way to say thank you.
                  </p>

                  <button 
                    onClick={() => openEnquiryModal('return')}
                    className="btn-primary label-caps"
                    style={{ 
                      width: '100%', 
                      padding: '0.9rem', 
                      fontSize: '0.7rem', 
                      letterSpacing: '0.2em',
                      background: '#1c1e1c',
                      color: '#fff',
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    EXPLORE
                  </button>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VALUE PROPOSITIONS BAR                                                 */}
      {/* ========================================================================= */}
      <section style={{ 
        padding: '3rem 0', 
        background: '#f4ede4', 
        borderTop: '1px solid rgba(212, 175, 55, 0.2)', 
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)' 
      }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                border: '1px solid #c19a5b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#c19a5b',
                flexShrink: 0
              }}>
                <span className="material-icons" style={{ fontSize: '22px' }}>card_giftcard</span>
              </div>
              <div>
                <h4 className="label-caps" style={{ fontSize: '0.7rem', color: '#1c1e1c', marginBottom: '0.2rem', letterSpacing: '0.1em' }}>
                  PREMIUM PACKAGING
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6d5a50', margin: 0 }}>Elegant. Luxurious. Memorable.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                border: '1px solid #c19a5b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#c19a5b',
                flexShrink: 0
              }}>
                <span className="material-icons" style={{ fontSize: '22px' }}>local_florist</span>
              </div>
              <div>
                <h4 className="label-caps" style={{ fontSize: '0.7rem', color: '#1c1e1c', marginBottom: '0.2rem', letterSpacing: '0.1em' }}>
                  EXQUISITE FRAGRANCES
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6d5a50', margin: 0 }}>Crafted with the finest ingredients.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                border: '1px solid #c19a5b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#c19a5b',
                flexShrink: 0
              }}>
                <span className="material-icons" style={{ fontSize: '22px' }}>draw</span>
              </div>
              <div>
                <h4 className="label-caps" style={{ fontSize: '0.7rem', color: '#1c1e1c', marginBottom: '0.2rem', letterSpacing: '0.1em' }}>
                  CUSTOMISATION
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6d5a50', margin: 0 }}>Personalised packaging & message.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                border: '1px solid #c19a5b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#c19a5b',
                flexShrink: 0
              }}>
                <span className="material-icons" style={{ fontSize: '22px' }}>local_shipping</span>
              </div>
              <div>
                <h4 className="label-caps" style={{ fontSize: '0.7rem', color: '#1c1e1c', marginBottom: '0.2rem', letterSpacing: '0.1em' }}>
                  PAN INDIA DELIVERY
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6d5a50', margin: 0 }}>Reliable & timely delivery across India.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOTTOM BANNER CARD                                                     */}
      {/* ========================================================================= */}
      <section style={{ padding: '4rem 0 6rem' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <Reveal>
            <div style={{ 
              background: '#f8f4ee', 
              border: '1px solid rgba(212, 175, 55, 0.3)', 
              padding: '2.5rem 3rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ color: '#c19a5b' }}>
                  <span className="material-icons" style={{ fontSize: '36px' }}>support_agent</span>
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.2rem', 
                    letterSpacing: '0.08em', 
                    textTransform: 'uppercase', 
                    fontFamily: 'var(--font-serif)', 
                    color: '#1a1a1a',
                    margin: 0
                  }}>
                    LET'S CREATE SOMETHING MEMORABLE TOGETHER
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#6d5a50', margin: '0.35rem 0 0' }}>
                    For bulk orders and bespoke fragrance consultations.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => openEnquiryModal('wedding')}
                className="btn-primary label-caps"
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.2em',
                  background: '#1c1e1c',
                  color: '#fff',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                ENQUIRE NOW
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BESPOKE LUXURY ENQUIRY MODAL                                           */}
      {/* ========================================================================= */}
      {isModalOpen && (
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
          onClick={closeModal}
        >
          <div 
            style={{ 
              background: '#fdfaf7', 
              border: '1px solid rgba(212, 175, 55, 0.35)', 
              width: '100%', 
              maxWidth: '840px', 
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
              padding: '1.75rem 2.25rem 1.25rem', 
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)', 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              background: '#f8f4ee'
            }}>
              <div>
                <div className="label-caps" style={{ fontSize: '0.65rem', color: '#c19a5b', letterSpacing: '0.25em', marginBottom: '0.25rem' }}>
                  ITRĀN BESPOKE GIFTING
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', 
                  fontFamily: 'var(--font-serif)', 
                  color: '#1a1a1a',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  {selectedOccasion === 'wedding' ? 'Wedding Gifting Enquiry' :
                   selectedOccasion === 'corporate' ? 'Corporate Gifting Enquiry' :
                   selectedOccasion === 'return' ? 'Return Gifting Enquiry' : 'Bulk Gifting Enquiry'}
                </h2>
              </div>
              <button 
                onClick={closeModal}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#1c1e1c',
                  padding: '0.25rem'
                }}
                aria-label="Close dialog"
              >
                <span className="material-icons" style={{ fontSize: '28px' }}>close</span>
              </button>
            </div>

            {/* Modal Occasion Switcher Tabs */}
            {!submitted && (
              <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)', 
                background: '#faf6f0',
                overflowX: 'auto'
              }}>
                {[
                  { id: 'wedding', label: 'Wedding Gifting' },
                  { id: 'corporate', label: 'Corporate Gifting' },
                  { id: 'return', label: 'Return Gifting' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedOccasion(tab.id);
                      setErrors({});
                    }}
                    style={{
                      flex: 1,
                      padding: '0.85rem 1rem',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: selectedOccasion === tab.id ? 700 : 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      border: 'none',
                      borderBottom: selectedOccasion === tab.id ? '2.5px solid #c19a5b' : '2.5px solid transparent',
                      background: selectedOccasion === tab.id ? '#fdfaf7' : 'transparent',
                      color: selectedOccasion === tab.id ? '#1a1a1a' : '#7c6d63',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body Container */}
            <div id="enquiry-modal-body" style={{ padding: '2rem 2.25rem', overflowY: 'auto', flex: 1 }}>
              
              {submitted ? (
                /* SUCCESS STATE */
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '50%', 
                    border: '1.5px solid #c19a5b', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#c19a5b',
                    marginBottom: '1.75rem'
                  }}>
                    <span className="material-icons" style={{ fontSize: '38px' }}>done</span>
                  </div>

                  <h3 style={{ 
                    fontSize: '2rem', 
                    fontFamily: 'var(--font-serif)', 
                    color: '#1a1a1a', 
                    marginBottom: '1rem',
                    letterSpacing: '0.04em'
                  }}>
                    THANK YOU
                  </h3>

                  <p style={{ fontSize: '1.05rem', color: '#2a2622', lineHeight: 1.7, marginBottom: '0.75rem', fontWeight: 500 }}>
                    Your gifting enquiry has been received.
                  </p>

                  <p style={{ fontSize: '0.92rem', color: '#6d5a50', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 2.5rem' }}>
                    Our dedicated bespoke gifting team will review your requirements and get back to you shortly with personalised fragrance curation and samples.
                  </p>

                  <button 
                    onClick={resetAndClose}
                    className="btn-primary label-caps"
                    style={{ 
                      padding: '1rem 3rem', 
                      letterSpacing: '0.2em', 
                      background: '#1c1e1c', 
                      color: '#fff',
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    DONE
                  </button>
                </div>
              ) : (
                /* MULTI-SECTION FORM */
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                  {/* ---------------- 01 CUSTOMER DETAILS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>01</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        CUSTOMER DETAILS
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Full Name *
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Ananya Sharma"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.fullName ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.fullName && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.fullName}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.phone ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.phone && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Email Address *
                        </label>
                        <input 
                          type="email" 
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.email ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.email && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          City / Location *
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mumbai, New Delhi"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.city ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.city && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.city}</span>}
                      </div>
                    </div>
                  </div>

                  {/* ---------------- 02 EVENT DETAILS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>02</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        EVENT DETAILS
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Event Date *
                        </label>
                        <input 
                          type="date" 
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.eventDate ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.eventDate && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.eventDate}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Preferred Delivery Date *
                        </label>
                        <input 
                          type="date" 
                          value={formData.deliveryDate}
                          onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.deliveryDate ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.deliveryDate && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.deliveryDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* ---------------- 03 OCCASION SPECIFICS (CONDITIONAL) ---------------- */}
                  {selectedOccasion === 'wedding' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                        <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>03</span>
                        <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                          WEDDING OCCASION DETAILS
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Wedding Occasion
                          </label>
                          <select 
                            value={formData.weddingOccasion}
                            onChange={(e) => setFormData({ ...formData, weddingOccasion: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Wedding">Wedding Main Ceremony</option>
                            <option value="Engagement">Engagement</option>
                            <option value="Reception">Reception</option>
                            <option value="Mehendi">Mehendi</option>
                            <option value="Haldi">Haldi</option>
                            <option value="Sangeet">Sangeet</option>
                            <option value="Bridesmaids & Groomsmen">Bridesmaids / Groomsmen Gifts</option>
                            <option value="Other">Other Celebration</option>
                          </select>
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Expected Number of Guests
                          </label>
                          <input 
                            type="number" 
                            placeholder="e.g. 250"
                            value={formData.expectedGuests}
                            onChange={(e) => setFormData({ ...formData, expectedGuests: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Gift Packaging Preference
                          </label>
                          <select 
                            value={formData.weddingPackaging}
                            onChange={(e) => setFormData({ ...formData, weddingPackaging: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Standard Luxury Packaging">Standard Luxury Packaging</option>
                            <option value="Premium Packaging">Premium Satin-Lined Packaging</option>
                            <option value="Custom Packaging">Custom Branded Wedding Monogram Box</option>
                            <option value="Not Sure">Not Sure — Need Recommendation</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedOccasion === 'corporate' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                        <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>03</span>
                        <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                          CORPORATE & ORGANISATION DETAILS
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Company / Organisation Name *
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Aurelian & Co. Ltd."
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: errors.companyName ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          />
                          {errors.companyName && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.companyName}</span>}
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Designation / Department
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. HR / Procurement Head"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Purpose of Gifting
                          </label>
                          <select 
                            value={formData.purposeOfGifting}
                            onChange={(e) => setFormData({ ...formData, purposeOfGifting: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Client Gifts">Client Appreciation Gifts</option>
                            <option value="Employee Gifts">Employee Recognition Gifts</option>
                            <option value="Diwali / Festive Gifts">Diwali / Festive Gifts</option>
                            <option value="Event / Conference">Event / Leadership Conference</option>
                            <option value="Employee Joining">New Hire Onboarding Kit</option>
                            <option value="Employee Milestone">Milestone / Work Anniversary</option>
                            <option value="Business Anniversary">Company Foundation Day</option>
                            <option value="Other">Other Corporate Occasion</option>
                          </select>
                        </div>
                      </div>

                      {/* GST / Billing Toggle */}
                      <div style={{ marginTop: '1.25rem', background: '#faf6f0', padding: '1.25rem', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: formData.gstRequired ? '1rem' : '0' }}>
                          <input 
                            type="checkbox" 
                            id="gstToggle"
                            checked={formData.gstRequired}
                            onChange={(e) => setFormData({ ...formData, gstRequired: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: '#c19a5b' }}
                          />
                          <label htmlFor="gstToggle" className="label-caps" style={{ fontSize: '0.7rem', color: '#1a1a1a', cursor: 'pointer' }}>
                            GST Invoice & Corporate Billing Required
                          </label>
                        </div>

                        {formData.gstRequired && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                            <div>
                              <label className="label-caps" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '0.35rem', color: '#4a3f35' }}>
                                GST Number *
                              </label>
                              <input 
                                type="text" 
                                placeholder="e.g. 07AAAAA0000A1Z5"
                                value={formData.gstNumber}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: errors.gstNumber ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.85rem' }}
                              />
                              {errors.gstNumber && <span style={{ color: '#991b1b', fontSize: '0.75rem' }}>{errors.gstNumber}</span>}
                            </div>
                            <div>
                              <label className="label-caps" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '0.35rem', color: '#4a3f35' }}>
                                Registered Company Billing Name
                              </label>
                              <input 
                                type="text" 
                                placeholder="Legal Entity Name"
                                value={formData.billingCompanyName}
                                onChange={(e) => setFormData({ ...formData, billingCompanyName: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label className="label-caps" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '0.35rem', color: '#4a3f35' }}>
                                Billing Address
                              </label>
                              <input 
                                type="text" 
                                placeholder="Registered Office Address for Invoice"
                                value={formData.billingAddress}
                                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOccasion === 'return' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                        <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>03</span>
                        <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                          RETURN GIFTING DETAILS
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Occasion / Function
                          </label>
                          <select 
                            value={formData.returnOccasion}
                            onChange={(e) => setFormData({ ...formData, returnOccasion: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Wedding Favors">Wedding Return Favors</option>
                            <option value="Engagement">Engagement Favors</option>
                            <option value="Birthday Celebration">Birthday Celebration</option>
                            <option value="Baby Shower">Baby Shower / Gender Reveal</option>
                            <option value="Housewarming">Housewarming Ceremony</option>
                            <option value="Religious Ceremony">Religious / Puja Gathering</option>
                            <option value="Anniversary">Anniversary Celebration</option>
                            <option value="Festival">Festive Gathering</option>
                            <option value="Other">Other Special Occasion</option>
                          </select>
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Target Budget Per Gift
                          </label>
                          <select 
                            value={formData.returnBudget}
                            onChange={(e) => setFormData({ ...formData, returnBudget: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Under ₹300">Under ₹300 per favor</option>
                            <option value="₹300 – ₹500">₹300 – ₹500 per favor</option>
                            <option value="₹500 – ₹1,000">₹500 – ₹1,000 per favor</option>
                            <option value="₹1,000+">₹1,000+ luxury favor</option>
                          </select>
                        </div>

                        <div>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Favors Packaging
                          </label>
                          <select 
                            value={formData.returnPackaging}
                            onChange={(e) => setFormData({ ...formData, returnPackaging: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="Standard Boxes">Standard Elegant Favors Box</option>
                            <option value="Premium Velvet Bags">Velvet / Satin Pouches</option>
                            <option value="Custom Branded Boxes">Custom Monogram Hard Box</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------- 04 GIFTING REQUIREMENTS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>04</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        GIFTING REQUIREMENTS
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Number of Gifts / Packages *
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="e.g. 50"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.quantity ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.quantity && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.quantity}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Approx. Budget Per Gift
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. ₹1,500"
                          value={formData.budgetPerGift}
                          onChange={(e) => setFormData({ ...formData, budgetPerGift: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Preferred Gift Type
                        </label>
                        <select 
                          value={formData.giftType}
                          onChange={(e) => setFormData({ ...formData, giftType: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        >
                          <option value="Perfume Oil">Individual Perfume Oil (Attar Bottle)</option>
                          <option value="Perfume Oil Set">Perfume Oil Discovery Set (3-5 vials)</option>
                          <option value="Gift Box">Curated Gift Box (Bottle + Vials)</option>
                          <option value="Premium Gift Hamper">Executive Luxury Hamper</option>
                          <option value="Custom Gift">Bespoke Custom Blend Gift</option>
                          <option value="Not Sure">Not Sure — Need Recommendation</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Fragrance Selection
                        </label>
                        <select 
                          value={formData.preferredFragrance}
                          onChange={(e) => setFormData({ ...formData, preferredFragrance: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        >
                          <option value="Need Recommendation">Need Recommendation / Curation by Master Perfumer</option>
                          <option value="Let Me Choose">Let Me Choose Later</option>
                          <option value="Specific Product">Choose Specific Catalogue Product</option>
                        </select>
                      </div>

                      {formData.preferredFragrance === 'Specific Product' && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                            Select Product from Catalogue
                          </label>
                          <select 
                            value={formData.specificProduct}
                            onChange={(e) => setFormData({ ...formData, specificProduct: e.target.value })}
                            style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                          >
                            <option value="">-- Select a Fragrance --</option>
                            {productsList.map(p => (
                              <option key={p.id} value={p.name}>
                                {p.name} ({p.category || 'Perfume Oil'}) {p.price ? `- ${p.price}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ---------------- 05 PERSONALISATION OPTIONS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>05</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        PERSONALISATION & BRANDING
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#6d5a50', marginBottom: '1rem' }}>
                      Select the customization elements you would like included with your gifting packages:
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {[
                        'Name / Monogram',
                        'Custom Message',
                        'Event Date Embossing',
                        'Custom Greeting Card',
                        'Custom Gift Tag',
                        'Custom Satin Ribbon',
                        'Custom Luxury Box',
                        'Company Logo / Seal'
                      ].map((item) => {
                        const isSelected = (formData.personalization || []).includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handlePersonalizationToggle(item)}
                            style={{
                              padding: '0.65rem 1.15rem',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-sans)',
                              letterSpacing: '0.05em',
                              border: isSelected ? '1px solid #c19a5b' : '1px solid #d4c8be',
                              background: isSelected ? '#faf4eb' : '#fff',
                              color: isSelected ? '#1a1a1a' : '#5a4d43',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              borderRadius: '2px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '16px', color: isSelected ? '#c19a5b' : '#a09489' }}>
                              {isSelected ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ---------------- 06 DELIVERY DETAILS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>06</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        DELIVERY LOGISTICS
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Primary Delivery Location Address *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Venue / Office Address"
                          value={formData.deliveryLocation}
                          onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.deliveryLocation ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.deliveryLocation && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.deliveryLocation}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          PIN Code *
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 110001"
                          value={formData.pinCode}
                          onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: errors.pinCode ? '1px solid #991b1b' : '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        />
                        {errors.pinCode && <span style={{ color: '#991b1b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.pinCode}</span>}
                      </div>

                      <div>
                        <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem', color: '#4a3f35' }}>
                          Delivery Type
                        </label>
                        <select 
                          value={formData.deliveryType}
                          onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                          style={{ width: '100%', padding: '0.85rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem' }}
                        >
                          <option value="Single Location">Single Bulk Delivery (Venue/Office)</option>
                          <option value="Multiple Locations">Direct to Individual Recipients (Pan India)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ---------------- 07 ADDITIONAL REQUIREMENTS ---------------- */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem' }}>
                      <span className="label-caps" style={{ color: '#c19a5b', fontSize: '0.75rem' }}>07</span>
                      <h4 className="label-caps" style={{ color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '0.15em', margin: 0 }}>
                        ADDITIONAL VISION & REQUIREMENTS
                      </h4>
                    </div>

                    <textarea 
                      rows="4" 
                      placeholder="Tell us about your preferred fragrance notes, custom packaging design, personalization message, or any special instructions for our artisans..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: '100%', padding: '1rem', border: '1px solid #d4c8be', background: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div style={{ paddingTop: '0.5rem' }}>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary label-caps"
                      style={{ 
                        width: '100%', 
                        padding: '1.25rem', 
                        fontSize: '0.8rem', 
                        letterSpacing: '0.22em',
                        background: '#1c1e1c',
                        color: '#fff',
                        borderRadius: '0px',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? 'SUBMITTING ENQUIRY...' : 'SUBMIT GIFTING ENQUIRY'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7c6d63', marginTop: '0.75rem' }}>
                      Our bespoke gifting specialists will connect with you via Phone / WhatsApp within 24-48 hours.
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

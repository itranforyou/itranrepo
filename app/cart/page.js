'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Robust price parser — handles 'Rs. 1,499', '₹1499', '$185', raw numbers, etc.
const parsePrice = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const clean = val.toString()
    .replace(/Rs\.?/gi, '')
    .replace(/₹/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

// Format a number as Indian Rupees: ₹1,499
const fmtINR = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function Cart() {
  const router = useRouter();
  const { cart, setCart, isLoggedIn, user } = useAppContext();

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'details', 'payment', 'success'
  const [details, setDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [upiId, setUpiId] = useState('itranforyou06@okaxis');
  const [utr, setUtr] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Fetch current UPI ID from admin settings when proceeding to payment
  const fetchUpiId = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "payment"));
      if (snap.exists() && snap.data().upiId) {
        setUpiId(snap.data().upiId);
      }
    } catch (err) {
      console.error("Error fetching UPI ID:", err);
    }
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, (newCart[index].quantity || 1) + delta);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = parsePrice(item.price);
    return acc + (price * (item.quantity || 1));
  }, 0);

  const savings = cart.reduce((acc, item) => {
    const costPrice = parsePrice(item.costPrice);
    const sellPrice = parsePrice(item.price);
    if (costPrice > sellPrice) {
      return acc + ((costPrice - sellPrice) * (item.quantity || 1));
    }
    return acc;
  }, 0);

  const handleCheckoutNow = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setCheckoutStep('details');
  };

  const handleProceedToPayment = (e) => {
    if (e) e.preventDefault();
    if (!details.name || !details.phone || !details.email || !details.address || !details.city || !details.state || !details.zip) {
      alert("Please fill in all details before proceeding.");
      return;
    }
    fetchUpiId();
    setCheckoutStep('payment');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handlePlaceOrder = async () => {
    if (!utr.trim()) {
      alert("UPI Transaction Reference Number (UTR) is required.");
      return;
    }
    if (utr.trim().length < 12) {
      alert("UPI Transaction Reference Number (UTR) should be 12 digits.");
      return;
    }
    setIsPlacing(true);

    try {
      const generatedId = `SS-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderData = {
        orderId: generatedId,
        userId: user?.uid || null,
        customerDetails: {
          name: details.name,
          phone: details.phone,
          email: details.email,
          address: details.address,
          city: details.city,
          state: details.state,
          zip: details.zip
        },
        orderedProducts: cart.map(item => ({
          id: item.id || null,
          name: item.name || '',
          price: item.price || '',
          quantity: item.quantity || 1,
          category: item.category || '',
          image: item.image || item.images?.[0] || '',
          giftOptions: item.giftOptions || null
        })),
        totalAmount: subtotal,
        paymentMethod: 'UPI',
        utrNumber: utr.trim(),
        orderDate: new Date().toISOString(),
        orderStatus: 'Pending Verification'
      };

      // Store order in Firestore
      await setDoc(doc(db, 'orders', generatedId), orderData);

      // Clear Cart
      setCart([]);
      localStorage.removeItem('cart');

      setPlacedOrderId(generatedId);
      setCheckoutStep('success');
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Failed to place order. " + err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  // Render Success Page
  if (checkoutStep === 'success') {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', paddingBottom: '150px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Reveal>
            <span className="material-icons" style={{ fontSize: '5rem', color: 'var(--primary)', marginBottom: '2rem' }}>check_circle_outline</span>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Order Placed Successfully</h1>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Thank you for your order. Your Order ID is <strong>{placedOrderId}</strong>.
            </p>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Your payment is currently <strong>Pending Verification</strong>. We will verify the transaction with your reference number (UTR) and process your order shortly.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <Link href={`/track-order?id=${placedOrderId}`} className="btn-primary label-caps" style={{ padding: '1rem 2rem' }}>Track Order</Link>
              <Link href="/all-products" className="btn-primary label-caps" style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}>Continue Shopping</Link>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  // QR Code URL based on payee and amount
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Ittar&am=${subtotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '8rem', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button 
          onClick={() => {
            if (checkoutStep === 'payment') setCheckoutStep('details');
            else if (checkoutStep === 'details') setCheckoutStep('cart');
            else router.back();
          }} 
          className="back-btn" 
          aria-label="Go Back"
        >
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <div className="container">
        <Reveal>
          <h1 style={{ fontSize: '3rem', marginBottom: '4rem' }}>
            {checkoutStep === 'cart' && 'Your Shopping Bag'}
            {checkoutStep === 'details' && 'Shipping Information'}
            {checkoutStep === 'payment' && 'Complete UPI Payment'}
          </h1>
        </Reveal>

        <div className="cart-grid">
          {/* Left Side: Cart Items or Checkout Forms */}
          <div>
            {checkoutStep === 'cart' && (
              <>
                <div className="cart-header-labels label-caps">
                  <div style={{ fontSize: '0.7rem' }}>Product</div>
                  <div style={{ fontSize: '0.7rem' }}>Price</div>
                  <div style={{ fontSize: '0.7rem', textAlign: 'center' }}>Quantity</div>
                  <div style={{ fontSize: '0.7rem', textAlign: 'right' }}>Total</div>
                  <div style={{ fontSize: '0.7rem' }}></div>
                </div>

                {cart.map((item, index) => {
                  const basePrice = parsePrice(item.price);
                  const itemTotal = basePrice * (item.quantity || 1);

                  return (
                    <div key={index} className="cart-item-wrapper" style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="cart-item-row">
                        <div className="cart-item-info">
                          <div className="cart-item-image">
                            <img src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div className="cart-item-details">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                            <div className="label-caps category" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{item.category}</div>
                            
                            {item.giftOptions?.selectedNote && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span className="material-icons" style={{ fontSize: '0.9rem' }}>spa</span>
                                <span>{item.giftOptions.selectedNote}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="cart-item-price-unit" style={{ fontSize: '0.95rem' }}>
                          <div>{fmtINR(basePrice)}</div>
                        </div>
                        
                        <div className="cart-item-qty">
                          <button onClick={() => updateQuantity(index, -1)}>-</button>
                          <span>{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(index, 1)}>+</button>
                        </div>

                        <div className="cart-item-total-price">
                          {fmtINR(itemTotal)}
                        </div>

                        <div className="cart-item-delete">
                          <button 
                            onClick={() => removeItem(index)} 
                            aria-label="Remove item"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#991b1b'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#ccc'}
                          >
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete_outline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={handleProceedToPayment} style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                    <input type="text" required value={details.name} onChange={e => setDetails({...details, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                    <input type="tel" required value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" required value={details.email} onChange={e => setDetails({...details, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Delivery Address</label>
                  <input type="text" required value={details.address} onChange={e => setDetails({...details, address: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} placeholder="Street address, Apartment, Suite, etc." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>City</label>
                    <input type="text" required value={details.city} onChange={e => setDetails({...details, city: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>State</label>
                    <input type="text" required value={details.state} onChange={e => setDetails({...details, state: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>ZIP Code</label>
                    <input type="text" required value={details.zip} onChange={e => setDetails({...details, zip: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setCheckoutStep('cart')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', padding: '1rem' }} className="label-caps">Back to Bag</button>
                  <button type="submit" className="btn-primary label-caps" style={{ flex: 2, padding: '1rem' }}>Proceed to Payment</button>
                </div>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Open any UPI application (Google Pay, PhonePe, Paytm, BHIM) and scan the QR code below or copy the UPI ID to complete your payment of <strong>{fmtINR(subtotal)}</strong>.
                  </p>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', border: '1px solid var(--border)', background: '#faf9f7', borderRadius: '4px', maxWidth: '300px', margin: '0 auto' }}>
                  <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} />
                  <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>Scan QR Code to Pay</span>
                </div>

                {/* UPI ID Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                  <label className="label-caps" style={{ fontSize: '0.65rem', color: '#888' }}>UPI ID</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)', padding: '0.75rem 1rem', background: '#fff', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: '0.95rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>{upiId}</code>
                    <button onClick={handleCopyUpiId} className="label-caps" style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.6rem', cursor: 'pointer' }}>
                      {copyFeedback ? 'COPIED!' : 'COPY ID'}
                    </button>
                  </div>
                </div>

                {/* UTR Reference Input */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>UPI Transaction Reference Number (UTR)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter 12-digit UTR / Reference number"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={12}
                    style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }} 
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    *You must enter the 12-digit UTR/Reference Number from your payment confirmation screen to submit the order.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px', margin: '1rem auto 0 auto', width: '100%' }}>
                  <button type="button" onClick={() => setCheckoutStep('details')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', padding: '1rem' }} className="label-caps">Back</button>
                  <button 
                    type="button" 
                    onClick={handlePlaceOrder}
                    disabled={!utr.trim() || utr.trim().length < 12 || isPlacing} 
                    className="btn-primary label-caps" 
                    style={{ flex: 2, padding: '1rem', opacity: (!utr.trim() || utr.trim().length < 12 || isPlacing) ? 0.5 : 1, cursor: (!utr.trim() || utr.trim().length < 12 || isPlacing) ? 'not-allowed' : 'pointer' }}
                  >
                    {isPlacing ? 'PLACING...' : 'PLACE ORDER'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Order Summary Panel */}
          <div style={{ background: '#faf9f7', padding: '2.5rem', border: '1px solid var(--border)', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span>{fmtINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Shipping</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>COMPLIMENTARY</span>
            </div>

            {savings > 0 && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px dashed #166534', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>YOU SAVED</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>{fmtINR(savings)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total Amount</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, display: 'block' }}>{fmtINR(subtotal)}</span>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <button onClick={handleCheckoutNow} className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>Checkout Now</button>
            )}

            {checkoutStep === 'details' && (
              <button onClick={handleProceedToPayment} className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>Proceed to Payment</button>
            )}

            {checkoutStep === 'payment' && (
              <button 
                onClick={handlePlaceOrder}
                disabled={!utr.trim() || utr.trim().length < 12 || isPlacing}
                className="btn-primary label-caps" 
                style={{ width: '100%', padding: '1.25rem', opacity: (!utr.trim() || utr.trim().length < 12 || isPlacing) ? 0.5 : 1, cursor: (!utr.trim() || utr.trim().length < 12 || isPlacing) ? 'not-allowed' : 'pointer' }}
              >
                {isPlacing ? 'PLACING...' : 'PLACE ORDER'}
              </button>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/all-products" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Or Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';
import { isVideoUrl } from '@/lib/products';

// Helper to dynamically load the Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [placedPaymentId, setPlacedPaymentId] = useState('');
  const [placedOrderAmount, setPlacedOrderAmount] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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
    setCheckoutStep('payment');
  };

  const initializePayment = async () => {
    setIsPlacing(true);
    setPaymentError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal,
          cart: cart.map(item => ({
            id: item.id || null,
            name: item.name || '',
            price: item.price || '',
            quantity: item.quantity || 1,
            category: item.category || '',
            image: item.image || item.images?.[0] || '',
            giftOptions: item.giftOptions || null
          })),
          customerDetails: details
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      const { razorpayOrderId, orderId, amount: calculatedAmount, keyId } = orderData;

      const options = {
        key: keyId,
        amount: Math.round(calculatedAmount * 100),
        currency: "INR",
        name: "Ittar",
        description: `Order Checkout ${orderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: details.name,
          email: details.email,
          contact: details.phone,
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response) {
          setIsPlacing(true);
          try {
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
                userId: user?.uid || null,
                customerDetails: details,
                orderedProducts: cart,
                totalAmount: calculatedAmount
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setCart([]);
            localStorage.removeItem('cart');

            setPlacedOrderId(orderId);
            setPlacedPaymentId(response.razorpay_payment_id);
            setPlacedOrderAmount(calculatedAmount);
            setCheckoutStep('success');
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setPaymentError(verifyErr.message || "Could not verify payment signature.");
          } finally {
            setIsPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPlacing(false);
            setPaymentError("Payment was cancelled or closed. You can retry clicking the Pay Now button.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error("Payment failed event:", response.error);
        setIsPlacing(false);
        setPaymentError(response.error.description || "Payment transaction failed.");
      });

      paymentObject.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      setPaymentError(err.message || "An unexpected error occurred while initiating payment.");
      setIsPlacing(false);
    }
  };

  useEffect(() => {
    if (checkoutStep === 'payment') {
      initializePayment();
    }
  }, [checkoutStep]);

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
            <div style={{ background: '#faf9f7', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '4px', maxWidth: '400px', margin: '0 auto 2.5rem auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span className="label-caps" style={{ fontSize: '0.65rem', color: '#888', display: 'block' }}>Payment ID</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{placedPaymentId}</span>
              </div>
              <div>
                <span className="label-caps" style={{ fontSize: '0.65rem', color: '#888', display: 'block' }}>Amount Paid</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fmtINR(placedOrderAmount || 0)}</span>
              </div>
              <div>
                <span className="label-caps" style={{ fontSize: '0.65rem', color: '#888', display: 'block' }}>Status</span>
                <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem' }}>check_circle</span> Payment Successful
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Your order has been confirmed and is now being processed.
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

  // Razorpay integration requires no QR code URL calculation on client side

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
            {checkoutStep === 'payment' && 'Complete Payment'}
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
                          <div className="cart-item-image" style={{ position: 'relative', overflow: 'hidden' }}>
                            {isVideoUrl(item.image || item.images?.[0]) ? (
                              <video src={item.image || item.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline autoPlay loop />
                            ) : (
                              <img src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
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
              <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--primary)', animation: isPlacing ? 'spin 2s linear infinite' : 'none' }}>
                  {isPlacing ? 'sync' : 'payment'}
                </span>
                
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
                  {isPlacing ? 'Initiating Secure Payment...' : 'Payment Authentication'}
                </h2>

                <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {isPlacing 
                    ? 'Please wait while we connect to Razorpay secure checkout. Do not reload or close this page.'
                    : 'Click the button below to resume your payment checkout.'
                  }
                </p>

                {paymentError && (
                  <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    {paymentError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px', margin: '1rem auto 0 auto', width: '100%' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPaymentError('');
                      setCheckoutStep('details');
                    }} 
                    style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', padding: '1rem' }} 
                    className="label-caps"
                    disabled={isPlacing}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={initializePayment}
                    disabled={isPlacing} 
                    className="btn-primary label-caps" 
                    style={{ flex: 2, padding: '1rem', opacity: isPlacing ? 0.5 : 1, cursor: isPlacing ? 'not-allowed' : 'pointer' }}
                  >
                    {isPlacing ? 'PROCESSING...' : 'PAY NOW'}
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
                onClick={initializePayment}
                disabled={isPlacing}
                className="btn-primary label-caps" 
                style={{ width: '100%', padding: '1.25rem', opacity: isPlacing ? 0.5 : 1, cursor: isPlacing ? 'not-allowed' : 'pointer' }}
              >
                {isPlacing ? 'PROCESSING...' : 'PAY NOW'}
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

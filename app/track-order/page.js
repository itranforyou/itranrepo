'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

const fmtINR = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function TrackOrderPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAppContext();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Logged-in user orders state
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch recent orders for logged-in user
  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      setUserOrders([]);
      return;
    }

    setLoadingOrders(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.orderId || doc.id,
          rawDate: data.orderDate?.seconds ? data.orderDate.seconds * 1000 : (data.orderDate ? new Date(data.orderDate).getTime() : 0),
          date: data.orderDate?.seconds 
            ? new Date(data.orderDate.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
            : (data.orderDate ? new Date(data.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending'),
          total: data.totalAmount,
          status: data.orderStatus,
          itemsCount: data.orderedProducts?.length || 0
        };
      });

      // Sort descending
      fetched.sort((a, b) => b.rawDate - a.rawDate);
      setUserOrders(fetched);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error loading user orders:", error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  const fetchOrder = async (searchId, searchPhone) => {
    setLoading(true);
    setError('');
    try {
      const orderDocRef = doc(db, 'orders', searchId.trim());
      const orderDocSnap = await getDoc(orderDocRef);

      if (!orderDocSnap.exists()) {
        setError('Order not found. Please check your Order ID.');
        setTrackingData(null);
        setLoading(false);
        return;
      }

      const orderData = orderDocSnap.data();

      // Verify phone number if provided
      if (searchPhone.trim()) {
        const cleanOrderPhone = orderData.customerDetails?.phone?.replace(/\s+/g, '').replace(/[^0-9]/g, '');
        const cleanInputPhone = searchPhone.replace(/\s+/g, '').replace(/[^0-9]/g, '');

        if (cleanOrderPhone && cleanInputPhone && !cleanOrderPhone.endsWith(cleanInputPhone) && !cleanInputPhone.endsWith(cleanOrderPhone)) {
          setError('Verification failed. Phone number does not match this Order ID.');
          setTrackingData(null);
          setLoading(false);
          return;
        }
      }

      setTrackingData(orderData);
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrder(orderId, phone);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id');
      if (queryId) {
        setOrderId(queryId);
        fetchOrder(queryId, '');
      }
    }
  }, []);

  const getTrackingSteps = (status, date) => {
    const orderDateStr = date?.seconds 
      ? new Date(date.seconds * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : (date ? new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending');

    const steps = [
      { msg: 'Order Placed & Confirmed', time: orderDateStr, done: true },
      { msg: 'Payment Verification', time: status === 'Pending Verification' ? 'Pending' : 'Completed', done: status !== 'Pending Verification' && status !== 'Cancelled' },
      { msg: 'Order Processing', time: (status === 'Pending Verification' || status === 'Paid') ? 'Pending' : 'Completed', done: !['Pending Verification', 'Paid', 'Cancelled'].includes(status) },
      { msg: 'Shipped & In Transit', time: ['Shipped', 'Delivered'].includes(status) ? 'Completed' : 'Pending', done: ['Shipped', 'Delivered'].includes(status) },
      { msg: 'Delivered', time: status === 'Delivered' ? 'Completed' : 'Pending', done: status === 'Delivered' }
    ];

    if (status === 'Cancelled') {
      steps.splice(1, 4, { msg: 'Order Cancelled', time: 'Cancelled', done: true });
    }

    return steps;
  };

  const hasRecentOrders = isLoggedIn && userOrders.length > 0;

  return (
    <div style={{ paddingTop: '120px', minHeight: '90vh', background: 'var(--background)', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: trackingData ? '600px' : (hasRecentOrders ? '1100px' : '600px') }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Logistic Journey</div>
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Track Order</h1>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
              Trace the silent path of your artisanal fragrance order by selecting a recent order or entering your details below.
            </p>
          </Reveal>

          {!trackingData ? (
            <div style={{ display: 'grid', gridTemplateColumns: hasRecentOrders ? '1fr 1.2fr' : '1fr', gap: '3rem', alignItems: 'start' }}>
              
              {/* Section 1: Manual ID Tracking */}
              <Reveal>
                <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
                  <h2 className="label-caps" style={{ fontSize: '0.85rem', marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', letterSpacing: '0.15em' }}>Track with Order ID</h2>
                  <form onSubmit={handleTrackSubmit}>
                    {error && (
                      <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        {error}
                      </div>
                    )}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.75rem' }}>Order ID</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. SS-98234"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', fontSize: '1rem' }} 
                      />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.75rem' }}>Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', fontSize: '1rem' }} 
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>
                      {loading ? 'TRACING...' : 'TRACK SHIPMENT'}
                    </button>
                  </form>

                  {!isLoggedIn && (
                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)', borderTop: '1px solid #f9f9f9', paddingTop: '1.5rem' }}>
                      <Link href="/login" style={{ textDecoration: 'underline', color: 'var(--foreground)', fontWeight: 500 }}>Sign In</Link> to view and track your recent orders instantly.
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Section 2: Logged-in customer orders tracking */}
              {hasRecentOrders && (
                <Reveal delay={0.1}>
                  <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
                    <h2 className="label-caps" style={{ fontSize: '0.85rem', marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', letterSpacing: '0.15em' }}>Quick Track Recent Orders</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {userOrders.map((order) => (
                        <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '1.25rem', gap: '1rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.id}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                              {order.date} · {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''} · {fmtINR(order.total)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: order.status === 'Delivered' ? '#166534' : 'var(--primary)', marginTop: '0.25rem', fontWeight: 600 }}>
                              {order.status}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setOrderId(order.id);
                              fetchOrder(order.id, '');
                            }} 
                            className="btn-primary label-caps" 
                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.6rem', flexShrink: 0 }}
                          >
                            Track
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

            </div>
          ) : (
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Header Block */}
                <div style={{ background: '#fff', padding: '3.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2rem' }}>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Status</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{trackingData.orderStatus}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Order Date</div>
                      <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                        {trackingData.orderDate?.seconds 
                          ? new Date(trackingData.orderDate.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : (trackingData.orderDate ? new Date(trackingData.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Pending')}
                      </div>
                    </div>
                  </div>

                  {/* Steps Progress */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', marginBottom: '1rem' }}>
                    <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#f0f0f0', zIndex: 0 }}></div>
                    
                    {getTrackingSteps(trackingData.orderStatus, trackingData.orderDate).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          background: step.done ? 'var(--primary)' : '#fff', 
                          border: step.done ? 'none' : '2px solid #f0f0f0',
                          marginTop: '4px',
                          flexShrink: 0
                        }}></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem', color: step.done ? '#000' : '#888' }}>{step.msg}</div>
                          <div className="label-caps" style={{ fontSize: '0.6rem', color: '#999' }}>{step.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Block */}
                <div style={{ background: '#fff', padding: '3.5rem', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Order Details</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.25rem' }}>Order ID</div>
                      <div style={{ fontWeight: 600 }}>{trackingData.orderId}</div>
                    </div>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.25rem' }}>Customer Details</div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                        <strong>{trackingData.customerDetails?.name}</strong><br />
                        {trackingData.customerDetails?.phone} | {trackingData.customerDetails?.email}<br />
                        {trackingData.customerDetails?.address}, {trackingData.customerDetails?.city}, {trackingData.customerDetails?.state} - {trackingData.customerDetails?.zip}
                      </div>
                    </div>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.25rem' }}>Payment Method</div>
                      <div style={{ fontSize: '0.95rem' }}>UPI (UTR: {trackingData.utrNumber})</div>
                    </div>
                  </div>

                  <h4 className="label-caps" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>Ordered Products</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {trackingData.orderedProducts?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                        <div>
                          <strong>{item.name}</strong> <span style={{ color: '#888', fontSize: '0.8rem' }}>x{item.quantity}</span>
                          {item.giftOptions?.selectedNote && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                              Note: {item.giftOptions.selectedNote}
                            </div>
                          )}
                        </div>
                        <div>{fmtINR(item.price ? parseFloat(item.price.replace(/[^\d.]/g, '')) : 0)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #000', paddingTop: '1.5rem' }}>
                    <div className="label-caps" style={{ fontWeight: 700 }}>Total Amount Paid</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{fmtINR(trackingData.totalAmount)}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => {
                      setTrackingData(null);
                      setPhone('');
                      // If the original URL had a query ID, clear it in the browser address bar
                      router.replace('/track-order');
                    }} 
                    style={{ background: 'none', border: 'none', borderBottom: '1px solid #000', cursor: 'pointer', padding: 0 }}
                    className="label-caps"
                  >
                    Track Another Order
                  </button>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

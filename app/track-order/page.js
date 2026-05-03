'use client';

import { useState } from 'react';
import Reveal from '@/components/Reveal';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        id: orderId,
        status: 'In Transit',
        lastLocation: 'Mumbai Distribution Center',
        estimatedDelivery: 'May 5, 2026',
        steps: [
          { time: 'May 1, 09:00 AM', msg: 'Order Placed & Confirmed', done: true },
          { time: 'May 1, 02:30 PM', msg: 'Hand-poured & Packaged', done: true },
          { time: 'May 2, 11:00 AM', msg: 'Picked up by Courier', done: true },
          { time: 'May 2, 08:45 PM', msg: 'Arrived at Mumbai Hub', done: false },
          { time: 'Waiting', msg: 'Out for Delivery', done: false }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ paddingTop: '120px', minHeight: '90vh', background: 'var(--background)' }}>
      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>Logistic Journey</div>
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Track Your Order</h1>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              Enter your unique order identifier to trace the silent path of your signature scent.
            </p>
          </Reveal>

          {!trackingData ? (
            <Reveal>
              <form onSubmit={handleTrack} style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '2rem' }}>
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
                <button type="submit" disabled={loading} className="btn-primary label-caps" style={{ width: '100%', padding: '1.25rem' }}>
                  {loading ? 'TRACING...' : 'TRACK SHIPMENT'}
                </button>
              </form>
            </Reveal>
          ) : (
            <Reveal>
              <div style={{ background: '#fff', padding: '3.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2rem' }}>
                  <div>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Status</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{trackingData.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="label-caps" style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem' }}>Estimate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{trackingData.estimatedDelivery}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#f0f0f0', zIndex: 0 }}></div>
                  
                  {trackingData.steps.map((step, idx) => (
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

                <button 
                  onClick={() => setTrackingData(null)} 
                  style={{ marginTop: '4rem', background: 'none', border: 'none', borderBottom: '1px solid #000', cursor: 'pointer', padding: 0 }}
                  className="label-caps"
                >
                  Track Another Order
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useAppContext } from "@/context/AppContext";

export default function NotificationToast() {
  const { notification } = useAppContext();
  
  if (!notification) return null;
  
  const isError = 
    notification.toLowerCase().includes('wrong') || 
    notification.toLowerCase().includes('not registered') || 
    notification.toLowerCase().includes('already registered') ||
    notification.toLowerCase().includes('invalid') ||
    notification.toLowerCase().includes('failed');

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      color: '#1a1a1a',
      padding: '1rem 2rem',
      fontSize: '0.8rem',
      zIndex: 10000,
      boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
      border: isError ? '1px solid #fee2e2' : '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: 'none',
      borderRadius: '40px'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        background: isError ? '#ef4444' : '#10b981',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        animation: 'scaleIn 0.3s ease 0.2s both'
      }}>
        <span className="material-icons" style={{ fontSize: '14px', color: '#fff' }}>
          {isError ? 'close' : 'check'}
        </span>
      </div>
      <span className="label-caps" style={{ letterSpacing: '0.1em' }}>{notification}</span>
      
      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

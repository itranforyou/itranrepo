'use client';

import { useState } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, setUserAvatar, userAvatar } = useAppContext();

  const avatars = [
    { name: 'Felix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
    { name: 'Milo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Milo' },
    { name: 'Bubba', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bubba' },
    { name: 'Lilly', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lilly' },
    { name: 'Daisy', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Daisy' },
    { name: 'Luna', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna' },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { auth, googleProvider } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsLoggedIn(true);
        window.location.href = '/';
      }
    } catch (error) {
      alert("Failed to sign in with Google: " + error.message);
    } finally { setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isRegister && step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName, photoURL: userAvatar });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      setIsLoggedIn(true);
      window.location.href = '/';
    } catch (error) {
      alert(error.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <Reveal>
          <div style={{ background: '#fff', padding: '3.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {isRegister ? (step === 1 ? 'Join Us' : 'Pick a Buddy') : 'Welcome Back'}
            </h1>
            
            <form onSubmit={handleEmailAuth} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {isRegister && step === 1 && (
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                </div>
              )}
              
              {step === 1 && (
                <>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                </>
              )}

              {isRegister && step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', margin: '1.5rem 0' }}>
                  {avatars.map((av, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setUserAvatar(av.url)}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '10px', 
                        border: userAvatar === av.url ? '2px solid #000' : '1px solid #eee',
                        borderRadius: '12px',
                        background: userAvatar === av.url ? '#f5f5f5' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={av.url} alt={av.name} style={{ width: '100%', borderRadius: '8px' }} />
                      <div className="label-caps" style={{ fontSize: '0.5rem', textAlign: 'center', marginTop: '0.5rem', color: '#888' }}>{av.name}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <button type="submit" disabled={loading} className="btn-primary label-caps" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                {loading ? 'PROCESSING...' : (isRegister ? (step === 1 ? 'Next: Pick a Buddy' : 'Let\'s Go!') : 'Sign In')}
              </button>

              {step === 1 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
                  </div>

                  <button type="button" onClick={handleGoogleSignIn} style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                    CONTINUE WITH GOOGLE
                  </button>
                </>
              )}
            </form>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                {isRegister ? 'Already have an account?' : 'New to Scented Silence?'}
                <button onClick={() => { setIsRegister(!isRegister); setStep(1); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  {isRegister ? 'Sign In' : 'Create One'}
                </button>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

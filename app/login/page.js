'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, setUserAvatar, userAvatar, setNotification } = useAppContext();

  const avatars = [
    { name: 'Felix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
    { name: 'Milo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Milo' },
    { name: 'Bubba', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bubba' },
    { name: 'Lilly', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lilly' },
    { name: 'Daisy', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Daisy' },
    { name: 'Luna', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna' },
  ];



  const handleResetPassword = async (e) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) { alert("Please enter your email address first."); return; }
    setLoading(true);
    console.log("Attempting password reset for:", targetEmail);
    try {
      const { auth } = await import('@/lib/firebase');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, targetEmail);
      console.log("Reset email sent successfully to:", targetEmail);
      setNotification("Reset Ritual Sent");
      setResetSent(true);
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error("Firebase Reset Error:", error.code, error.message);
      const msg = error.code === 'auth/user-not-found' ? "Email not registered." : error.message;
      setNotification(msg);
      setTimeout(() => setNotification(null), 4000);
    } finally { setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isReset) {
      handleResetPassword(e);
      return;
    }
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
      let msg = "Email or password is wrong."; // Default for most auth errors
      if (error.code === 'auth/user-not-found') {
        msg = "the email is not registered";
      } else if (error.code === 'auth/email-already-in-use') {
        msg = "This email is already registered.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      }
      
      setNotification(msg);
      setTimeout(() => setNotification(null), 4000);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', position: 'relative' }}>
      {/* Floating Back Button */}
      <div className="floating-back">
        <button onClick={() => router.back()} className="back-btn" aria-label="Go Back">
          <span className="material-icons">arrow_back</span>
        </button>
      </div>
      <div className="container" style={{ maxWidth: '450px' }}>
        <Reveal>
          <div style={{ background: '#fff', padding: '3.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {isReset ? (resetSent ? 'Check Email' : 'Reset Silence') : isRegister ? (step === 1 ? 'Join Us' : 'Pick a Buddy') : 'Welcome Back'}
            </h1>
            
            <form onSubmit={handleEmailAuth} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {isRegister && step === 1 && (
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                </div>
              )}
              
              {step === 1 && !resetSent && (
                <>
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                  </div>
                  {!isReset && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="label-caps" style={{ fontSize: '0.65rem' }}>Password</label>
                        {!isRegister && (
                          <button type="button" onClick={() => setIsReset(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.6rem', cursor: 'pointer' }} className="label-caps">Forgot Password?</button>
                        )}
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid var(--border)', background: 'transparent' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                      >
                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {resetSent && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                    A recovery ritual has been sent to <strong>{email}</strong>. Please check your inbox to restore your access and <strong style={{ color: 'var(--primary)', borderBottom: '1px solid var(--primary)' }}>check your spam section too</strong> if it doesn't appear!
                  </p>
                  <button type="button" onClick={() => { setIsReset(false); setResetSent(false); }} className="label-caps" style={{ background: 'none', border: 'none', color: 'var(--primary)', marginTop: '2rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Back to Login</button>
                </div>
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
              
              {!resetSent && (
                <button type="submit" disabled={loading} className="btn-primary label-caps" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                  {loading ? 'PROCESSING...' : (isReset ? 'SEND RESET LINK' : isRegister ? (step === 1 ? 'Next: Pick a Buddy' : 'Let\'s Go!') : 'Sign In')}
                </button>
              )}

              {isReset && !resetSent && (
                <button type="button" onClick={() => setIsReset(false)} className="label-caps" style={{ background: 'none', border: 'none', color: '#888', marginTop: '1rem', cursor: 'pointer', fontSize: '0.65rem' }}>Cancel Reset</button>
              )}

              {step === 1 && (
                <>

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

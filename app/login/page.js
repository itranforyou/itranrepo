'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useAppContext } from '@/context/AppContext';

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, isLoggedIn, setUserAvatar, userAvatar, setNotification } = useAppContext();
  
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);





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

    
    setLoading(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      if (isRegister) {
        try {
          console.log("Attempting signup for:", email.trim());
          const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await updateProfile(result.user, { displayName: fullName, photoURL: userAvatar });
          await setDoc(doc(db, "users", result.user.uid), {
            fullName,
            email,
            avatar: userAvatar,
            createdAt: new Date().toISOString()
          });
        } catch (regError) {
          if (regError.code === 'auth/email-already-in-use') {
            // Attempt to 'self-heal' if Firestore doc is missing but Auth exists
            try {
              const signResult = await signInWithEmailAndPassword(auth, email.trim(), password);
              const userSnap = await getDoc(doc(db, "users", signResult.user.uid));
              
              if (!userSnap.exists()) {
                // Heal the account: Create the missing Firestore doc
                await setDoc(doc(db, "users", signResult.user.uid), {
                  fullName,
                  email,
                  avatar: userAvatar,
                  createdAt: new Date().toISOString(),
                  healedAt: new Date().toISOString()
                });
              } else {
                // Account really does exist fully
                throw regError;
              }
            } catch (healError) {
              // If sign-in fails, it means the password for the existing account is wrong
              const errorWithContext = new Error("This email is already in use with a different password.");
              errorWithContext.code = 'auth/wrong-password'; 
              throw errorWithContext;
            }
          } else {
            throw regError;
          }
        }
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (!userDoc.exists()) {
          await auth.signOut();
          throw { code: 'auth/user-not-found' };
        }
      }
      
      setIsLoggedIn(true);
      router.push('/');
    } catch (error) {
      console.error("DEBUG: Auth error caught:", error.code, error.message);
      let msg = "Something went wrong. Please check your credentials.";
      
      if (error.code === 'auth/invalid-email') {
        msg = "The email address is invalid.";
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = "Email/Password sign-in is not enabled in Firebase Console.";
      } else if (error.code === 'auth/email-already-in-use') {
        msg = "This email is already registered.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        try {
          const { db } = await import('@/lib/firebase');
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          // Check if this email exists in our records at all
          const q = query(collection(db, "users"), where("email", "==", email.trim()));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            msg = isRegister ? "This email is already in use. Please sign in instead." : "The password you entered is incorrect.";
          } else {
            msg = "This email is not registered with us.";
          }
        } catch (e) {
          msg = "Incorrect email or password.";
        }
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
              {isReset ? (resetSent ? 'Check Email' : 'Reset Silence') : isRegister ? 'Join Us' : 'Welcome Back'}
            </h1>
            
            <form onSubmit={handleEmailAuth} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {isRegister && (
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }} />
                </div>
              )}
              
              {!resetSent && (
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


              
              {!resetSent && (
                <button type="submit" disabled={loading} className="btn-primary label-caps" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                  {loading ? 'PROCESSING...' : (isReset ? 'SEND RESET LINK' : isRegister ? 'Join the Silence' : 'Sign In')}
                </button>
              )}

              {isReset && !resetSent && (
                <button type="button" onClick={() => setIsReset(false)} className="label-caps" style={{ background: 'none', border: 'none', color: '#888', marginTop: '1rem', cursor: 'pointer', fontSize: '0.65rem' }}>Cancel Reset</button>
              )}


            </form>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                {isRegister ? 'Already have an account?' : 'New to Scented Silence?'}
                <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
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

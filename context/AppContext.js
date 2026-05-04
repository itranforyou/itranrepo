'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [userAvatar, setUserAvatar] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
  const [user, setUser] = useState(null);

  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    // 1. Recover basic state from local storage immediately for speed
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const savedWish = localStorage.getItem('wishlist');
    if (savedWish) setWishlist(JSON.parse(savedWish));

    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) setUserAvatar(savedAvatar);

    // 2. Setup Firebase Listeners
    const productsUnsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setProducts(data);
      setLoading(false);
    }, (error) => {
      console.error("Products listener error:", error);
      setLoading(false);
    });

    const authUnsubscribe = onAuthStateChanged(auth, async (u) => {
      setIsRestoring(true);
      if (u && u.uid) {
        setIsLoggedIn(true);
        setUser(u);
        try {
          const uid = u.uid;
          const [userSnap, cartSnap, wishSnap] = await Promise.all([
            getDoc(doc(db, "users", uid)),
            getDoc(doc(db, "carts", uid)),
            getDoc(doc(db, "wishlists", uid))
          ]);

          if (userSnap.exists() && userSnap.data().avatar) setUserAvatar(userSnap.data().avatar);
          if (cartSnap.exists()) setCart(cartSnap.data().items || []);
          if (wishSnap.exists()) setWishlist(wishSnap.data().items || []);
        } catch (err) {
          console.error("Restoration error:", err);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setCart([]);
        setWishlist([]);
        setUserAvatar('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
      }
      setIsRestoring(false);
    });

    return () => {
      productsUnsubscribe();
      authUnsubscribe();
    };
  }, []);

  // Sync to Cloud with Debounce for Performance
  useEffect(() => {
    if (!isLoggedIn || isRestoring || !user?.uid) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    const currentUid = user.uid;
    const currentEmail = user.email;

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        if (currentUid) {
          await Promise.all([
            setDoc(doc(db, "users", currentUid), { avatar: userAvatar, email: currentEmail, lastSeen: new Date().toISOString() }, { merge: true }),
            setDoc(doc(db, "carts", currentUid), { items: cart, updatedAt: new Date().toISOString() }, { merge: true }),
            setDoc(doc(db, "wishlists", currentUid), { items: wishlist, updatedAt: new Date().toISOString() }, { merge: true })
          ]);
        }
      } catch (err) {}
    }, 1500); // 1.5s debounce for stability

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    localStorage.setItem('userAvatar', userAvatar);

    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [cart, wishlist, userAvatar, isLoggedIn, isRestoring, user]);

  const addToCart = (product) => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    setCart(prev => {
      const newCart = [...prev];
      const existing = newCart.find(item => item.id === product.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        newCart.push({ ...product, quantity: 1 });
      }
      return newCart;
    });
    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleWishlist = (product) => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    setWishlist(prev => {
      const newWish = [...prev];
      const index = newWish.findIndex(item => item.id === product.id);
      if (index > -1) {
        newWish.splice(index, 1);
        setNotification(`Removed from wishlist`);
      } else {
        newWish.push(product);
        setNotification(`Added to wishlist!`);
      }
      return newWish;
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const logout = async () => {
    await signOut(auth);
    setCart([]);
    setWishlist([]);
    setUserAvatar('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const contextValue = useMemo(() => ({
    cart, setCart, addToCart, wishlist, setWishlist, toggleWishlist,
    isLoggedIn, setIsLoggedIn, logout,
    isSearchOpen, setIsSearchOpen, selectedProduct, setSelectedProduct,
    products, loading, notification, setNotification,
    userAvatar, setUserAvatar, user
  }), [cart, wishlist, isLoggedIn, isSearchOpen, selectedProduct, products, loading, notification, userAvatar, user]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

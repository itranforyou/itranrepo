'use client';

import { useState, useEffect } from 'react';
import { addProduct, getProducts, updateProduct, deleteProduct, isVideoUrl } from '@/lib/products';
import Reveal from '@/components/Reveal';
import { db, auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

export default function ChangeProductPage() {
  // Firebase Auth state — replaces hardcoded credentials
  const [adminUser, setAdminUser] = useState(null);      // Firebase User object when verified
  const [authLoading, setAuthLoading] = useState(true);  // true while onAuthStateChanged resolves
  const [authError, setAuthError] = useState('');        // login error message
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('add'); // 'add', 'manage', 'packaging', or 'enquiries'

  // Orders and settings state
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [upiIdSetting, setUpiIdSetting] = useState('itranforyou06@okaxis');
  const [savingSettings, setSavingSettings] = useState(false);

  const fmtINR = (amount) =>
    '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  
  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryFilter, setEnquiryFilter] = useState('All');

  // Contact Enquiries state
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState('All');
  
  // States for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    subName: '',
    inspiredBy: '',
    price: '',
    costPrice: '',
    isOffer: false,
    category: 'Him',
    description: '',
    notes: [],
    size: '',
    isBestSeller: false,
    inStock: true,
    giftSize: 1,
    giftFor: 'Him',
    giftProducts: []
  });
  const [urlInputs, setUrlInputs] = useState(['']);
  const [editingId, setEditingId] = useState(null);
  const [giftProductSearch, setGiftProductSearch] = useState('');
  

  
  // Realms state
  const [realms, setRealms] = useState([]);
  const [editingRealmId, setEditingRealmId] = useState(null);
  const [realmData, setRealmData] = useState({ name: '', img: '', targetType: 'category', categorySlug: 'perfume-oil', productIds: [] });
  


  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');



  const categories = ['Him', 'Her', 'Unisex', 'Car Diffuser', 'Home Diffuser', 'Dhoop Sticks', 'Gift'];

  const addUrlField = () => setUrlInputs([...urlInputs, '']);
  const removeUrlField = (index) => setUrlInputs(urlInputs.filter((_, i) => i !== index));
  const updateUrlField = (index, value) => {
    const newUrls = [...urlInputs];
    newUrls[index] = value;
    setUrlInputs(newUrls);
  };

  const addNoteField = () => {
    const currentNotes = Array.isArray(formData.notes) ? formData.notes : [];
    setFormData({...formData, notes: [...currentNotes, { name: '', image: '' }]});
  };
  const removeNoteField = (index) => {
    const currentNotes = Array.isArray(formData.notes) ? formData.notes : [];
    setFormData({...formData, notes: currentNotes.filter((_, i) => i !== index)});
  };
  const updateNoteField = (index, field, value) => {
    const currentNotes = Array.isArray(formData.notes) ? formData.notes : [];
    const newNotes = [...currentNotes];
    newNotes[index][field] = value;
    setFormData({...formData, notes: newNotes});
  };

  /**
   * Firebase Auth login — no credentials in source code.
   * After sign-in, calls /api/admin/verify to confirm the UID
   * exists in the Firestore `admins` collection with role === 'admin'.
   */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);
    try {
      // 1. Sign in with Firebase Authentication
      const credential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const idToken = await credential.user.getIdToken();

      // 2. Server-side role verification — secret key never touches the browser
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (!data.authorized) {
        // Not in the admins collection — sign them out immediately
        await signOut(auth);
        setAuthError('Access denied. This account is not authorised as admin.');
      }
      // If authorized, onAuthStateChanged will set adminUser automatically
    } catch (err) {
      // Map Firebase error codes to friendly messages
      const friendlyErrors = {
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      setAuthError(friendlyErrors[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setAdminUser(null);
    setLoginEmail('');
    setLoginPassword('');
  };

  const fetchInventory = async () => {
    try {
      const data = await getProducts();
      setInventory(data);
      setConnectionStatus('Connected Successfully');
    } catch (err) {
      setConnectionStatus('Connection Failed');
    }
  };

  /**
   * Resolve Firebase Auth session on mount.
   * onAuthStateChanged fires immediately if a session exists (page refresh)
   * or after login. We then verify the UID against the `admins` collection.
   */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Re-verify role every time the auth state changes
        try {
          const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminSnap.exists() && adminSnap.data()?.role === 'admin') {
            setAdminUser(firebaseUser);
          } else {
            // Firebase user exists but is not an admin — sign out
            await signOut(auth);
            setAdminUser(null);
          }
        } catch {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Load all admin data once the verified admin session is established
  useEffect(() => {
    if (!adminUser) return;

    fetchInventory();

    // Real-time listener for enquiries
    const q = query(collection(db, 'bulkEnquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const enquiryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnquiries(enquiryData);
    });

    // Real-time listener for contact enquiries
    const qContact = query(collection(db, 'contactEnquiries'), orderBy('createdAt', 'desc'));
    const unsubscribeContact = onSnapshot(qContact, (snapshot) => {
      const contactData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContactEnquiries(contactData);
    });

    // Real-time listener for realms
    const qRealms = query(collection(db, 'realms'), orderBy('createdAt', 'asc'));
    const unsubscribeRealms = onSnapshot(qRealms, (snapshot) => {
      const realmsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealms(realmsData);
    });

    // Real-time listener for orders
    const qOrders = query(collection(db, 'orders'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orderData);
    }, (err) => console.error('Error fetching orders:', err));

    // Fetch payment settings
    const fetchPaymentSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'payment'));
        if (settingsSnap.exists() && settingsSnap.data().upiId) {
          setUpiIdSetting(settingsSnap.data().upiId);
        }
      } catch (err) {
        console.error('Error fetching payment settings:', err);
      }
    };
    fetchPaymentSettings();

    return () => {
      unsubscribe();
      unsubscribeContact();
      unsubscribeRealms();
      unsubscribeOrders();
    };
  }, [adminUser]);

  const updateContactStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'contactEnquiries', id), { status: newStatus });
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const deleteContactEnquiry = async (id) => {
    if (!confirm('Permanently delete this enquiry?')) return;
    try {
      await deleteDoc(doc(db, 'contactEnquiries', id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const updateEnquiryStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'bulkEnquiries', id), { status: newStatus });
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!confirm('Permanently delete this enquiry?')) return;
    try {
      await deleteDoc(doc(db, 'bulkEnquiries', id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const updateOrderStatus = async (orderDocId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderDocId), { orderStatus: newStatus });
      alert('Order status updated successfully');
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const deleteOrder = async (orderDocId) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderDocId));
      alert('Order deleted successfully');
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    }
  };

  const updatePaymentStatus = async (orderDocId, newPaymentStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderDocId), { paymentStatus: newPaymentStatus });
    } catch (err) {
      alert('Failed to update payment status: ' + err.message);
    }
  };


  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'payment'), { upiId: upiIdSetting }, { merge: true });
      alert('UPI ID saved successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subName: '',
      inspiredBy: '',
      price: '',
      costPrice: '',
      isOffer: false,
      category: 'Him',
      description: '',
      notes: [],
      size: '',
      isBestSeller: false,
      inStock: true,
      giftSize: 1,
      giftFor: 'Him',
      giftProducts: []
    });
    setUrlInputs(['']);
    setEditingId(null);
    setMessage('');
    setGiftProductSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const productData = {
        ...formData,
        price: formData.price.toString().startsWith('Rs.') ? formData.price : `Rs. ${formData.price}`,
        costPrice: formData.isOffer && formData.costPrice ? (formData.costPrice.toString().startsWith('Rs.') ? formData.costPrice : `Rs. ${formData.costPrice}`) : null,
        images: urlInputs.filter(url => url.trim() !== '')
      };
      
      if (editingId) {
        await updateProduct(editingId, productData, []);
        setMessage('SUCCESS: Product updated!');
      } else {
        await addProduct(productData, []);
        setMessage('SUCCESS: Product added!');
      }
      
      fetchInventory();
      setTimeout(() => {
        resetForm();
        if (editingId) setActiveTab('manage');
      }, 2000);

    } catch (error) {
      setMessage(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      subName: product.subName || '',
      inspiredBy: product.inspiredBy || '',
      price: product.price?.toString().replace(/[^\d.]/g, '').replace(/^\.+/, '') || '',
      costPrice: product.costPrice?.toString().replace(/[^\d.]/g, '').replace(/^\.+/, '') || '',
      isOffer: !!product.costPrice,
      category: product.category || 'Him',
      description: product.description || product.desc || '',
      notes: Array.isArray(product.notes) ? product.notes : [],
      size: product.size || '',
      isBestSeller: product.isBestSeller || false,
      inStock: product.inStock !== false,
      giftSize: product.giftSize || 1,
      giftFor: product.giftFor === 'Unisex' ? 'Couple' : product.giftFor || 'Him',
      giftProducts: Array.isArray(product.giftProducts) ? product.giftProducts : []
    });
    setUrlInputs(product.images && product.images.length > 0 ? product.images : ['']);
    setGiftProductSearch('');
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchInventory();
      alert('Product deleted successfully');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const toggleStock = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      const newInStock = product.inStock === false ? true : false;
      await updateDoc(productRef, { inStock: newInStock });
      
      // Update local state instantly
      setInventory(prev => prev.map(p => p.id === product.id ? { ...p, inStock: newInStock } : p));
    } catch (err) {
      alert('Failed to update stock status: ' + err.message);
    }
  };

  const handleRealmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRealmId) {
        let finalHref = realmData.targetType === 'category' ? `/${realmData.categorySlug}` : `/realm/${editingRealmId}`;
        await updateDoc(doc(db, 'realms', editingRealmId), { ...realmData, href: finalHref });
        setMessage('SUCCESS: Realm updated!');
      } else {
        const docRef = await addDoc(collection(db, 'realms'), { ...realmData, createdAt: serverTimestamp(), href: '' });
        let finalHref = realmData.targetType === 'category' ? `/${realmData.categorySlug}` : `/realm/${docRef.id}`;
        await updateDoc(docRef, { href: finalHref });
        setMessage('SUCCESS: Realm added!');
      }
      setRealmData({ name: '', img: '', targetType: 'category', categorySlug: 'perfume-oil', productIds: [] });
      setEditingRealmId(null);
    } catch (err) {
      setMessage('ERROR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRealm = async (id) => {
    if (!confirm('Delete this realm?')) return;
    try {
      await deleteDoc(doc(db, 'realms', id));
      alert('Deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter Inventory
  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesFilter = inventoryFilter === 'All' || product.category === inventoryFilter;
    return matchesSearch && matchesFilter;
  });

  // Show a blank screen while Firebase resolves the existing session
  if (authLoading) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', background: '#faf9f7', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', background: '#faf9f7', display: 'flex', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '400px' }}>
          <Reveal>
            <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)' }}>Admin Access</h1>
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', paddingRight: '2.5rem' }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)',
                        padding: '0.25rem'
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {authError && (
                  <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0, padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-primary label-caps"
                  style={{ width: '100%', padding: '1rem' }}
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Verifying...' : 'Enter Dashboard'}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#faf9f7', paddingBottom: '100px' }}>
      <div className="container" style={{ maxWidth: '1000px', padding: '0 var(--spacing-gutter)' }}>

        {/* Admin session bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }} className="label-caps">
            {adminUser?.email}
          </span>
          <button
            onClick={handleAdminLogout}
            className="label-caps"
            style={{ fontSize: '0.6rem', padding: '0.4rem 1rem', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '4px' }}
          >
            Sign Out
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '4px', 
          marginBottom: '2rem', 
          background: 'var(--border)', 
          padding: '4px', 
          borderRadius: '8px' 
        }}>
          <button 
            onClick={() => { setActiveTab('add'); resetForm(); }}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'add' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            {editingId ? 'EDITING' : 'ADD PRODUCT'}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'manage' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            INVENTORY ({inventory.length})
          </button>

          <button 
            onClick={() => setActiveTab('enquiries')}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'enquiries' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            BULK ({enquiries.length})
          </button>
          <button 
            onClick={() => setActiveTab('contact-enquiries')}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'contact-enquiries' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            CONTACTS ({contactEnquiries.length})
          </button>
          <button 
            onClick={() => setActiveTab('realms')}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'realms' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            REALMS ({realms.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ 
              flex: '1 1 150px', 
              padding: '0.75rem 1rem', 
              background: activeTab === 'orders' ? '#fff' : 'transparent', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              transition: 'all 0.3s',
              fontSize: '0.65rem'
            }}
            className="label-caps"
          >
            ORDERS ({orders.length})
          </button>

        </div>

        {activeTab === 'add' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', margin: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h1>
                <div style={{ fontSize: '0.65rem', padding: '0.4rem 0.8rem', background: connectionStatus === 'Connected Successfully' ? '#f0fdf4' : '#fee2e2', color: connectionStatus === 'Connected Successfully' ? '#166534' : '#991b1b', border: '1px solid currentColor', borderRadius: '20px', fontWeight: 600 }}>
                  {connectionStatus.toUpperCase()}
                </div>
              </div>
              
              {message && (
                <div style={{ padding: '1rem', marginBottom: '2rem', background: message.includes('ERROR') ? '#fee2e2' : '#f0fdf4', color: message.includes('ERROR') ? '#991b1b' : '#166534', fontSize: '0.85rem' }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Product Name</label>
                  <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>

                {formData.category !== 'Gift' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Sub Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: '#888' }}>(optional)</span></label>
                      <input type="text" value={formData.subName || ''} onChange={(e) => setFormData({...formData, subName: e.target.value})} placeholder="e.g. Royal Oud" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Inspired By <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: '#888' }}>(optional)</span></label>
                      <input type="text" value={formData.inspiredBy || ''} onChange={(e) => setFormData({...formData, inspiredBy: e.target.value})} placeholder="e.g. Creed Aventus" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                )}

                <div style={{ background: '#fcfcfc', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }} className="label-caps">
                      <input type="radio" name="pricingType" checked={!formData.isOffer} onChange={() => setFormData({...formData, isOffer: false, costPrice: ''})} />
                      Normal Price
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }} className="label-caps">
                      <input type="radio" name="pricingType" checked={formData.isOffer} onChange={() => setFormData({...formData, isOffer: true})} />
                      With Offer
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {formData.isOffer && (
                      <div>
                        <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Cost Price (Original)</label>
                        <input type="number" required={formData.isOffer} value={formData.costPrice || ''} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} placeholder="e.g. 2999" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                      </div>
                    )}
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>{formData.isOffer ? 'Sell Price (Discounted)' : 'Price (without Rs.)'}</label>
                      <input type="number" required value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="e.g. 2199" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select value={formData.category || 'Him'} onChange={(e) => setFormData({...formData, category: e.target.value, giftSize: 1, giftFor: 'Him', giftProducts: []})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: '#fff' }}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                {/* Gift Set Configuration — visible only when Gift category is selected */}
                {formData.category === 'Gift' && (
                  <div style={{ background: 'linear-gradient(135deg, #fdf6ef, #fffaf5)', border: '1px solid #e8d5c0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #e8d5c0', paddingBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>🎁</span>
                      <span className="label-caps" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b5e3c' }}>Gift Set Configuration</span>
                    </div>

                    {/* Gift Size */}
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem', color: '#666' }}>Number of Perfumes in Set</label>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {[1, 2, 4].map(size => (
                          <label key={size} style={{ cursor: 'pointer', padding: '0.6rem 1.25rem', border: `2px solid ${formData.giftSize === size ? '#8b5e3c' : '#ddd'}`, borderRadius: '8px', background: formData.giftSize === size ? '#8b5e3c' : '#fff', color: formData.giftSize === size ? '#fff' : '#555', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s', userSelect: 'none' }}>
                            <input type="radio" name="giftSize" value={size} checked={formData.giftSize === size} onChange={() => setFormData({...formData, giftSize: size, giftProducts: []})} style={{ display: 'none' }} />
                            Set of {size}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Gift For */}
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem', color: '#666' }}>Gift For</label>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {['Him', 'Her', 'Couple'].map(opt => (
                          <label key={opt} style={{ cursor: 'pointer', padding: '0.6rem 1.25rem', border: `2px solid ${formData.giftFor === opt ? '#8b5e3c' : '#ddd'}`, borderRadius: '8px', background: formData.giftFor === opt ? '#8b5e3c' : '#fff', color: formData.giftFor === opt ? '#fff' : '#555', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s', userSelect: 'none' }}>
                            <input type="radio" name="giftFor" value={opt} checked={formData.giftFor === opt} onChange={() => setFormData({...formData, giftFor: opt})} style={{ display: 'none' }} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label className="label-caps" style={{ fontSize: '0.65rem', color: '#666' }}>Select Perfumes for this Gift Set</label>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: formData.giftProducts.length >= formData.giftSize ? '#dcfce7' : '#fef3c7', color: formData.giftProducts.length >= formData.giftSize ? '#166534' : '#92400e' }}>
                          {formData.giftProducts.length} / {formData.giftSize} selected
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={giftProductSearch}
                        onChange={(e) => setGiftProductSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                      <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>
                        {inventory
                          .filter(p => p.category !== 'Gift' && (p.name || '').toLowerCase().includes(giftProductSearch.toLowerCase()))
                          .map(p => {
                            const isSelected = formData.giftProducts.some(gp => gp.id === p.id);
                            const isDisabled = !isSelected && formData.giftProducts.length >= formData.giftSize;
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (isDisabled) return;
                                  if (isSelected) {
                                    setFormData({...formData, giftProducts: formData.giftProducts.filter(gp => gp.id !== p.id)});
                                  } else {
                                    setFormData({...formData, giftProducts: [...formData.giftProducts, { id: p.id, name: p.name, image: p.images?.[0] || '', price: p.price }]});
                                  }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid #f5f5f5', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.4 : 1, background: isSelected ? '#f0fdf4' : 'transparent', transition: 'background 0.15s' }}
                              >
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${isSelected ? '#166534' : '#ccc'}`, background: isSelected ? '#166534' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                  {isSelected && <span style={{ color: '#fff', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                                </div>
                                {isVideoUrl(p.images?.[0]) ? (
                                  <video src={p.images[0]} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} muted playsInline />
                                ) : (
                                  <img src={p.images?.[0] || 'https://via.placeholder.com/36'} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.83rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                  <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '1px' }}>{p.category} · {p.price}</div>
                                </div>
                              </div>
                            );
                          })}
                        {inventory.filter(p => p.category !== 'Gift' && (p.name || '').toLowerCase().includes(giftProductSearch.toLowerCase())).length === 0 && (
                          <p style={{ textAlign: 'center', padding: '2rem', color: '#aaa', fontSize: '0.8rem', margin: 0 }}>No products found.</p>
                        )}
                      </div>

                      {/* Selected Products Preview */}
                      {formData.giftProducts.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label className="label-caps" style={{ fontSize: '0.6rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Selected:</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.giftProducts.map(gp => (
                              <div key={gp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '0.25rem 0.6rem 0.25rem 0.4rem', fontSize: '0.75rem' }}>
                                {isVideoUrl(gp.image) ? (
                                  <video src={gp.image} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} muted playsInline />
                                ) : (
                                  <img src={gp.image || 'https://via.placeholder.com/20'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                                )}
                                <span style={{ color: '#166534', fontWeight: 500 }}>{gp.name}</span>
                                <button type="button" onClick={() => setFormData({...formData, giftProducts: formData.giftProducts.filter(p => p.id !== gp.id)})} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.85rem' }}>×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea required value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', resize: 'none' }} />
                </div>

                {formData.category !== 'Gift' && (
                  <div style={{ background: '#fcfcfc', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <label className="label-caps" style={{ fontSize: '0.7rem' }}>Fragrance Notes</label>
                      <button type="button" onClick={addNoteField} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.6rem', cursor: 'pointer' }} className="label-caps">+ Add Note</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(Array.isArray(formData.notes) ? formData.notes : []).map((note, index) => (
                        <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: '#fff', padding: '1rem', border: '1px solid #eee' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.25rem' }} className="label-caps">Note Name</label>
                            <input type="text" value={note.name} onChange={(e) => updateNoteField(index, 'name', e.target.value)} placeholder="e.g. Oud" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }} />
                          </div>
                          <button type="button" onClick={() => removeNoteField(index)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.55rem', cursor: 'pointer', height: '38px', flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                      {(!formData.notes || formData.notes.length === 0) && (
                        <p style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center' }}>No fragrance notes added yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.category !== 'Gift' && (
                  <div style={{ width: '150px' }}>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>
                      {['Incense Sticks', 'Dhoop Sticks'].includes(formData.category) ? 'Quantity (Set of)' : 'Size (ml)'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.size || ''} 
                      onChange={(e) => setFormData({...formData, size: e.target.value})} 
                      placeholder={['Incense Sticks', 'Dhoop Sticks'].includes(formData.category) ? 'e.g. 100' : 'e.g. 100ml'} 
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} 
                    />
                  </div>
                )}

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Product Media (Image / Video URLs)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {urlInputs.map((url, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="url" placeholder="Media URL (Image or Video .mp4, .webm, etc.)" value={url || ''} onChange={(e) => updateUrlField(index, e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)' }} />
                        {urlInputs.length > 1 && (
                          <button type="button" onClick={() => removeUrlField(index)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addUrlField} style={{ background: 'none', border: '1px dashed var(--border)', padding: '0.75rem', cursor: 'pointer', fontSize: '0.7rem' }} className="label-caps">+ Add Media URL</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input 
                      type="checkbox" 
                      id="inStock" 
                      checked={formData.inStock !== false} 
                      onChange={(e) => setFormData({...formData, inStock: e.target.checked})} 
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="inStock" className="label-caps" style={{ fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>Product is In Stock</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input 
                      type="checkbox" 
                      id="bestSeller" 
                      checked={!!formData.isBestSeller} 
                      onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})} 
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="bestSeller" className="label-caps" style={{ fontSize: '0.7rem', cursor: 'pointer' }}>Mark as Best Seller</label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  {editingId && <button type="button" onClick={resetForm} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', padding: '1rem' }} className="label-caps">Cancel</button>}
                  <button type="submit" className="btn-primary label-caps" disabled={loading} style={{ flex: 2, padding: '1.25rem', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'UPLOADING...' : (editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        ) : activeTab === 'enquiries' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px' }}>
                <input 
                  type="text" 
                  placeholder="Search by customer name or product..." 
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem' }} 
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select 
                  value={enquiryFilter} 
                  onChange={(e) => setEnquiryFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#fff' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {enquiries
                .filter(enq => {
                  const matchesSearch = enq.fullName?.toLowerCase().includes(enquirySearch.toLowerCase()) || enq.productName?.toLowerCase().includes(enquirySearch.toLowerCase());
                  const matchesFilter = enquiryFilter === 'All' || enq.status === enquiryFilter;
                  return matchesSearch && matchesFilter;
                })
                .map((enq) => (
                <div key={enq.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: 'var(--spacing-gutter)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{enq.status.toUpperCase()}</div>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: 0 }}>{enq.fullName}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{new Date(enq.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <select 
                        value={enq.status} 
                        onChange={(e) => updateEnquiryStatus(enq.id, e.target.value)}
                        style={{ padding: '0.5rem', fontSize: '0.75rem', border: '1px solid var(--border)', background: enq.status === 'Pending' ? '#fff4ed' : enq.status === 'Contacted' ? '#eff6ff' : '#f0fdf4' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button onClick={() => deleteEnquiry(enq.id)} style={{ padding: '0.5rem', color: '#991b1b', border: 'none', background: 'none', cursor: 'pointer' }} className="material-icons">delete_outline</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '1.5rem', background: '#faf9f7', padding: '1.5rem' }}>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Contact Info</label>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{enq.phone}</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{enq.email}</p>
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Request Details</label>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}><strong>Product:</strong> {enq.productName}</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}><strong>Qty:</strong> {enq.quantity}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Message / Vision</label>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{enq.message}</p>
                  </div>
                </div>
              ))}
              {enquiries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', border: '1px dashed var(--border)' }}>
                  <p className="label-caps">No bulk enquiries found.</p>
                </div>
              )}
            </div>
          </Reveal>
        ) : activeTab === 'contact-enquiries' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px' }}>
                <input 
                  type="text" 
                  placeholder="Search by name, email or subject..." 
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem' }} 
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select 
                  value={contactFilter} 
                  onChange={(e) => setContactFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#fff' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {contactEnquiries
                .filter(enq => {
                  const matchesSearch = enq.fullName?.toLowerCase().includes(contactSearch.toLowerCase()) || 
                                      enq.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                      enq.subject?.toLowerCase().includes(contactSearch.toLowerCase());
                  const matchesFilter = contactFilter === 'All' || enq.status === contactFilter;
                  return matchesSearch && matchesFilter;
                })
                .map((enq) => (
                <div key={enq.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: 'var(--spacing-gutter)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{enq.status.toUpperCase()}</div>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: 0 }}>{enq.fullName}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{new Date(enq.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <select 
                        value={enq.status} 
                        onChange={(e) => updateContactStatus(enq.id, e.target.value)}
                        style={{ padding: '0.5rem', fontSize: '0.75rem', border: '1px solid var(--border)', background: enq.status === 'Pending' ? '#fff4ed' : enq.status === 'Contacted' ? '#eff6ff' : '#f0fdf4' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button onClick={() => deleteContactEnquiry(enq.id)} style={{ padding: '0.5rem', color: '#991b1b', border: 'none', background: 'none', cursor: 'pointer' }} className="material-icons">delete_outline</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '1.5rem', background: '#faf9f7', padding: '1.5rem' }}>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Contact Info</label>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{enq.phone}</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{enq.email}</p>
                    </div>
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Subject</label>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{enq.subject}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label-caps" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.4rem' }}>Message</label>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{enq.message}</p>
                  </div>
                </div>
              ))}
              {contactEnquiries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', border: '1px dashed var(--border)' }}>
                  <p className="label-caps">No contact enquiries found.</p>
                </div>
              )}
            </div>
          </Reveal>
        ) : activeTab === 'realms' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>{editingRealmId ? 'Edit Realm' : 'Add Realm'}</h1>
              {message && (
                <div style={{ padding: '1rem', marginBottom: '2rem', background: message.includes('ERROR') ? '#fee2e2' : '#f0fdf4', color: message.includes('ERROR') ? '#991b1b' : '#166534', fontSize: '0.85rem' }}>
                  {message}
                </div>
              )}
              <form onSubmit={handleRealmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Realm Name</label>
                  <input type="text" required value={realmData.name} onChange={(e) => setRealmData({...realmData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} placeholder="e.g. Him" />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="radio" name="targetType" value="category" checked={realmData.targetType === 'category'} onChange={() => setRealmData({...realmData, targetType: 'category'})} />
                      Link to Category
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="radio" name="targetType" value="custom" checked={realmData.targetType === 'custom'} onChange={() => setRealmData({...realmData, targetType: 'custom'})} />
                      Custom Product Selection
                    </label>
                  </div>

                  {realmData.targetType === 'category' ? (
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Category Target</label>
                      <select value={realmData.categorySlug || 'perfume-oil'} onChange={(e) => setRealmData({...realmData, categorySlug: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: '#fff' }}>
                        <option value="perfume-oil">Perfume Oil</option>
                        <option value="diffusers">Diffusers</option>
                        <option value="dhoop-sticks">Dhoop Sticks</option>
                        <option value="him">Him</option>
                        <option value="her">Her</option>
                        <option value="unisex">Unisex</option>
                        <option value="car-diffusers">Car Diffusers</option>
                        <option value="home-diffuser">Home Diffuser</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Select Products ({realmData.productIds?.length || 0} selected)</label>
                      <div style={{ border: '1px solid var(--border)', padding: '1rem', maxHeight: '200px', overflowY: 'auto', background: '#faf9f7' }}>
                        {inventory.map(prod => (
                          <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={realmData.productIds?.includes(prod.id) || false}
                              onChange={(e) => {
                                const currentIds = realmData.productIds || [];
                                if (e.target.checked) {
                                  setRealmData({...realmData, productIds: [...currentIds, prod.id]});
                                } else {
                                  setRealmData({...realmData, productIds: currentIds.filter(id => id !== prod.id)});
                                }
                              }}
                            />
                            {prod.name} <span style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>({prod.category})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
                  <input type="url" required value={realmData.img} onChange={(e) => setRealmData({...realmData, img: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {editingRealmId && <button type="button" onClick={() => { setEditingRealmId(null); setRealmData({ name: '', img: '', targetType: 'category', categorySlug: 'perfume-oil', productIds: [] }); }} className="label-caps" style={{ flex: '1 1 120px', padding: '1rem', border: '1px solid var(--border)', background: 'none' }}>Cancel</button>}
                  <button type="submit" className="btn-primary label-caps" style={{ flex: '2 1 200px', padding: '1rem' }} disabled={loading}>
                    {loading ? 'SAVING...' : (editingRealmId ? 'UPDATE REALM' : 'ADD REALM')}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {realms.map(realm => (
                <div key={realm.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <img src={realm.img || 'https://via.placeholder.com/300x400'} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem' }} />
                  <div>
                    <h3 className="label-caps" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{realm.name}</h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', wordBreak: 'break-all' }}>{realm.href}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setEditingRealmId(realm.id); setRealmData({ name: realm.name, targetType: realm.targetType || 'category', categorySlug: realm.categorySlug || 'perfume-oil', productIds: realm.productIds || [], img: realm.img }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="label-caps" style={{ fontSize: '0.6rem', border: 'none', background: 'none', borderBottom: '1px solid #000', cursor: 'pointer', paddingBottom: '2px' }}>EDIT</button>
                    <button onClick={() => deleteRealm(realm.id)} className="label-caps" style={{ fontSize: '0.6rem', border: 'none', background: 'none', borderBottom: '1px solid #991b1b', color: '#991b1b', cursor: 'pointer', paddingBottom: '2px' }}>DELETE</button>
                  </div>
                </div>
              ))}
              {realms.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#fff', border: '1px dashed var(--border)' }}>
                  <p className="label-caps">No curated realms found.</p>
                </div>
              )}
            </div>
          </Reveal>
        ) : activeTab === 'orders' ? (
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

              {/* Razorpay Dashboard Statistics */}
              {(() => {
                const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
                const failedOrders = orders.filter(o => o.paymentStatus === 'Failed');
                const pendingOrders = orders.filter(o => !o.paymentStatus || o.paymentStatus === 'Pending');
                const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                const today = new Date().toDateString();
                const todayRevenue = paidOrders
                  .filter(o => {
                    const d = o.orderDate?.seconds ? new Date(o.orderDate.seconds * 1000) : (o.orderDate ? new Date(o.orderDate) : null);
                    return d && d.toDateString() === today;
                  })
                  .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                const stats = [
                  { label: 'Total Orders', value: orders.length, color: '#000' },
                  { label: 'Paid Orders', value: paidOrders.length, color: '#166534' },
                  { label: 'Failed Payments', value: failedOrders.length, color: '#991b1b' },
                  { label: 'Total Revenue', value: fmtINR(totalRevenue), color: 'var(--primary)' },
                  { label: "Today's Revenue", value: fmtINR(todayRevenue), color: '#1d4ed8' },
                ];
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                    {stats.map((stat, i) => (
                      <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center' }}>
                        <div className="label-caps" style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-serif)' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Orders Management */}
              <div>
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Manage Orders</h2>

                {/* Search and Filter */}
                <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <input
                      type="text"
                      placeholder="Search by Order ID, Payment ID, Customer Name or Phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#fff' }}
                    >
                      <option value="All">All Order Statuses</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#fff' }}
                    >
                      <option value="All">All Payments</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Orders List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {orders
                    .filter(order => {
                      const q = orderSearch.toLowerCase();
                      const matchesSearch =
                        order.orderId?.toLowerCase().includes(q) ||
                        order.razorpayPaymentId?.toLowerCase().includes(q) ||
                        order.razorpayOrderId?.toLowerCase().includes(q) ||
                        order.utrNumber?.toLowerCase().includes(q) ||
                        order.customerDetails?.name?.toLowerCase().includes(q) ||
                        order.customerDetails?.phone?.toLowerCase().includes(q);
                      const matchesOrder = orderFilter === 'All' || order.orderStatus === orderFilter;
                      const matchesPayment = paymentFilter === 'All' || (order.paymentStatus || 'Pending') === paymentFilter;
                      return matchesSearch && matchesOrder && matchesPayment;
                    })
                    .sort((a, b) => {
                      const da = a.orderDate?.seconds ? a.orderDate.seconds * 1000 : (a.orderDate ? new Date(a.orderDate).getTime() : 0);
                      const db2 = b.orderDate?.seconds ? b.orderDate.seconds * 1000 : (b.orderDate ? new Date(b.orderDate).getTime() : 0);
                      return db2 - da;
                    })
                    .map((order) => {
                      const orderDocId = order.id || order.orderId;
                      const orderDateStr = order.orderDate?.seconds
                        ? new Date(order.orderDate.seconds * 1000).toLocaleString()
                        : (order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Pending');
                      const isRazorpay = order.paymentMethod === 'Razorpay';
                      const isExpanded = expandedOrderId === orderDocId;
                      const pStatus = order.paymentStatus || (isRazorpay ? 'Paid' : 'Pending');
                      const payStatusColors = {
                        Paid: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
                        Pending: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
                        Failed: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
                        Refunded: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                      };
                      const pColors = payStatusColors[pStatus] || payStatusColors.Pending;

                      return (
                        <div key={orderDocId} style={{ background: '#fff', border: '1px solid var(--border)' }}>
                          {/* Order Header Row */}
                          <div style={{ padding: 'var(--spacing-gutter)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Order {order.orderId}</h3>
                                {/* Payment Status Badge */}
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: pColors.bg, color: pColors.color, border: `1px solid ${pColors.border}`, letterSpacing: '0.05em' }} className="label-caps">
                                  {pStatus}
                                </span>
                                {isRazorpay && (
                                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#faf5ff', color: '#6d28d9', border: '1px solid #e9d5ff' }} className="label-caps">
                                    Razorpay
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: 0 }}>
                                {orderDateStr} &nbsp;·&nbsp; <strong>{order.customerDetails?.name}</strong> &nbsp;·&nbsp; {order.customerDetails?.phone}
                              </p>
                              <p style={{ fontSize: '0.8rem', margin: 0, color: '#555' }}>
                                {fmtINR(order.totalAmount)} &nbsp;·&nbsp; {order.orderedProducts?.length || 0} item(s) &nbsp;·&nbsp; Status: <strong>{order.orderStatus}</strong>
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              {/* Order Status Selector */}
                              <select
                                value={order.orderStatus}
                                onChange={(e) => updateOrderStatus(orderDocId, e.target.value)}
                                style={{ padding: '0.45rem 0.6rem', fontSize: '0.72rem', border: '1px solid var(--border)', background: '#fff', borderRadius: '4px' }}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {/* Expand / Collapse */}
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : orderDocId)}
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.7rem', border: '1px solid var(--border)', background: isExpanded ? 'var(--foreground)' : '#fff', color: isExpanded ? 'var(--background)' : 'var(--foreground)', cursor: 'pointer', borderRadius: '4px' }}
                                className="label-caps"
                              >
                                {isExpanded ? 'CLOSE' : 'VIEW'}
                              </button>
                              <button
                                onClick={() => deleteOrder(orderDocId)}
                                style={{ padding: '0.45rem', color: '#991b1b', border: 'none', background: 'none', cursor: 'pointer' }}
                                className="material-icons"
                                title="Delete Order"
                              >
                                delete_outline
                              </button>
                            </div>
                          </div>

                          {/* Expanded Order Detail */}
                          {isExpanded && (
                            <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--spacing-gutter)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>

                                {/* Payment Information */}
                                <div>
                                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem', color: '#888', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.4rem' }}>Payment Information</label>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                                    <div><span style={{ color: '#888' }}>Method:</span> <strong>{order.paymentMethod || '—'}</strong></div>
                                    {isRazorpay && (
                                      <>
                                        <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#888' }}>Razorpay Order ID:</span><br /><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.78rem' }}>{order.razorpayOrderId || '—'}</span></div>
                                        <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#888' }}>Razorpay Payment ID:</span><br /><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.78rem' }}>{order.razorpayPaymentId || '—'}</span></div>
                                      </>
                                    )}
                                    {!isRazorpay && order.utrNumber && (
                                      <div><span style={{ color: '#888' }}>UTR/Ref:</span> <strong style={{ color: 'var(--primary)' }}>{order.utrNumber}</strong></div>
                                    )}
                                    <div><span style={{ color: '#888' }}>Amount Paid:</span> <strong>{fmtINR(order.totalAmount)}</strong></div>
                                    <div><span style={{ color: '#888' }}>Payment Date:</span> <strong style={{ fontSize: '0.78rem' }}>{orderDateStr}</strong></div>

                                    {/* Payment Status Selector */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <span className="label-caps" style={{ fontSize: '0.6rem', color: '#888', display: 'block', marginBottom: '0.35rem' }}>Payment Status</span>
                                      <select
                                        value={pStatus}
                                        onChange={(e) => updatePaymentStatus(orderDocId, e.target.value)}
                                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', border: '1px solid var(--border)', background: pColors.bg, color: pColors.color, borderRadius: '4px' }}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Refunded">Refunded</option>
                                      </select>
                                    </div>

                                    {/* Refund Info (read-only, for future use) */}
                                    {order.refundId && (
                                      <div style={{ marginTop: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem', borderRadius: '4px' }}>
                                        <span className="label-caps" style={{ fontSize: '0.6rem', color: '#1d4ed8', display: 'block', marginBottom: '0.35rem' }}>Refund Details</span>
                                        <div style={{ fontSize: '0.78rem' }}>
                                          <div><span style={{ color: '#555' }}>Refund ID:</span> <strong>{order.refundId}</strong></div>
                                          {order.refundAmount && <div><span style={{ color: '#555' }}>Refund Amount:</span> <strong>{fmtINR(order.refundAmount)}</strong></div>}
                                          {order.refundDate && <div><span style={{ color: '#555' }}>Refund Date:</span> <strong>{new Date(order.refundDate).toLocaleDateString()}</strong></div>}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem', color: '#888', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.4rem' }}>Customer Information</label>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                                    <div><span style={{ color: '#888' }}>Name:</span> <strong>{order.customerDetails?.name}</strong></div>
                                    <div><span style={{ color: '#888' }}>Phone:</span> {order.customerDetails?.phone}</div>
                                    <div><span style={{ color: '#888' }}>Email:</span> {order.customerDetails?.email}</div>
                                    <div style={{ lineHeight: 1.5 }}>
                                      <span style={{ color: '#888' }}>Address:</span><br />
                                      {order.customerDetails?.address}, {order.customerDetails?.city},<br />
                                      {order.customerDetails?.state} — {order.customerDetails?.zip}
                                    </div>
                                  </div>
                                </div>

                                {/* Order Information */}
                                <div>
                                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem', color: '#888', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.4rem' }}>Order Information</label>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {order.orderedProducts?.map((p, pIdx) => (
                                      <div key={pIdx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '0.35rem' }}>
                                        <span>• {p.name} <span style={{ color: '#888' }}>×{p.quantity}</span></span>
                                        <span style={{ fontWeight: 600 }}>{p.price}</span>
                                      </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                      <span className="label-caps" style={{ fontSize: '0.7rem', fontWeight: 700 }}>Total</span>
                                      <span style={{ fontWeight: 700 }}>{fmtINR(order.totalAmount)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', border: '1px dashed var(--border)' }}>
                      <p className="label-caps">No orders placed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div style={{ background: '#fff', padding: 'var(--spacing-gutter)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px' }}>
                <input 
                  type="text" 
                  placeholder="Search by product name..." 
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem' }} 
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select 
                  value={inventoryFilter} 
                  onChange={(e) => setInventoryFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#fff' }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredInventory.map((product) => (
                <div key={product.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', gap: '1.5rem', position: 'relative' }}>
                  <div style={{ width: '80px', height: '100px', background: '#f5f5f5', position: 'relative' }}>
                    {isVideoUrl(product.image || product.images?.[0]) ? (
                      <video src={product.image || product.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                    ) : (
                      <img src={product.image || product.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{product.category}</div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.85rem' }}>
                        {product.costPrice && (
                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '0.5rem' }}>{product.costPrice}</span>
                        )}
                        <span style={{ color: product.costPrice ? '#991b1b' : '#111', fontWeight: product.costPrice ? 600 : 400 }}>{product.price}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => toggleStock(product)}
                          style={{
                            background: product.inStock !== false ? '#f0fdf4' : '#fee2e2',
                            color: product.inStock !== false ? '#15803d' : '#b91c1c',
                            border: '1px solid currentColor',
                            borderRadius: '20px',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.6rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600
                          }}
                          className="label-caps"
                          title="Click to toggle stock status"
                        >
                          <span className="material-icons" style={{ fontSize: '0.75rem' }}>
                            {product.inStock !== false ? 'check_circle' : 'cancel'}
                          </span>
                          {product.inStock !== false ? 'IN STOCK' : 'OUT OF STOCK'}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button onClick={() => handleEdit(product)} style={{ background: 'none', border: 'none', borderBottom: '1px solid #000', padding: 0, cursor: 'pointer', fontSize: '0.65rem' }} className="label-caps">EDIT</button>
                      <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: '#991b1b', borderBottom: '1px solid #991b1b', padding: 0, cursor: 'pointer', fontSize: '0.65rem' }} className="label-caps">DELETE</button>
                    </div>
                  </div>
                  {product.isBestSeller && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: '#fff', fontSize: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }} className="label-caps">BESTSELLER</div>
                  )}
                </div>
              ))}
            </div>
            {filteredInventory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', border: '1px dashed var(--border)' }}>
                <p className="label-caps">No products match your search or filter.</p>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </div>
  );
}

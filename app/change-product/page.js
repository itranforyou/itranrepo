'use client';

import { useState, useEffect } from 'react';
import { addProduct, getProducts, updateProduct, deleteProduct } from '@/lib/products';
import Reveal from '@/components/Reveal';

export default function ChangeProductPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ id: '', pass: '' });
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'manage', or 'packaging'
  
  // States for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    isOffer: false,
    category: 'Him Collection',
    description: '',
    isBestSeller: false
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('file');
  const [urlInputs, setUrlInputs] = useState(['']);
  const [editingId, setEditingId] = useState(null);
  
  // Packaging state
  const [packagingData, setPackagingData] = useState({
    name: '',
    price: '',
    enabled: true
  });
  const [packagingFile, setPackagingFile] = useState(null);
  const [editingPackId, setEditingPackId] = useState(null);
  const [packagingList, setPackagingList] = useState([]);
  
  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');

  const { packagingOptions } = require('@/context/AppContext').useAppContext();
  
  useEffect(() => {
    if (packagingOptions) setPackagingList(packagingOptions);
  }, [packagingOptions]);

  const categories = ['Him Collection', 'Her Collection', 'Unisex Collection', 'Spiritual Collection', 'Car Diffusers', 'Incense Sticks'];

  const addUrlField = () => setUrlInputs([...urlInputs, '']);
  const removeUrlField = (index) => setUrlInputs(urlInputs.filter((_, i) => i !== index));
  const updateUrlField = (index, value) => {
    const newUrls = [...urlInputs];
    newUrls[index] = value;
    setUrlInputs(newUrls);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminCreds.id === 'admin' && adminCreds.pass === 'ittar@2026') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Credentials');
    }
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      costPrice: '',
      isOffer: false,
      category: 'Him Collection',
      description: '',
      isBestSeller: false
    });
    setImageFiles([]);
    setUrlInputs(['']);
    setEditingId(null);
    setUploadMethod('file');
    setMessage('');
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
        images: uploadMethod === 'url' ? urlInputs.filter(url => url.trim() !== '') : (formData.images || [])
      };
      
      if (editingId) {
        await updateProduct(editingId, productData, uploadMethod === 'file' ? imageFiles : []);
        setMessage('SUCCESS: Product updated!');
      } else {
        await addProduct(productData, uploadMethod === 'file' ? imageFiles : []);
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

  const handlePackagingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { addPackagingOption, updatePackagingOption } = require('@/lib/packaging');
    try {
      const data = {
        ...packagingData,
        price: parseInt(packagingData.price)
      };
      if (editingPackId) {
        await updatePackagingOption(editingPackId, data, packagingFile);
        setMessage('SUCCESS: Packaging updated!');
      } else {
        await addPackagingOption(data, packagingFile);
        setMessage('SUCCESS: Packaging added!');
      }
      setPackagingData({ name: '', price: '', enabled: true });
      setPackagingFile(null);
      setEditingPackId(null);
    } catch (err) {
      setMessage('ERROR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePackaging = async (id) => {
    if (!confirm('Delete this packaging?')) return;
    const { deletePackagingOption } = require('@/lib/packaging');
    try {
      await deletePackagingOption(id);
      alert('Deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      price: product.price?.toString().replace('Rs.', '').replace('Rs. ', '').replace('$', '').trim() || '',
      costPrice: product.costPrice?.toString().replace('Rs.', '').replace('Rs. ', '').replace('$', '').trim() || '',
      isOffer: !!product.costPrice,
      category: product.category || 'Him Collection',
      description: product.description || product.desc || '',
      isBestSeller: product.isBestSeller || false,
      images: product.images || []
    });
    setUrlInputs(product.images && product.images.length > 0 ? product.images : ['']);
    setUploadMethod('url'); 
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

  // Filter Inventory
  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesFilter = inventoryFilter === 'All' || product.category === inventoryFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '150px', minHeight: '100vh', background: '#faf9f7', display: 'flex', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '400px' }}>
          <Reveal>
            <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'var(--font-serif)' }}>Admin Access</h1>
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Admin ID</label>
                  <input type="text" required value={adminCreds.id} onChange={(e) => setAdminCreds({...adminCreds, id: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                  <input type="password" required value={adminCreds.pass} onChange={(e) => setAdminCreds({...adminCreds, pass: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>
                <button type="submit" className="btn-primary label-caps" style={{ width: '100%', padding: '1rem' }}>Enter Dashboard</button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#faf9f7', paddingBottom: '100px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '1px', marginBottom: '2rem', background: 'var(--border)', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => { setActiveTab('add'); resetForm(); }}
            style={{ flex: 1, padding: '1rem', background: activeTab === 'add' ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
            className="label-caps"
          >
            {editingId ? 'EDITING PRODUCT' : 'ADD NEW PRODUCT'}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            style={{ flex: 1, padding: '1rem', background: activeTab === 'manage' ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
            className="label-caps"
          >
            MANAGE INVENTORY ({inventory.length})
          </button>
          <button 
            onClick={() => setActiveTab('packaging')}
            style={{ flex: 1, padding: '1rem', background: activeTab === 'packaging' ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
            className="label-caps"
          >
            GIFT PACKAGING
          </button>
        </div>

        {activeTab === 'add' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)' }}>
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

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {formData.isOffer && (
                      <div style={{ flex: 1 }}>
                        <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Cost Price (Original)</label>
                        <input type="number" required={formData.isOffer} value={formData.costPrice || ''} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} placeholder="e.g. 2999" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>{formData.isOffer ? 'Sell Price (Discounted)' : 'Price (without Rs.)'}</label>
                      <input type="number" required value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="e.g. 2199" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>

                  <div style={{ flex: 1 }}>
                    <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select value={formData.category || 'Him Collection'} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: '#fff' }}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea required value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', resize: 'none' }} />
                </div>

                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Images (Existing + New)</label>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => setUploadMethod('file')} style={{ flex: 1, padding: '0.5rem', fontSize: '0.6rem', background: uploadMethod === 'file' ? 'var(--foreground)' : 'transparent', color: uploadMethod === 'file' ? 'var(--background)' : 'var(--foreground)', border: '1px solid var(--border)' }} className="label-caps">Add via Files</button>
                    <button type="button" onClick={() => setUploadMethod('url')} style={{ flex: 1, padding: '0.5rem', fontSize: '0.6rem', background: uploadMethod === 'url' ? 'var(--foreground)' : 'transparent', color: uploadMethod === 'url' ? 'var(--background)' : 'var(--foreground)', border: '1px solid var(--border)' }} className="label-caps">Edit URLs</button>
                  </div>
                  
                  {uploadMethod === 'file' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input key="file-input-manage" type="file" accept="image/*" multiple onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
                        if (oversized.length > 0) {
                          alert(`ERROR: Image(s) too large. Max 2MB.`);
                          e.target.value = '';
                          setImageFiles([]);
                        } else {
                          setImageFiles(files);
                        }
                      }} style={{ width: '100%', padding: '0.5rem 0' }} />
                      <p style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>New images will be added to the gallery.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {urlInputs.map((url, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="url" placeholder="Image URL" value={url || ''} onChange={(e) => updateUrlField(index, e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)' }} />
                          {urlInputs.length > 1 && (
                            <button type="button" onClick={() => removeUrlField(index)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addUrlField} style={{ background: 'none', border: '1px dashed var(--border)', padding: '0.75rem', cursor: 'pointer', fontSize: '0.7rem' }} className="label-caps">+ Add Image URL</button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" id="bestSeller" checked={!!formData.isBestSeller} onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})} />
                  <label htmlFor="bestSeller" className="label-caps" style={{ fontSize: '0.7rem', cursor: 'pointer' }}>Mark as Best Seller</label>
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
        ) : activeTab === 'packaging' ? (
          <Reveal>
            <div style={{ background: '#fff', padding: '3rem', border: '1px solid var(--border)', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>{editingPackId ? 'Edit Packaging' : 'Add Packaging'}</h1>
              {message && (
                <div style={{ padding: '1rem', marginBottom: '2rem', background: message.includes('ERROR') ? '#fee2e2' : '#f0fdf4', color: message.includes('ERROR') ? '#991b1b' : '#166534', fontSize: '0.85rem' }}>
                  {message}
                </div>
              )}
              <form onSubmit={handlePackagingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Packaging Name</label>
                  <input type="text" required value={packagingData.name} onChange={(e) => setPackagingData({...packagingData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Price (₹)</label>
                  <input type="number" required value={packagingData.price} onChange={(e) => setPackagingData({...packagingData, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Preview Image</label>
                  <input type="file" onChange={(e) => setPackagingFile(e.target.files[0])} style={{ width: '100%', padding: '0.75rem 0' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={packagingData.enabled} onChange={(e) => setPackagingData({...packagingData, enabled: e.target.checked})} />
                  <label className="label-caps" style={{ fontSize: '0.7rem' }}>Enable this option</label>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {editingPackId && <button type="button" onClick={() => { setEditingPackId(null); setPackagingData({ name: '', price: '', enabled: true }); }} className="label-caps" style={{ flex: 1, padding: '1rem', border: '1px solid var(--border)', background: 'none' }}>Cancel</button>}
                  <button type="submit" className="btn-primary label-caps" style={{ flex: 2, padding: '1rem' }} disabled={loading}>
                    {loading ? 'SAVING...' : (editingPackId ? 'UPDATE PACKAGING' : 'ADD PACKAGING')}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {packagingList.map(pack => (
                <div key={pack.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center' }}>
                  <img src={pack.image || 'https://via.placeholder.com/150'} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', marginBottom: '1rem' }} />
                  <h3 className="label-caps" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>{pack.name}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{pack.price}</p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={() => { setEditingPackId(pack.id); setPackagingData({ name: pack.name, price: pack.price, enabled: pack.enabled }); }} className="label-caps" style={{ fontSize: '0.6rem', border: 'none', background: 'none', borderBottom: '1px solid #000', cursor: 'pointer' }}>EDIT</button>
                    <button onClick={() => deletePackaging(pack.id)} className="label-caps" style={{ fontSize: '0.6rem', border: 'none', background: 'none', borderBottom: '1px solid #991b1b', color: '#991b1b', cursor: 'pointer' }}>DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div style={{ background: '#fff', padding: '2rem', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <input 
                  type="text" 
                  placeholder="Search by product name..." 
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border)', fontSize: '0.9rem' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
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
                  <div style={{ width: '80px', height: '100px', background: '#f5f5f5' }}>
                    <img src={product.image || product.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

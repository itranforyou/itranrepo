'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setSelectedProduct, products } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 5));
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen, products]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm, products]);

  if (!isSearchOpen) return null;

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setIsSearchOpen(false);
  };

  return (
    <div className={`search-modal ${isSearchOpen ? 'active' : ''}`} onClick={() => setIsSearchOpen(false)}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <span className="material-icons">search</span>
          <input 
            type="text" 
            ref={inputRef}
            id="search-input" 
            placeholder="Search for products, collections..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="close-search" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div id="search-results" className="search-results">
          {searchTerm.length < 2 ? (
            <>
              <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '1rem 0', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--muted-foreground)', textTransform: 'uppercase', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                Trending Searches
              </div>
              {suggestions.map(p => (
                <div key={p.id} className="search-result-item" style={{ cursor: 'pointer' }} onClick={() => handleOpenProduct(p)}>
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} alt={p.name} />
                  <div className="item-info">
                    <h4>{p.name}</h4>
                    <div className="price">{p.price}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            results.length > 0 ? (
              results.map(p => (
                <div key={p.id} className="search-result-item" style={{ cursor: 'pointer' }} onClick={() => handleOpenProduct(p)}>
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'} alt={p.name} />
                  <div className="item-info">
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '2px' }}>{p.category}</div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{p.name}</h4>
                    <div className="price" style={{ marginTop: '4px' }}>{p.price}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                No products found matching your search.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

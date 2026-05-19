'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

// Price parser to convert string like "₹ 1,500.00" to number 1500
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  let clean = priceStr.toString().replace(/Rs\./g, '').replace(/Rs/g, '').replace(/₹/g, '');
  clean = clean.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export default function FilterSort({ products = [], onFilterSortChange }) {
  // Filter Dropdowns active states
  const [openDropdown, setOpenDropdown] = useState(null); // 'availability' | 'price' | null
  
  // Filter state values
  const [availability, setAvailability] = useState({
    inStock: false,
    outOfStock: false,
  });
  
  const [priceRange, setPriceRange] = useState({
    from: '',
    to: '',
  });

  // Sort State
  const [sortBy, setSortBy] = useState('title-ascending'); // Default A-Z

  // Refs for clicking outside dropdowns to close them
  const containerRef = useRef(null);
  const lastSentHashRef = useRef('');

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute maximum price of existing items
  const maxPriceInProducts = useMemo(() => {
    if (!products.length) return 30000;
    return Math.max(...products.map(p => parsePrice(p.price)), 1000);
  }, [products]);

  // Handle individual filter resets
  const resetAvailability = () => {
    setAvailability({ inStock: false, outOfStock: false });
  };

  const resetPrice = () => {
    setPriceRange({ from: '', to: '' });
  };

  const resetAll = () => {
    resetAvailability();
    resetPrice();
    setSortBy('title-ascending');
  };

  // Determine active count or boolean to show "Reset"
  const isAvailabilityFiltered = availability.inStock || availability.outOfStock;
  const isPriceFiltered = priceRange.from !== '' || priceRange.to !== '';
  const isFiltered = isAvailabilityFiltered || isPriceFiltered;

  // Perform filtering and sorting in a memoized value
  const filteredSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by Availability
    if (isAvailabilityFiltered) {
      result = result.filter(p => {
        // Assume products are in stock unless p.stock is 0 or p.inStock is false
        const isInStock = p.inStock !== false && p.stock !== 0;
        
        if (availability.inStock && availability.outOfStock) return true;
        if (availability.inStock) return isInStock;
        if (availability.outOfStock) return !isInStock;
        return true;
      });
    }

    // 2. Filter by Price Range
    if (isPriceFiltered) {
      const fromVal = priceRange.from !== '' ? parseFloat(priceRange.from) : 0;
      const toVal = priceRange.to !== '' ? parseFloat(priceRange.to) : Infinity;

      result = result.filter(p => {
        const price = parsePrice(p.price);
        return price >= fromVal && price <= toVal;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'best-selling':
          const aBest = a.isBestSeller ? 1 : 0;
          const bBest = b.isBestSeller ? 1 : 0;
          return bBest - aBest;
        case 'title-ascending':
          return (a.name || '').localeCompare(b.name || '');
        case 'title-descending':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-ascending':
          return parsePrice(a.price) - parsePrice(b.price);
        case 'price-descending':
          return parsePrice(b.price) - parsePrice(a.price);
        case 'created-ascending':
          const aTime = a.createdAt?.seconds || a.createdAt || 0;
          const bTime = b.createdAt?.seconds || b.createdAt || 0;
          return aTime - bTime;
        case 'created-descending':
          const aTimeD = a.createdAt?.seconds || a.createdAt || 0;
          const bTimeD = b.createdAt?.seconds || b.createdAt || 0;
          return bTimeD - aTimeD;
        case 'manual':
        default:
          return 0;
      }
    });

    return result;
  }, [products, availability, priceRange, sortBy]);

  // Sync back to parent when filteredSortedProducts changes
  useEffect(() => {
    onFilterSortChange(filteredSortedProducts);
  }, [filteredSortedProducts, onFilterSortChange]);

  return (
    <div ref={containerRef} className="filter-sort-wrapper" style={{ margin: '2rem 0', fontFamily: 'var(--font-serif)' }}>
      {/* Filters Bar */}
      <div className="filter-sort-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        {/* Left: Filter Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Filter:</span>
          
          {/* Availability Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setOpenDropdown(openDropdown === 'availability' ? null : 'availability')}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                padding: '0.5rem 1.25rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)'
              }}
            >
              Availability
              <span className="material-icons" style={{ fontSize: '1rem', transition: 'transform 0.2s', transform: openDropdown === 'availability' ? 'rotate(180deg)' : 'rotate(0)' }}>
                keyboard_arrow_down
              </span>
            </button>

            {openDropdown === 'availability' && (
              <div className="filter-dropdown-card" style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                left: 0,
                width: '260px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                padding: '1.25rem',
                zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {Object.values(availability).filter(Boolean).length} selected
                  </span>
                  <button 
                    onClick={resetAvailability}
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Reset
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={availability.inStock}
                      onChange={(e) => setAvailability({ ...availability, inStock: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    In stock ({products.filter(p => p.inStock !== false && p.stock !== 0).length})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={availability.outOfStock}
                      onChange={(e) => setAvailability({ ...availability, outOfStock: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Out of stock ({products.filter(p => p.inStock === false || p.stock === 0).length})
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Price Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                padding: '0.5rem 1.25rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)'
              }}
            >
              Price
              <span className="material-icons" style={{ fontSize: '1rem', transition: 'transform 0.2s', transform: openDropdown === 'price' ? 'rotate(180deg)' : 'rotate(0)' }}>
                keyboard_arrow_down
              </span>
            </button>

            {openDropdown === 'price' && (
              <div className="filter-dropdown-card" style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                left: 0,
                width: '320px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                padding: '1.25rem',
                zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    The highest price is ₹ {maxPriceInProducts.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={resetPrice}
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Reset
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* From Price Input */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>₹</span>
                    <input 
                      type="number"
                      placeholder="From"
                      value={priceRange.from}
                      onChange={(e) => setPriceRange({ ...priceRange, from: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        background: 'transparent',
                        fontFamily: 'var(--font-serif)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>to</span>
                  {/* To Price Input */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>₹</span>
                    <input 
                      type="number"
                      placeholder="To"
                      value={priceRange.to}
                      onChange={(e) => setPriceRange({ ...priceRange, to: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        background: 'transparent',
                        fontFamily: 'var(--font-serif)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Count & Sort by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Product Count */}
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            {filteredSortedProducts.length} products
          </span>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '0.25rem 1rem 0.25rem 0.25rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-serif)',
                cursor: 'pointer',
                color: 'var(--foreground)'
              }}
            >
              <option value="manual">Featured</option>
              <option value="best-selling">Best selling</option>
              <option value="title-ascending">Alphabetically, A-Z</option>
              <option value="title-descending">Alphabetically, Z-A</option>
              <option value="price-ascending">Price, low to high</option>
              <option value="price-descending">Price, high to low</option>
              <option value="created-ascending">Date, old to new</option>
              <option value="created-descending">Date, new to old</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {isFiltered && (
        <div className="active-filters" style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          {availability.inStock && (
            <div style={chipStyle}>
              In stock
              <span className="material-icons" onClick={() => setAvailability({ ...availability, inStock: false })} style={closeIconStyle}>close</span>
            </div>
          )}
          {availability.outOfStock && (
            <div style={chipStyle}>
              Out of stock
              <span className="material-icons" onClick={() => setAvailability({ ...availability, outOfStock: false })} style={closeIconStyle}>close</span>
            </div>
          )}
          {priceRange.from !== '' && (
            <div style={chipStyle}>
              Price: Min ₹{parseFloat(priceRange.from).toLocaleString('en-IN')}
              <span className="material-icons" onClick={() => setPriceRange({ ...priceRange, from: '' })} style={closeIconStyle}>close</span>
            </div>
          )}
          {priceRange.to !== '' && (
            <div style={chipStyle}>
              Price: Max ₹{parseFloat(priceRange.to).toLocaleString('en-IN')}
              <span className="material-icons" onClick={() => setPriceRange({ ...priceRange, to: '' })} style={closeIconStyle}>close</span>
            </div>
          )}
          
          <button 
            onClick={resetAll}
            style={{
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              fontSize: '0.8rem',
              color: 'var(--primary)',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              fontFamily: 'var(--font-serif)'
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// Styling definitions
const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: '#f2ebe4',
  border: '1px solid var(--border)',
  padding: '0.35rem 0.75rem',
  fontSize: '0.75rem',
  color: 'var(--foreground)'
};

const closeIconStyle = {
  fontSize: '0.9rem',
  cursor: 'pointer',
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center'
};

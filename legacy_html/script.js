document.addEventListener('DOMContentLoaded', () => {

  // Page Transition Fade-In
  const overlay = document.querySelector('.page-transition');
  if (overlay) {
    // Small timeout to ensure the browser has painted the DOM first
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 50);
  }

  // Realm Ticker Arrow Controls
  const realmTrack = document.getElementById('realm-track');
  const realmPrev  = document.getElementById('realm-prev');
  const realmNext  = document.getElementById('realm-next');

  if (realmTrack && realmPrev && realmNext) {
    const CARD_WIDTH = 400 + 48; // card width + gap (3rem ≈ 48px)
    let isPaused = false;
    let resumeTimer;

    const pauseAutoScroll = () => {
      realmTrack.style.animationPlayState = 'paused';
      isPaused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        realmTrack.style.animationPlayState = 'running';
        isPaused = false;
      }, 5000);
    };

    realmNext.addEventListener('click', () => {
      pauseAutoScroll();
      const ticker = document.getElementById('realm-ticker');
      ticker.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
    });

    realmPrev.addEventListener('click', () => {
      pauseAutoScroll();
      const ticker = document.getElementById('realm-ticker');
      ticker.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
    });
  }

  // Smooth Page Transition on Link Click
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Ignore hash links, target blank, or javascript links
      if (href.startsWith('#') || href.startsWith('javascript:') || link.getAttribute('target') === '_blank') return;

      e.preventDefault();

      if (overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
          window.location.href = href;
        }, 800); // Matches CSS transition duration
      } else {
        window.location.href = href;
      }
    });
  });

  // Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: unobserve after animating once
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Image Load Reveal Animations
  const images = document.querySelectorAll('.img-reveal');
  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');

      const icon = menuToggle.querySelector('.material-icons');
      if (icon) {
        icon.innerText = navLinks.classList.contains('active') ? 'close' : 'menu';
      }
    });

    // Close menu when clicking a link (but not if it's a dropdown toggle)
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const isDropdownToggle = item.parentElement.classList.contains('dropdown');
        
        if (window.innerWidth <= 768 && isDropdownToggle) {
          e.preventDefault();
          e.stopPropagation();
          item.parentElement.classList.toggle('active');
          return;
        }

        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
        const icon = menuToggle.querySelector('.material-icons');
        if (icon) icon.innerText = 'menu';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
        const icon = menuToggle.querySelector('.material-icons');
        if (icon) icon.innerText = 'menu';
      }
    });
  }

  // Authentication Logic
  const updateAuthUI = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authLinks = document.querySelectorAll('.auth-link, .auth-link-placeholder, #auth-trigger');
    
    if (isLoggedIn) {
      authLinks.forEach(link => {
        link.href = '#';
        link.classList.add('auth-link');
        link.innerHTML = `<span class="material-icons">account_circle</span>`;
        link.title = 'Log Out';
        link.onclick = (e) => {
          e.preventDefault();
          if (confirm('Do you want to log out?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            window.location.reload();
          }
        };
      });
    } else {
      authLinks.forEach(link => {
        link.href = 'login.html';
        link.classList.add('auth-link');
        link.innerHTML = `<span class="material-icons">account_circle</span>`;
        link.title = 'Sign In';
        link.onclick = null;
      });
    }
  };

  updateAuthUI();

  // Cart Logic with Auth Protection
  const updateHeaderCounts = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
      cartCountEl.innerText = cart.length;
      cartCountEl.style.display = cart.length > 0 ? 'flex' : 'none';
    }
  };

  window.updateHeaderCounts = updateHeaderCounts;
  updateHeaderCounts();

  window.addToCart = (product) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      window.location.href = 'login.html';
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateHeaderCounts();

    // Show feedback
    const btn = document.getElementById('add-to-cart');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-icons">check</span> Added';
      btn.style.backgroundColor = 'var(--secondary)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
      }, 2000);
    }
  };

  // Product Gallery logic
  let currentImgIndex = 0;
  const mainImg = document.getElementById('main-img');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const galleryImages = [];

  if (mainImg && thumbnails.length > 0) {
    thumbnails.forEach((thumb) => {
      galleryImages.push(thumb.querySelector('img').src.replace('w=400', 'w=1000'));
    });

    window.setMainImage = (index, element) => {
      currentImgIndex = index;
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = galleryImages[index];
        mainImg.style.opacity = '1';
      }, 300);

      thumbnails.forEach(t => t.classList.remove('active'));
      if (element) {
        element.classList.add('active');
      } else {
        thumbnails[index].classList.add('active');
      }
    };

    window.nextImage = () => {
      currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
      setMainImage(currentImgIndex, thumbnails[currentImgIndex]);
    };

    window.prevImage = () => {
      currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
      setMainImage(currentImgIndex, thumbnails[currentImgIndex]);
    };

    // Auto-scroll
    let autoScrollInterval = setInterval(nextImage, 3000);

    // Pause auto-scroll on hover
    const galleryMain = document.querySelector('.gallery-main');
    if (galleryMain) {
      galleryMain.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
      galleryMain.addEventListener('mouseleave', () => autoScrollInterval = setInterval(nextImage, 3000));
    }
  }

  // Search Logic
  const searchTrigger = document.getElementById('search-trigger');
  const searchModal = document.getElementById('search-modal');
  const closeSearch = document.getElementById('close-search');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // Product Database (Enhanced with Multiple Images)
  const products = [
    { id: 'midnight-vetiver', name: 'Midnight Vetiver', price: '$185.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000'], desc: 'An architectural mystery. Haitian Vetiver distilled in traditional copper vessels, blended with Italian Bergamot and Black Pepper.' },
    { id: 'velvet-peony', name: 'Velvet Peony', price: '$160.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=1000'], desc: 'Ethereal and complex. Soft florals grounded by warm resins and delicate spices. A timeless signature.' },
    { id: 'desert-rose', name: 'Desert Rose', price: '$195.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'], desc: 'A resilient bloom in the arid dunes. Spice-infused rose with a heart of golden amber.' },
    { id: 'amber-oud', name: 'Amber Oud', price: '$210.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'], desc: 'Resinous oud meets the honeyed warmth of amber. A bold, enduring silhouette.' },
    { id: 'sandalwood-attar', name: 'Sandalwood Attar', price: '$220.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=1000'], desc: 'Deeply grounding pure sandalwood attar aged for decades. Intended for meditation and perfect stillness.' },
    { id: 'palo-santo', name: 'Palo Santo Incense', price: '$45.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000'], desc: 'Hand-rolled with ethically sourced Palo Santo wood. Purifies the air and grounds the spirit.' },
    { id: 'sacred-frank', name: 'Sacred Frankincense', price: '$130.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000'], desc: 'Pristine resin from the Dhofar region. A bridge between the terrestrial and the divine.' },
    { id: 'cedar-sage', name: 'Cedar & Sage', price: '$55.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1605651202774-94e6ad6500b8?auto=format&fit=crop&q=80&w=1000'], desc: 'Cleansing sage paired with the grounding strength of mountain cedar.' },
    { id: 'silk-musk', name: 'Silk Musk', price: '$175.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000'], desc: 'A second skin. Powdery musk intertwined with white blossoms and sheer vanilla.' },
    { id: 'night-jasmine', name: 'Night Jasmine', price: '$150.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000'], desc: 'Jasmine Sambac harvested at midnight. Heady, narcotic, and undeniably romantic.' },
    { id: 'cedarwood-ember', name: 'Cedarwood Ember', price: '$195.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=1000'], desc: 'A crackling hearth in a winter forest. Smoked cedarwood and glowing embers.' },
    { id: 'smoke-oak', name: 'Smoke & Oak', price: '$175.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'], desc: 'A rugged blend of ancient oakwood and sweet tobacco smoke.' },
    { id: 'ethereal-bloom', name: 'Ethereal Bloom', price: '$165.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1528740561666-dc2479da08ad?auto=format&fit=crop&q=80&w=1000'], desc: 'A translucent floral arrangement that floats like a whisper.' },
    { id: 'blush-tuberose', name: 'Blush Tuberose', price: '$180.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1543431109-79101f9f60a3?auto=format&fit=crop&q=80&w=1000'], desc: 'Heady tuberose softened by pink pepper and silk.' },
    { id: 'mystic-orchid', name: 'Mystic Orchid', price: '$210.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1000'], desc: 'A rare black orchid distilled with dark plum and patchouli.' },
    { id: 'black-saffron', name: 'Black Saffron', price: '$225.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000'], desc: 'Spiced leather and golden saffron. A scent of regal complexity.' },
    { id: 'night-forest', name: 'Night Forest', price: '$190.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1000'], desc: 'Damp earth, pine needles, and the cold air of a midnight woods.' },
    { id: 'golden-mimosa', name: 'Golden Mimosa', price: '$155.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000'], desc: 'Sunny mimosa blossoms with a honeyed finish.' },
    // Missing Products Added Below
    { id: 'silver-musk', name: 'Silver Musk', price: '$165.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000'], desc: 'A metallic, cold musk with ozone notes and white pepper.' },
    { id: 'coastal-drift', name: 'Coastal Drift', price: '$150.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000'], desc: 'Saltwater, driftwood, and marine air. A scent of the open sea.' },
    { id: 'nomad-oud', name: 'Nomad Oud', price: '$230.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'], desc: 'A wandering spirit. Rare oud blended with desert spices and sun-baked earth.' },
    { id: 'distant-shore', name: 'Distant Shore', price: '$170.00', category: 'Him Collection', images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000'], desc: 'The scent of a faraway land. Exotic fruits meeting cool ocean breezes.' },
    { id: 'satin-vanilla', name: 'Satin Vanilla', price: '$160.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=1000'], desc: 'Smooth, creamy vanilla orchid with a hint of warm musk.' },
    { id: 'white-neroli', name: 'White Neroli', price: '$145.00', category: 'Her Collection', images: ['https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&q=80&w=1000'], desc: 'Bright, citrusy orange blossoms in full bloom under the Mediterranean sun.' },
    { id: 'aged-oud', name: 'Aged Oud', price: '$250.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'], desc: 'Oud oil aged for 20 years in leather pouches. Animalic, woody, and deeply meditative.' },
    { id: 'lotus-essence', name: 'Lotus Essence', price: '$180.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=1000'], desc: 'The sacred lotus, distilled to capture its watery, floral purity.' },
    { id: 'mystic-myrrh', name: 'Mystic Myrrh', price: '$190.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1605651202774-94e6ad6500b8?auto=format&fit=crop&q=80&w=1000'], desc: 'Ancient resins and warm spices. A scent of spiritual ascension.' },
    { id: 'temple-rose', name: 'Temple Rose', price: '$170.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=1000'], desc: 'The scent of offerings. Damask rose petals meeting sandalwood incense.' },
    { id: 'zen-patchouli', name: 'Zen Patchouli', price: '$165.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=1000'], desc: 'Clean, earthy patchouli with a heart of white tea and silence.' },
    { id: 'divine-amber', name: 'Divine Amber', price: '$200.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=1000'], desc: 'Golden amber infused with sacred herbs and ancient oils.' },
    { id: 'sacred-vetiver', name: 'Sacred Vetiver', price: '$185.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000'], desc: 'The roots of life. Earthy, smoky vetiver for grounding the spirit.' },
    { id: 'celestial-musk', name: 'Celestial Musk', price: '$210.00', category: 'Spiritual Collection', images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000'], desc: 'An otherworldly musk that lingers like the stardust.' },
    { id: 'sandalwood-cones', name: 'Sandalwood Cones', price: '$35.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000'], desc: 'Slow-burning incense cones made from authentic Mysore sandalwood.' },
    { id: 'lavender-mist', name: 'Lavender Mist', price: '$40.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1605651202774-94e6ad6500b8?auto=format&fit=crop&q=80&w=1000'], desc: 'A calming atmosphere spray infused with wild lavender oil.' },
    { id: 'bergamot-diffuser', name: 'Bergamot Diffuser', price: '$65.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000'], desc: 'Bright, uplifting bergamot for a vibrant living space.' },
    { id: 'frank-resin', name: 'Frankincense Resin', price: '$50.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=1000'], desc: 'Pure resin tears for traditional coal burning.' },
    { id: 'midnight-candle', name: 'Midnight Candle', price: '$75.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000'], desc: 'A deep, mysterious scented candle for late-night reflection.' },
    { id: 'rosemary-smudge', name: 'Rosemary Smudge', price: '$30.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1605651202774-94e6ad6500b8?auto=format&fit=crop&q=80&w=1000'], desc: 'Hand-tied rosemary bundles for clearing and mental clarity.' },
    { id: 'oud-wood-chips', name: 'Oud Wood Chips', price: '$120.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=1000'], desc: 'High-quality oud wood chips for an opulent home fragrance.' },
    { id: 'sacred-sage', name: 'Sacred Sage', price: '$25.00', category: 'Home Collection', images: ['https://images.unsplash.com/photo-1605651202774-94e6ad6500b8?auto=format&fit=crop&q=80&w=1000'], desc: 'Ethically harvested white sage for cleansing rituals.' }

  ];

  // Inject Modal Structure (Enhanced for Gallery)
  const modalHTML = `
    <div class="product-modal" id="product-modal">
      <div class="product-modal-overlay" id="modal-overlay"></div>
      <div class="product-modal-container">
        <button class="product-modal-close" id="modal-close">
          <span class="material-icons">close</span>
        </button>
        
        <div class="product-modal-main">
          <div class="product-modal-gallery">
            <div class="modal-gallery-container">
              <img src="" alt="" id="modal-img">
              <button class="gallery-nav prev" id="modal-gallery-prev">
                <span class="material-icons">chevron_left</span>
              </button>
              <button class="gallery-nav next" id="modal-gallery-next">
                <span class="material-icons">chevron_right</span>
              </button>
              <div class="gallery-dots" id="modal-gallery-dots"></div>
            </div>
          </div>
          
          <div class="product-modal-content">
            <div class="label-caps" id="modal-category" style="color: var(--primary); margin-bottom: 1rem; letter-spacing: 0.2em; font-size: 0.7rem;"></div>
            <h2 id="modal-title" style="font-size: 2.8rem; margin-bottom: 1rem; font-family: var(--font-serif);"></h2>
            <div id="modal-price" style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--muted-foreground); font-weight: 300;"></div>
            
            <p id="modal-desc" style="line-height: 1.8; margin-bottom: 3rem; color: var(--muted-foreground); font-size: 1.05rem;"></p>
            
            <button class="btn-primary" id="modal-add-to-cart" style="width: 100%; margin-bottom: 2rem; padding: 1.25rem;">ADD TO CART</button>
            
            <div class="product-accordion" id="modal-accordions"></div>
          </div>
        </div>
        
        <div class="modal-extra-section" id="modal-reviews-section">
          <div class="container" style="padding: 4rem 2rem; border-top: 1px solid var(--border);">
            <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 3rem; text-align: center;">Customer Experience</h3>
            <div id="modal-reviews-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;"></div>
          </div>
        </div>

        <div class="modal-extra-section" id="modal-recommendations-section">
          <div class="container" style="padding: 4rem 2rem; border-top: 1px solid var(--border); background: rgba(0,0,0,0.02);">
            <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 3rem; text-align: center;">You May Also Savor</h3>
            <div id="modal-recommendations-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 3rem; max-width: 1000px; margin: 0 auto; justify-content: center;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const productModal = document.getElementById('product-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalPrice = document.getElementById('modal-price');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalAddToCart = document.getElementById('modal-add-to-cart');
  const modalAccordions = document.getElementById('modal-accordions');
  const modalReviewsList = document.getElementById('modal-reviews-list');
  const modalRecList = document.getElementById('modal-recommendations-list');
  const modalPrev = document.getElementById('modal-gallery-prev');
  const modalNext = document.getElementById('modal-gallery-next');
  const modalDots = document.getElementById('modal-gallery-dots');

  let currentModalProduct = null;
  let modalImageIndex = 0;
  let modalAutoScroll = null;

  const updateModalImage = () => {
    if (!currentModalProduct) return;
    modalImg.style.opacity = '0';
    setTimeout(() => {
      modalImg.src = currentModalProduct.images[modalImageIndex];
      modalImg.style.opacity = '1';
    }, 300);
    
    // Update dots
    const dots = modalDots.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === modalImageIndex);
    });
  };

  const startModalAutoScroll = () => {
    stopModalAutoScroll();
    modalAutoScroll = setInterval(() => {
      if (!currentModalProduct) return;
      modalImageIndex = (modalImageIndex + 1) % currentModalProduct.images.length;
      updateModalImage();
    }, 3000);
  };

  const stopModalAutoScroll = () => {
    if (modalAutoScroll) clearInterval(modalAutoScroll);
  };

  window.openProductModal = (productId) => {
    const product = products.find(p => p.id === productId) || products.find(p => p.name === productId);
    if (!product) return;

    currentModalProduct = product;
    modalImageIndex = 0;
    
    modalTitle.innerText = product.name;
    modalCategory.innerText = product.category;
    modalPrice.innerText = product.price;
    modalDesc.innerText = product.desc;
    
    // Setup Gallery
    modalDots.innerHTML = product.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('');
    updateModalImage();
    startModalAutoScroll();

    // Inject Accordions
    modalAccordions.innerHTML = `
      <div class="accordion-item active">
        <button class="accordion-header" onclick="toggleAccordion(this)">
          Product Information
          <span class="material-icons">add</span>
        </button>
        <div class="accordion-content">
          <p>${product.desc}</p>
          <ul style="margin-top: 1rem; list-style: disc; padding-left: 1.5rem; color: var(--muted-foreground);">
            <li>Hand-poured in small batches</li>
            <li>Long-lasting concentration (Eau de Parfum)</li>
          </ul>
        </div>
      </div>
      <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
          How to Wear
          <span class="material-icons">add</span>
        </button>
        <div class="accordion-content">
          <p>Apply to pulse points—wrists, neck, and behind the ears.</p>
        </div>
      </div>
    `;

    // Inject Reviews
    const mockReviews = [
      { name: "Aria R.", stars: 5, text: "The most evocative scent I've ever owned." },
      { name: "Julian K.", stars: 4, text: "Beautifully complex. The dry down is incredible." }
    ];
    modalReviewsList.innerHTML = mockReviews.map(r => `
      <div class="review-card" style="background: #fff; padding: 2rem; border: 1px solid var(--border);">
        <div class="review-stars" style="color: var(--primary); margin-bottom: 1rem;">
          ${'<span class="material-icons" style="font-size: 1.2rem;">star</span>'.repeat(r.stars)}
        </div>
        <p style="font-style: italic; margin-bottom: 1rem; color: var(--foreground);">"${r.text}"</p>
        <div style="font-size: 0.8rem; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.1em;">${r.name}</div>
      </div>
    `).join('');

    // Recommendations
    const recs = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    modalRecList.innerHTML = recs.map(p => `
      <div class="rec-item" style="text-align: center; cursor: pointer; max-width: 220px; margin: 0 auto;" onclick="openProductModal('${p.id}')">
        <div style="aspect-ratio: 1; overflow: hidden; margin-bottom: 1rem; border: 1px solid var(--border);">
          <img src="${p.images[0]}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <h4 style="font-family: var(--font-serif); font-size: 0.9rem; margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h4>
        <div style="color: var(--muted-foreground); font-size: 0.8rem;">${p.price}</div>
      </div>
    `).join('');

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.querySelector('.product-modal-container').scrollTop = 0;

    modalAddToCart.onclick = () => {
      addToCart({ name: product.name, price: product.price, image: product.images[0], category: product.category });
      const originalText = modalAddToCart.innerText;
      modalAddToCart.innerText = 'ADDED TO CART';
      setTimeout(() => modalAddToCart.innerText = originalText, 2000);
    };
  };

  modalPrev.onclick = () => {
    if (!currentModalProduct) return;
    modalImageIndex = (modalImageIndex - 1 + currentModalProduct.images.length) % currentModalProduct.images.length;
    updateModalImage();
    stopModalAutoScroll();
  };

  modalNext.onclick = () => {
    if (!currentModalProduct) return;
    modalImageIndex = (modalImageIndex + 1) % currentModalProduct.images.length;
    updateModalImage();
    stopModalAutoScroll();
  };

  const closeProductModal = () => {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
    stopModalAutoScroll();
  };

  if (modalClose) modalClose.onclick = closeProductModal;
  if (modalOverlay) modalOverlay.onclick = closeProductModal;

  // Intercept Product Clicks
  document.addEventListener('click', (e) => {
    const productLink = e.target.closest('a');
    if (productLink && (productLink.getAttribute('href') === '#' || productLink.classList.contains('product-card'))) {
      const titleEl = productLink.querySelector('h3');
      if (titleEl) {
        e.preventDefault();
        openProductModal(titleEl.innerText);
      }
    }
  });

  // Search & Suggestions Logic
  const searchTriggers = document.querySelectorAll('#search-trigger, .search-trigger, .action-btn#search-trigger');
  
  const showRandomSuggestions = () => {
    if (!searchResults || !products) return;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 5);
    
    searchResults.innerHTML = `
      <div style="position: sticky; top: 0; background: #fff; padding: 1rem 0; font-size: 0.7rem; letter-spacing: 0.2em; color: var(--muted-foreground); text-transform: uppercase; z-index: 10; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 1rem;">Trending Searches</div>
      ${suggestions.map(p => `
        <div class="search-result-item" style="cursor: pointer;" onclick="openProductModal('${p.id}'); document.getElementById('search-modal').classList.remove('active');">
          <img src="${p.images[0]}" alt="${p.name}">
          <div class="item-info">
            <h4>${p.name}</h4>
            <div class="price">${p.price}</div>
          </div>
        </div>
      `).join('')}
    `;
  };

  searchTriggers.forEach(trigger => {
    trigger.onclick = () => {
      searchModal.classList.add('active');
      showRandomSuggestions();
      setTimeout(() => searchInput.focus(), 100);
    };
  });

  if (closeSearch) {
    closeSearch.onclick = () => {
      searchModal.classList.remove('active');
    };
  }

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
      searchModal.classList.remove('active');
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      if (term.length < 2) {
        showRandomSuggestions();
        return;
      }

      const filtered = products.filter(p => p.name.toLowerCase().includes(term));
      
      searchResults.innerHTML = filtered.length > 0 ? filtered.map(p => `
        <div class="search-result-item" style="cursor: pointer;" onclick="openProductModal('${p.id}'); document.getElementById('search-modal').classList.remove('active');">
          <img src="${p.images[0]}" alt="${p.name}">
          <div class="item-info">
            <h4>${p.name}</h4>
            <div class="price">${p.price}</div>
          </div>
        </div>
      `).join('') : '<div style="padding: 2rem; text-align: center; color: var(--muted-foreground);">No products found matching your search.</div>';
    });
  }
});

// Raahi Enhancement Functions
function toggleAccordion(button) {
  const item = button.parentElement;
  item.classList.toggle('active');
}

function shareProduct() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href);
    const btn = document.querySelector('.share-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons">check</span> Link Copied';
    setTimeout(() => btn.innerHTML = originalText, 2000);
  }
}

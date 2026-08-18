# Project Architecture — Itran Website

## 1. Executive Summary
This document provides a comprehensive, read-only architectural overview of the **Itran** web application. Itran is a luxury fragrance and artisanal perfumery e-commerce platform built on Next.js 16 (App Router), React 19, Vanilla CSS, and Firebase (Firestore, Storage, Authentication). Payment processing is powered by Razorpay.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16.2.4 (App Router)
- **UI Library**: React 19.2.4
- **State Management**: React Context API (`context/AppContext.js`) + LocalStorage fallback
- **Styling**: Vanilla CSS (`app/globals.css`), CSS Modules / CSS Variables, Inline CSS for dynamic layouts
- **Animation**: Framer Motion 12.38.0 (`components/Reveal.js`) + CSS Keyframe Animations
- **Icons**: Google Material Icons (`<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />`)

### Backend & API
- **Runtime**: Node.js via Next.js Server Actions & Route Handlers (`app/api/`)
- **Admin SDK**: `firebase-admin` 13.10.0 (lazy server-side initialization via `lib/firebaseAdmin.js`)
- **Client SDK**: `firebase` 12.12.1 (Firestore, Storage, Auth)
- **Payment Gateway**: `razorpay` 2.9.6 Node SDK

### Database & Storage
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (`heros/`, `products/`, `packaging/`, `journal/`, `story/`)
- **Auth Provider**: Firebase Authentication (Email/Password & Google Provider)

---

## 3. Project Structure

```
ittar/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── [collection]/           # Dynamic collection listing page (e.g. /him, /her, /perfume-oil)
│   ├── all-products/          # Full product catalogue with search & filter
│   ├── api/                    # Server-side API endpoints
│   │   ├── admin/verify/       # Server token verification for Admin Auth
│   │   └── payments/           # Razorpay order creation & payment verification
│   ├── blog/                   # Journal/Blog listing & detail views ([id])
│   ├── bulk-enquiry/           # Existing Bulk Enquiry / Corporate Gifting form page
│   ├── cart/                   # Shopping cart & checkout drawer/view
│   ├── change-product/         # Admin Panel (Monolithic dashboard with tabs)
│   ├── contact/                # Contact form page & Atelier details
│   ├── heritage/               # Brand heritage story page
│   ├── login/                  # Customer login & account creation page
│   ├── orders/                 # Customer order history page
│   ├── our-story/              # Brand story page
│   ├── product/[id]/           # Product details page with fragrance notes & reviews
│   ├── realm/[id]/             # Realm / Scent profile details page
│   ├── shipping-returns/       # Shipping Policy & Returns information
│   ├── sustainability/        # Sustainability commitment page
│   ├── track-order/            # Order tracking page
│   ├── wishlist/               # User wishlist page
│   ├── globals.css             # Core design system tokens, typography, and utility classes
│   ├── layout.js               # Root layout wrapping AppProvider, Header, Footer, Modals
│   └── page.js                 # Landing homepage (Hero video, bestsellers, realms, story)
├── components/                 # Reusable React components
│   ├── FilterSort.js           # Catalogue filter & sorting drawer
│   ├── Footer.js               # Global site footer navigation
│   ├── Header.js               # Global site navigation header with dropdowns & search
│   ├── NotificationToast.js    # Global floating feedback notification toast
│   ├── ProductCard.js          # Reusable product grid card with badge scaling & cached image fix
│   ├── ProductModal.js         # Quick-view modal overlay for product details
│   ├── RealmTicker.js          # Horizontal marquee ticker for scent realms
│   ├── Reveal.js               # Scroll-triggered animation wrapper component
│   └── SearchModal.js          # Fullscreen overlay instant search modal
├── context/                    # App-wide React Context
│   └── AppContext.js           # Cart, Wishlist, User Auth, Products, Packaging state management
├── lib/                        # Helper utilities & SDK initializers
│   ├── constants.js            # Hardcoded static product fallbacks & categories
│   ├── firebase.js             # Client-side Firebase app initialization
│   ├── firebaseAdmin.js        # Server-side Firebase Admin SDK lazy initializer
│   ├── packaging.js            # Firestore helper CRUD functions for gift packaging
│   ├── products.js             # Firestore helper CRUD functions for products
│   └── razorpay.js             # Server-side Razorpay SDK instance initializer
├── public/                     # Static media assets & images
│   ├── images/                 # Static brand logos and imagery
│   └── videos/                 # Homepage video assets
├── scripts/                    # Maintenance & administrative Node scripts
│   ├── addAdmin.mjs            # CLI script to grant admin role to Firestore user
│   └── checkOrders.mjs         # CLI script to inspect order collection
├── package.json                # Project dependencies & scripts
├── next.config.mjs             # Next.js configuration
└── .env.local                  # Environment variables (API keys, secrets)
```

---

## 4. Application Routes

| Path | Purpose | Access | Primary Data Source |
|---|---|---|---|
| `/` | Homepage | Public | Firestore (`settings/our-story`, `settings/hero-images`, `products`) |
| `/all-products` | Full Product Catalogue | Public | Firestore (`products`) |
| `/[collection]` | Category Listings (e.g., `/perfume-oil`, `/him`) | Public | Firestore (`products`) |
| `/product/[id]` | Product Detail View | Public | Firestore (`products`, `reviews`) |
| `/realm/[id]` | Scent Realm Details | Public | Firestore (`products`) |
| `/cart` | Shopping Cart & Checkout | Public / Auth | Firestore (`carts`, `gift_packaging`) |
| `/wishlist` | Saved Items | Customer Auth | Firestore (`wishlists`) |
| `/login` | Customer Authentication | Public | Firebase Auth |
| `/orders` | Order History | Customer Auth | Firestore (`orders`) |
| `/track-order` | Order Status Search | Public | Firestore (`orders`) |
| `/bulk-enquiry` | Bulk / Corporate Enquiry Form | Public | Firestore (`bulkEnquiries`) |
| `/contact` | General Inquiry & Contact Form | Public | Firestore (`contactEnquiries`, `settings/contact`) |
| `/our-story` | Brand Story & Craftsmanship | Public | Firestore (`settings/our-story`) |
| `/heritage` | Heritage History | Public | Firestore (`settings/hero-images`) |
| `/sustainability` | Sustainability Commitments | Public | Firestore (`settings/hero-images`) |
| `/blog` | Journal / Articles List | Public | Firestore (`journal`, `settings/journal`) |
| `/blog/[id]` | Journal Article View | Public | Firestore (`journal`) |
| `/shipping-returns` | Policy Information | Public | Static |
| `/change-product` | Admin Management Dashboard | Admin Auth | Firestore (`products`, `orders`, `bulkEnquiries`, `contactEnquiries`, etc.) |

---

## 5. Frontend Architecture

- **State Management**: `<AppProvider>` (`context/AppContext.js`) wraps the application at the root layout. It manages user authentication status, cart items, wishlist items, product lists, gift packaging options, and notifications.
- **Local Synchronization**: Cart and wishlist changes are stored immediately in `localStorage` for responsive client updates and debounced (1.5s) to Firestore for authenticated users.
- **Scroll Animations**: Handled via `Reveal.js` wrapping `framer-motion` components.
- **Responsiveness**: Fully responsive layout controlled by breakpoint media queries in `app/globals.css` (Breakpoints: 1024px, 768px, 480px).

---

## 6. Backend Architecture

- **Next.js Route Handlers**:
  - `POST /api/admin/verify`: Validates client Firebase Auth ID Token server-side via `firebaseAdmin` and checks `admins/{uid}` Firestore document for `role === 'admin'`.
  - `POST /api/payments/create-order`: Calculates order total server-side and initializes a Razorpay order.
  - `POST /api/payments/verify-payment`: Verifies Razorpay HMAC SHA256 signature, validates payment amount, and writes the completed order to `orders` collection via `firebaseAdmin`.

---

## 7. Database Architecture (Cloud Firestore)

| Collection | Purpose | Key Fields |
|---|---|---|
| `products` | Catalogue items | `name`, `category`, `price`, `costPrice`, `images`, `description`, `notes`, `isBestSeller`, `inStock` |
| `orders` | Completed orders | `orderId`, `userId`, `customerDetails`, `orderedProducts`, `totalAmount`, `orderStatus`, `paymentStatus`, `orderDate` |
| `users` | Customer profiles | `email`, `avatar`, `lastSeen` |
| `carts` | Saved user shopping carts | `items`, `updatedAt` |
| `wishlists` | Saved user wishlists | `items`, `updatedAt` |
| `bulkEnquiries` | Bulk & Volume Enquiries | `fullName`, `phone`, `email`, `productName`, `quantity`, `message`, `status`, `createdAt` |
| `contactEnquiries` | General Contact Messages | `fullName`, `email`, `phone`, `subject`, `message`, `status`, `createdAt` |
| `gift_packaging` | Add-on gift packaging options | `name`, `price`, `image`, `enabled`, `description` |
| `admins` | Admin roles & permissions | `email`, `role` (`admin`), `createdAt` |
| `journal` | Blog articles | `title`, `date`, `excerpt`, `image`, `content`, `createdAt` |
| `settings` | Dynamic page content docs | Sub-documents: `our-story`, `contact`, `hero-images`, `journal` |

---

## 8. Existing Navigation & Header

Location: `components/Header.js`
- **Shop Dropdown**: Contains `PERFUME OIL` (subcategories: `HIM`, `HER`, `UNISEX`), `DIFFUSERS`, `DHOOP STICKS`, and `GIFTS` (subcategories: `HIM`, `HER`, `COUPLE`).
- **Main Nav Links**: `Shop All` (`/all-products`), `Bulk Queries` (`/bulk-enquiry`), `Contact` (`/contact`), `Our Story` (`/our-story`), `Journal` (`/blog`), `Track Order` (`/track-order`).
- **Action Icons**: Search modal trigger, User Profile menu / Login link, Wishlist link with counter, Cart link with item counter.
- **Mobile Menu**: Responsive hamburger toggle with expandable sub-accordions.

---

## 9. Existing Gifting & Bulk Enquiry Features

1. **Public Bulk Enquiry Page** (`app/bulk-enquiry/page.js`):
   - Hero title: "Bespoke & Volume - Bulk Enquiries"
   - Subtitle: "For weddings, corporate gifts, or luxury hospitality partnerships..."
   - Form fields: `fullName`, `phone`, `email`, `productName`, `quantity`, `message`.
   - Action: Submits data to `bulkEnquiries` collection with `status: 'Pending'`.

2. **Admin Dashboard Bulk Section** (`app/change-product/page.js`):
   - Tab header: `BULK ({enquiries.length})`
   - Real-time listener on `bulkEnquiries` collection ordered by `createdAt desc`.
   - Filters: Search by name/email/product, filter by status (`Pending`, `Contacted`, `In Progress`, `Completed`, `Cancelled`).
   - Actions: Update enquiry status, delete enquiry.

3. **Gift Packaging Management** (`lib/packaging.js` & Admin `PACKAGING` tab):
   - Manages custom gift boxes/wrapping in `gift_packaging` collection.

---

## 10. Design System & CSS Tokens

Location: `app/globals.css`
- **Primary Color**: `#8B4513` / `#b91c1c` (accent maroon/amber)
- **Background**: `#faf9f7` (warm off-white/beige) / `#ffffff`
- **Foreground/Text**: `#1a1a1a` / `#1c1917`
- **Muted Background**: `#f5f5f0` / `#faf9f7`
- **Border**: `#e5e5e0` / `#eee`
- **Typography**: Serif for headings (`font-serif`), Sans-serif for body.
- **Utility Class**: `.label-caps` (uppercase text, `letter-spacing: 0.15em` or `0.3em`).
- **Buttons**: `.btn-primary` (solid dark background), `.btn-secondary` (outlined), `.back-btn` / `.floating-back` (floating back button).

---

## 11. Technical Debt & Architectural Observations

1. **Monolithic Admin Component**: `app/change-product/page.js` contains over 3,000 lines of code handling all admin tabs in a single client component.
2. **Direct Client Firestore Writes**: Customer enquiry submissions (`/bulk-enquiry` and `/contact`) perform direct `addDoc` calls using client-side Firestore SDK.
3. **Double Verification**: Auth token is verified on client-side via Firebase Auth listener and validated server-side on `/api/admin/verify`.

---

## 12. Bulk Gifting Integration Map (Future Reference)

When implementing or extending Bulk Gifting in the future:
1. **Existing Page**: `/bulk-enquiry` (`app/bulk-enquiry/page.js`) is already established for bulk/volume inquiries.
2. **Existing Navigation**: Header link `Bulk Queries` points to `/bulk-enquiry`.
3. **Existing Admin Location**: Tab `BULK` in `app/change-product/page.js` manages `bulkEnquiries`.
4. **Existing Database Model**: `bulkEnquiries` Firestore collection already stores bulk request fields (`fullName`, `phone`, `email`, `productName`, `quantity`, `message`, `status`, `createdAt`).
5. **Reusable Components**: `Reveal.js`, `Header.js`, `Footer.js`, `ProductCard.js`, `globals.css` styling tokens (`btn-primary`, `label-caps`, form inputs).

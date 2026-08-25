import type { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PRODUCTS } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://itran.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Core Static Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/all-products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bulk-enquiry`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/our-story`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/heritage`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/sustainability`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/shipping-returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/track-order`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Collection & Category Pages
  const collectionSlugs = [
    'perfume-oil',
    'diffusers',
    'dhoop-sticks',
    'him',
    'her',
    'unisex',
    'car-diffusers',
    'home-diffuser',
    'gift',
    'gift-him',
    'gift-her',
    'gift-couple',
    'sandali',
    'mohak',
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Dynamic Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      productRoutes = productsSnap.docs.map((doc) => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || now;
        return {
          url: `${BASE_URL}/product/${doc.id}`,
          lastModified: updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
    } else {
      productRoutes = PRODUCTS.map((p) => ({
        url: `${BASE_URL}/product/${p.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    productRoutes = PRODUCTS.map((p) => ({
      url: `${BASE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // 4. Dynamic Journal / Blog Posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const journalSnap = await getDocs(collection(db, 'journal'));
    if (!journalSnap.empty) {
      blogRoutes = journalSnap.docs.map((doc) => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || now;
        return {
          url: `${BASE_URL}/blog/${doc.id}`,
          lastModified: updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        };
      });
    } else {
      const fallbackBlogIds = ['1', '2', '3'];
      blogRoutes = fallbackBlogIds.map((id) => ({
        url: `${BASE_URL}/blog/${id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    const fallbackBlogIds = ['1', '2', '3'];
    blogRoutes = fallbackBlogIds.map((id) => ({
      url: `${BASE_URL}/blog/${id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  // 5. Dynamic Realms
  let realmRoutes: MetadataRoute.Sitemap = [];
  try {
    const realmsSnap = await getDocs(collection(db, 'realms'));
    if (!realmsSnap.empty) {
      realmRoutes = realmsSnap.docs.map((doc) => ({
        url: `${BASE_URL}/realm/${doc.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    // Non-critical, continue
  }

  return [
    ...staticRoutes,
    ...collectionRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...realmRoutes,
  ];
}

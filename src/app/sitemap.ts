import { MetadataRoute } from 'next';
import { readDB } from '../lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zarevia.vercel.app';
  const db = readDB();

  const productUrls: MetadataRoute.Sitemap = (db.products || []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const collectionSlugs = [
    'all-shoes', 'best-selling', 'sale', 'heel', 'flat',
    'mules', 'boston', 'chappal', 'slide', 'karchupizardosi',
    'thongs', 'strappy', 'drshoe',
  ];

  const collectionUrls: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...collectionUrls,
    ...productUrls,
  ];
}

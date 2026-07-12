import React from 'react';
import { readDB } from '../../../lib/db';
import { CollectionClient } from './CollectionClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const searchVal = typeof sParams.search === 'string' ? sParams.search : '';

  const db = readDB();
  const allProducts = db.products || [];
  const navbarItems = db.navbar || [];

  // Find the menu label for this collection slug
  const currentMenu = navbarItems.find(
    (item) => item.url.endsWith(`/${slug}`) || item.url.includes(`/collections/${slug}`)
  );
  
  // Format Title
  let collectionTitle = currentMenu ? currentMenu.label : slug.replace(/-/g, ' ');
  if (slug === 'all-shoes') collectionTitle = 'All Shoes';
  if (slug === 'sale') collectionTitle = 'SALE Clearance';
  if (slug === 'best-selling') collectionTitle = 'Best Selling';

  // Filter products based on collection slug
  let filtered = allProducts;
  if (slug === 'sale') {
    filtered = allProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
  } else if (slug === 'best-selling') {
    filtered = allProducts.filter((p) => p.isBestSelling || p.collections.includes('best-selling'));
  } else if (slug !== 'all-shoes') {
    filtered = allProducts.filter((p) => p.collections.includes(slug));
  }

  return (
    <CollectionClient
      title={collectionTitle}
      slug={slug}
      initialProducts={filtered}
      initialSearch={searchVal}
    />
  );
}

import React from 'react';
import { readDB } from '../../../lib/db';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  
  const db = readDB();
  const product = db.products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Get shipping settings to pass down
  const settings = db.settings || {
    shippingFeeDhaka: 80,
    shippingFeeOutside: 150,
  };

  return (
    <ProductDetailClient
      product={product}
      shippingFeeDhaka={settings.shippingFeeDhaka}
      shippingFeeOutside={settings.shippingFeeOutside}
    />
  );
}

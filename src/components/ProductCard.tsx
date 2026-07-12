'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/db';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link href={`/products/${product.slug}`} className="card-img-wrapper">
        {/* Sale Badge */}
        {hasDiscount && <span className="badge-sale">-{discountPercent}% SALE</span>}
        {!product.inStock && <span className="badge-outofstock">SOLD OUT</span>}
        
        {/* Product Image */}
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/images/zeen-low-heel.jpg'}
          alt={product.name}
          className="card-img"
          loading="lazy"
        />
      </Link>
      
      <div className="card-info">
        <span className="card-brand">MYRO</span>
        <h4 className="card-title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h4>
        
        <div className="card-price-row">
          <span className="price">Tk {product.price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="original-price">Tk {product.originalPrice!.toLocaleString()}</span>
          )}
        </div>
        
        <div className="card-sizes">
          <span>Sizes: {product.sizes.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

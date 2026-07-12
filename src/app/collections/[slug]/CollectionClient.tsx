'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '../../../lib/db';
import { ProductCard } from '../../../components/ProductCard';

interface CollectionClientProps {
  title: string;
  slug: string;
  initialProducts: Product[];
  initialSearch: string;
}

export const CollectionClient: React.FC<CollectionClientProps> = ({
  title,
  slug,
  initialProducts,
  initialSearch,
}) => {
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Available sizes to filter (36 to 41 are standard)
  const availableSizes = ['36', '37', '38', '39', '40', '41'];

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter by Size
    if (sizeFilter) {
      result = result.filter((p) => p.sizes.includes(sizeFilter));
    }

    // Filter by Stock
    if (stockFilter) {
      const inStockOnly = stockFilter === 'instock';
      result = result.filter((p) => p.inStock === inStockOnly);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [initialProducts, searchQuery, sizeFilter, stockFilter, sortBy]);

  return (
    <div>
      {/* Category Header */}
      <header className="collection-header">
        <div className="container">
          <h1 className="collection-title">{title}</h1>
          <p className="collection-description">
            Showing {processedProducts.length} premium handcrafted item{processedProducts.length !== 1 ? 's' : ''} in this collection.
          </p>
        </div>
      </header>

      {/* Main Grid and Filters Section */}
      <section className="section-padding">
        <div className="container">
          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="filters">
              {/* Size Filter */}
              <select
                className="filter-select"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
              >
                <option value="">All Sizes</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    Size {size}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                className="filter-select"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="">Availability</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>

              {/* Search text within collection */}
              <input
                type="text"
                placeholder="Search in page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  width: '180px',
                  backgroundColor: 'white',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Featured</option>
                <option value="newest">Sort: New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {processedProducts.length > 0 ? (
            <div className="product-grid">
              {processedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--foreground-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No products found matching your filters.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '15px' }}
                onClick={() => {
                  setSizeFilter('');
                  setStockFilter('');
                  setSortBy('default');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

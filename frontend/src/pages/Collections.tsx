import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const Collections: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<number>(3000);

  // Sizes & Colors ranges
  const sizes = ['36', '37', '38', '39', '40', '41'];
  const colors = ['Beige', 'Black', 'Nude', 'Off-White', 'Tan', 'Golden', 'Maroon', 'Silver'];

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        // Fetch Categories to find slug details
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        // Fetch products with params
        let url = `/products?sort=${sortOption}`;
        
        // If we are looking for a specific category slug (excluding all-shoes / sale / best-selling helper slugs)
        const isHelperSlug = ['all-shoes', 'sale', 'best-selling'].includes(slug || '');
        if (slug && !isHelperSlug) {
          url += `&category=${slug}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const prodRes = await api.get(url);
        let items = prodRes.data;

        // Apply helper slug filters manually if needed
        if (slug === 'sale') {
          items = items.filter((p: any) => p.discountPrice);
        } else if (slug === 'best-selling') {
          items = items.filter((p: any) => p.isBestSeller);
        }

        setProducts(items);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [slug, searchQuery, sortOption]);

  // Client-side filtering logic
  const filteredProducts = products.filter((p) => {
    // 1. Size filter
    if (selectedSize) {
      const hasSize = p.variants?.some((v: any) => v.size === selectedSize && (onlyInStock ? v.stock > 0 : true));
      if (!hasSize) return false;
    }

    // 2. Color filter
    if (selectedColor) {
      const hasColor = p.variants?.some(
        (v: any) => v.color.toLowerCase() === selectedColor.toLowerCase() && (onlyInStock ? v.stock > 0 : true)
      );
      if (!hasColor) return false;
    }

    // 3. Stock filter
    if (onlyInStock) {
      const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
      if (totalStock <= 0) return false;
    }

    // 4. Price filter
    const activePrice = p.discountPrice ? Number(p.discountPrice) : Number(p.price);
    if (activePrice > priceRange) return false;

    return true;
  });

  // Get active Category title
  const currentCategory = categories.find((c) => c.slug === slug);
  const displayTitle = searchQuery
    ? `Search Results for "${searchQuery}"`
    : currentCategory
    ? currentCategory.name
    : slug === 'sale'
    ? 'Clearance Sale'
    : slug === 'best-selling'
    ? 'Best Sellers'
    : 'All Shoes Collection';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#f3eae3] rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col justify-center min-h-48 border border-neutral-100">
        <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-[#faf6f3] rounded-l-full opacity-40 blur-lg hidden md:block" />
        <div className="z-10 space-y-2 max-w-xl">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary-light px-3 py-1.5 rounded-full">
            Collections
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-charcoal tracking-wide mt-2">
            {displayTitle}
          </h1>
          <p className="text-xs text-neutral-400">
            Showing {filteredProducts.length} premium design{filteredProducts.length !== 1 ? 's' : ''} available.
          </p>
        </div>
      </div>

      {/* Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
            <SlidersHorizontal size={18} className="text-primary" />
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal">Filters</h3>
          </div>

          {/* Size Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Filter By Size</h4>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSize === sz
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-charcoal border-neutral-200 hover:border-primary'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Filter By Color</h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedColor === col
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-neutral-200 hover:border-charcoal'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Max Price</h4>
              <span className="text-xs font-bold text-primary">BDT {priceRange}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-3 border border-neutral-100 bg-neutral-50/50 rounded-xl">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">In-Stock Only</label>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-300 accent-primary"
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting Header Row */}
          <div className="flex justify-between items-center bg-white p-3 border border-neutral-100 rounded-xl shadow-sm">
            <div className="text-xs font-semibold text-neutral-400">
              Found {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-neutral-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs font-semibold text-charcoal bg-transparent outline-none cursor-pointer border border-neutral-200 rounded-lg px-2.5 py-1.5"
              >
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Best Sellers First</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-neutral-50 animate-pulse rounded-2xl border border-neutral-100" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100 shadow-sm">
              <span className="text-4xl block mb-3">🔍</span>
              <h4 className="font-semibold text-charcoal text-lg">No products found</h4>
              <p className="text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
                No designs match your selected filters. Try broadening your criteria.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default Collections;

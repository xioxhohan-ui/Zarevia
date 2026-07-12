import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    sku: string;
    isBestSeller?: boolean;
    isTrending?: boolean;
    status: string;
    category?: { name: string } | null;
    images: { url: string }[];
    variants: { id: string; size: string; color: string; stock: number }[];
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem: addWishlist, items: wishlistItems, removeItem: removeWishlist } = useWishlistStore();
  const { addItem: addCart } = useCartStore();

  const isSaved = wishlistItems.some((item) => item.id === product.id);
  const primaryImage = product.images?.[0]?.url || '/placeholder.jpg';
  
  const originalPrice = Number(product.price);
  const currentPrice = product.discountPrice ? Number(product.discountPrice) : originalPrice;
  const isDiscounted = !!product.discountPrice;
  const discountPercent = isDiscounted 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        id: product.id,
        name: product.name,
        price: originalPrice,
        discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
        slug: product.slug,
        image: primaryImage,
      });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pick the first available variant with stock
    const availableVariant = product.variants.find((v) => v.stock > 0);
    if (!availableVariant) return;

    addCart({
      productId: product.id,
      name: product.name,
      image: primaryImage,
      price: currentPrice,
      size: availableVariant.size,
      color: availableVariant.color,
      quantity: 1,
      variantId: availableVariant.id,
    });
  };

  const isOutOfStock = product.variants.reduce((sum, v) => sum + v.stock, 0) === 0;

  return (
    <Link 
      to={`/products/${product.slug}`} 
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isDiscounted && (
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            -{discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Best Seller
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-neutral-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sold Out
          </span>
        )}
      </div>

      {/* Image Gallery wrapper */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-50 relative">
        <img 
          src={primaryImage} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <div className="flex gap-2 w-full">
            <button 
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="flex-1 bg-white hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-400 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs font-bold text-charcoal transition-all"
            >
              <ShoppingCart size={14} /> Quick Add
            </button>
            
            <button 
              onClick={toggleWishlist}
              className={`p-2.5 rounded-xl shadow-md flex items-center justify-center transition-all ${
                isSaved ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-white hover:bg-neutral-50 text-charcoal'
              }`}
            >
              <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Details footer */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest">
            {product.category?.name || 'Shoe'}
          </p>
          <h4 className="text-sm font-bold text-charcoal truncate">{product.name}</h4>
        </div>
        
        <div className="flex items-baseline gap-2 mt-3 pt-2 border-t border-neutral-50">
          <span className="text-sm font-extrabold text-charcoal">BDT {currentPrice}</span>
          {isDiscounted && (
            <span className="text-xs line-through text-neutral-400">BDT {originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;

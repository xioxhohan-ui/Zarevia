import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { Trash2, ShoppingBag } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { items, removeItem, moveToCart } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh] space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-charcoal">My Saved Items</h1>
        <p className="text-sm text-neutral-400 mt-1">
          You have {items.length} saved shoe{items.length !== 1 ? 's' : ''} in your wishlist.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100 shadow-sm max-w-lg mx-auto">
          <span className="text-5xl block mb-4">🤍</span>
          <h3 className="font-heading font-bold text-lg text-charcoal">Your Wishlist is Empty</h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
            Find items you love and tap the heart icon to save them here for quick access.
          </p>
          <Link 
            to="/collections/all-shoes"
            className="mt-6 inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div 
              key={item.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 relative"
            >
              <div className="aspect-[4/5] bg-neutral-50 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-full shadow-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-charcoal truncate">{item.name}</h4>
                  <span className="text-sm font-extrabold text-charcoal mt-1 block">BDT {item.price}</span>
                </div>
                <button
                  onClick={() => moveToCart(item, item.id + '_default_var', '38', 'Beige')}
                  className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag size={14} /> Move To Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Wishlist;

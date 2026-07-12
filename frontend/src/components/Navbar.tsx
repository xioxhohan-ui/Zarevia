import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu as MenuIcon, 
  X, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { items, setCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, logout } = useAuthStore();
  
  const [navItems, setNavItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch dynamic navigation links from categories & fallback
  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await api.get('/categories');
        const activeCategories = res.data.filter((c: any) => c.isActive);
        
        // Form custom menus
        const formatted = [
          { label: 'All Shoes', url: '/collections/all-shoes' },
          ...activeCategories.map((c: any) => ({
            label: c.name,
            url: `/collections/${c.slug}`
          }))
        ];
        setNavItems(formatted);
      } catch (err) {
        // Fallback static menu
        setNavItems([
          { label: 'All Shoes', url: '/collections/all-shoes' },
          { label: 'Heel', url: '/collections/heel' },
          { label: 'Flat', url: '/collections/flat' },
          { label: 'Mules', url: '/collections/mules' },
          { label: 'Boston', url: '/collections/boston' },
        ]);
      }
    };
    fetchNav();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections/all-shoes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass shadow-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden w-11 h-11 flex items-center justify-center text-charcoal hover:text-primary transition-colors rounded-full hover:bg-neutral-50"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <MenuIcon size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-heading font-extrabold tracking-wider text-charcoal flex items-center gap-1">
            JARAVIEA<span className="text-primary font-bold">.</span>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex space-x-8">
            {navItems.slice(0, 7).map((item, idx) => (
              <Link
                key={idx}
                to={item.url}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors py-2 relative group ${
                  location.pathname === item.url ? 'text-primary' : 'text-muted hover:text-primary'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                  location.pathname === item.url ? 'w-full' : ''
                }`} />
              </Link>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Button */}
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!isSearchOpen)}
                className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-primary transition-colors rounded-full hover:bg-neutral-50"
                aria-label="Search Products"
              >
                <Search size={20} />
              </button>
              
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 mt-3 md:w-72 bg-white rounded-xl shadow-lg border border-neutral-100 p-3 z-50"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        autoFocus
                      />
                      <button type="submit" className="absolute right-3 top-2.5 text-neutral-400 hover:text-primary">
                        <Search size={16} />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link 
              to="/wishlist" 
              className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-primary transition-colors rounded-full hover:bg-neutral-50 relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button 
              onClick={() => setCartOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-primary transition-colors rounded-full hover:bg-neutral-50 relative"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="w-11 h-11 flex items-center justify-center text-charcoal hover:text-primary transition-colors rounded-full hover:bg-neutral-50 relative gap-1"
                aria-label="User Profile"
              >
                <User size={20} />
                <ChevronDown size={14} className="opacity-60" />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-50"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs text-neutral-400">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-charcoal">{user.name}</p>
                        </div>
                        
                        <Link 
                          to="/dashboard" 
                          className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary flex items-center gap-2"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={16} /> My Dashboard
                        </Link>

                        
                        <button 
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-50 flex items-center gap-2 border-t border-neutral-100"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          to="/login" 
                          className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary flex items-center gap-2"
                          onClick={() => setProfileOpen(false)}
                        >
                          Login / Register
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-full bg-white z-50 shadow-xl flex flex-col p-6"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <span className="text-xl font-heading font-extrabold tracking-wider">JARAVIEA.</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-neutral-400 hover:text-primary">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col space-y-4">
                {navItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-neutral-700 hover:text-primary transition-colors py-2 border-b border-neutral-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';

export const Home: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [promoCards, setPromoCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackBanners = [
    {
      id: 'fallback-1',
      heading: 'Up to 40% OFF',
      subtitle: 'Summer Collection',
      description: 'Step into comfort with our original summer designs and premium slides.',
      buttonText: 'Shop Now',
      buttonUrl: '/collections/slide',
      desktopImageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=1200&auto=format&fit=crop',
      discountBadge: '40% OFF',
      overlayColor: 'rgba(0,0,0,0.3)',
      duration: 5,
    },
    {
      id: 'fallback-2',
      heading: "Premium Women's Footwear",
      subtitle: 'New Arrivals',
      description: 'Discover handcrafted block heels and flats designed for the modern woman.',
      buttonText: 'Explore Collection',
      buttonUrl: '/collections/heel',
      desktopImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop',
      discountBadge: 'NEW',
      overlayColor: 'rgba(0,0,0,0.35)',
      duration: 5,
    },
    {
      id: 'fallback-3',
      heading: 'Exclusive Designs',
      subtitle: 'Limited Offer',
      description: 'Shop our luxury Boston clogs and mules before stocks run out.',
      buttonText: 'Buy Now',
      buttonUrl: '/collections/boston',
      desktopImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
      discountBadge: 'LIMITED',
      overlayColor: 'rgba(0,0,0,0.3)',
      duration: 5,
    }
  ];

  const fallbackCards = [
    {
      id: 'card-1',
      title: 'Up to 50% OFF',
      description: 'Deals on summer flats.',
      discountText: 'Save Big',
      badgeText: '🔥 Flash Sale',
      buttonText: 'Shop Now',
      buttonUrl: '/collections/flat',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'card-2',
      title: 'Premium Collection',
      description: 'Handcrafted mules & heels.',
      discountText: 'New Arrivals',
      badgeText: '✨ New Arrival',
      buttonText: 'Explore',
      buttonUrl: '/collections/mules',
      imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=600&auto=format&fit=crop',
    }
  ];

  const activeBanners = banners.length > 0 ? banners : fallbackBanners;
  const activeCards = promoCards.length > 0 ? promoCards : fallbackCards;

  const [sliderSettings, setSliderSettings] = useState({
    autoplay: true,
    autoplayDelay: 5000,
    transitionSpeed: 700,
    infiniteLoop: true,
    pauseOnHover: true,
    showArrows: true,
    showDots: true,
    enableSwipe: true,
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => {
          const nextIndex = prev - 1;
          if (nextIndex < 0) return sliderSettings.infiniteLoop ? activeBanners.length - 1 : prev;
          return nextIndex;
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= activeBanners.length) return sliderSettings.infiniteLoop ? 0 : prev;
          return nextIndex;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBanners, sliderSettings]);

  // Autoplay handler
  useEffect(() => {
    if (!sliderSettings.autoplay || isHovered || activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= activeBanners.length) {
          return sliderSettings.infiniteLoop ? 0 : prev;
        }
        return nextIndex;
      });
    }, sliderSettings.autoplayDelay);
    return () => clearInterval(interval);
  }, [currentSlideIndex, isHovered, activeBanners, sliderSettings]);

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderSettings.enableSwipe) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderSettings.enableSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!sliderSettings.enableSwipe || !touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      setCurrentSlideIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= activeBanners.length) return sliderSettings.infiniteLoop ? 0 : prev;
        return nextIndex;
      });
    } else if (isRightSwipe) {
      setCurrentSlideIndex((prev) => {
        const nextIndex = prev - 1;
        if (nextIndex < 0) return sliderSettings.infiniteLoop ? activeBanners.length - 1 : prev;
        return nextIndex;
      });
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch Categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data.filter((c: any) => c.isActive && c.isFeatured));

        // Fetch Banners
        const bannersRes = await api.get('/hero/banners');
        setBanners(bannersRes.data);

        // Fetch Promo Cards
        const cardsRes = await api.get('/hero/cards');
        setPromoCards(cardsRes.data);

        // Fetch Site settings for slider configs
        try {
          const settingsRes = await api.get('/settings');
          const data = settingsRes.data;
          setSliderSettings({
            autoplay: data.sliderAutoplay !== 'false',
            autoplayDelay: parseInt(data.sliderAutoplayDelay) || 5000,
            transitionSpeed: parseInt(data.sliderTransitionSpeed) || 700,
            infiniteLoop: data.sliderInfiniteLoop !== 'false',
            pauseOnHover: data.sliderPauseOnHover !== 'false',
            showArrows: data.sliderShowArrows !== 'false',
            showDots: data.sliderShowDots !== 'false',
            enableSwipe: data.sliderEnableSwipe !== 'false',
          });
        } catch (err) {
          console.warn('Failed to load dynamic slider settings:', err);
        }

        // Fetch Best Sellers
        const bestRes = await api.get('/products?featured=true');
        setBestSellers(bestRes.data.slice(0, 4));

        // Fetch Sale items
        const allRes = await api.get('/products');
        const saleItems = allRes.data.filter((p: any) => p.discountPrice).slice(0, 4);
        setSaleProducts(saleItems);
      } catch (err) {
        console.error('Error fetching home page products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const getCardVisibility = (card: any) => {
    let classes = '';
    if (!card.showOnDesktop) classes += ' xl:hidden';
    if (!card.showOnLaptop) classes += ' lg:max-xl:hidden';
    if (!card.showOnTablet) classes += ' md:max-lg:hidden';
    if (!card.showOnMobile) classes += ' max-md:hidden';
    return classes;
  };

  const trustItems = [
    { emoji: '💵', title: 'Cash on Delivery', desc: 'Pay on delivery, inspect at your doorstep' },
    { emoji: '🔄', title: '3-Day Size Exchange', desc: 'Sizing mismatch? Swap within 3 business days' },
    { emoji: '📦', title: 'Free Delivery', desc: 'Free standard shipping on orders over BDT 2,500' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Upgrade Homepage Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: Autoplay Infinite Slider (72-75%) */}
          <div 
            className="col-span-1 lg:col-span-9 relative h-[380px] sm:h-[450px] md:h-[500px] xl:h-[550px] rounded-3xl overflow-hidden shadow-lg border border-neutral-100/50 bg-white"
            onMouseEnter={() => { if (sliderSettings.pauseOnHover) setIsHovered(true); }}
            onMouseLeave={() => { if (sliderSettings.pauseOnHover) setIsHovered(false); }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {activeBanners.length > 0 && (
              <div className="absolute inset-0 w-full h-full">
                <AnimatePresence mode="popLayout">
                  {activeBanners.map((banner, index) => {
                    if (index !== currentSlideIndex) return null;
                    return (
                      <motion.div
                        key={banner.id || index}
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        transition={{ duration: sliderSettings.transitionSpeed / 1000, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 w-full h-full flex items-center justify-start p-8 sm:p-12 md:p-16"
                      >
                        {/* Background Overlay Color & Gradient */}
                        <div 
                          className="absolute inset-0 z-10 transition-colors duration-500" 
                          style={{ backgroundColor: banner.overlayColor || 'rgba(0,0,0,0.3)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />

                        {/* Banner Image with responsive source sets */}
                        <picture className="absolute inset-0 w-full h-full">
                          {banner.mobileImageUrl && <source media="(max-w: 640px)" srcSet={banner.mobileImageUrl} />}
                          {banner.tabletImageUrl && <source media="(max-w: 1024px)" srcSet={banner.tabletImageUrl} />}
                          <img
                            src={banner.desktopImageUrl}
                            alt={banner.heading}
                            className="absolute inset-0 w-full h-full object-cover object-center select-none animate-fade-in"
                            loading="eager"
                          />
                        </picture>

                        {/* Slide Content */}
                        <div className="relative z-20 max-w-xl text-left text-white space-y-4 md:space-y-6">
                          {banner.subtitle && (
                            <motion.span 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="inline-block text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-white/95 px-3 py-1.5 rounded-full"
                            >
                              {banner.subtitle}
                            </motion.span>
                          )}
                          <motion.h1 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight tracking-wide"
                          >
                            {banner.heading}
                          </motion.h1>
                          {banner.description && (
                            <motion.p 
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-sm md:text-base text-neutral-200 line-clamp-2 md:line-clamp-none font-medium leading-relaxed"
                            >
                              {banner.description}
                            </motion.p>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-2 flex items-center gap-4"
                          >
                            <Link 
                              to={banner.buttonUrl || '/'}
                              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 group tracking-wider uppercase min-h-[44px]"
                            >
                              {banner.buttonText || 'Shop Now'} 
                              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {banner.discountBadge && (
                              <span className="text-xs font-bold text-yellow-300 border border-yellow-300/40 px-3 py-1.5 rounded-lg bg-yellow-500/10 backdrop-blur-sm">
                                {banner.discountBadge}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Manual Navigation Arrows */}
            {sliderSettings.showArrows && activeBanners.length > 1 && (
              <>
                <button
                  onClick={() => {
                    setCurrentSlideIndex((prev) => {
                      const nextIndex = prev - 1;
                      if (nextIndex < 0) return sliderSettings.infiniteLoop ? activeBanners.length - 1 : prev;
                      return nextIndex;
                    });
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/45 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => {
                    setCurrentSlideIndex((prev) => {
                      const nextIndex = prev + 1;
                      if (nextIndex >= activeBanners.length) return sliderSettings.infiniteLoop ? 0 : prev;
                      return nextIndex;
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/45 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Pagination dot controls */}
            {sliderSettings.showDots && activeBanners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/15 backdrop-blur-sm px-3.5 py-2 rounded-full border border-white/10">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex ? 'w-6 bg-primary' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Stacked Promotional Cards (25%) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-3 lg:h-[380px] lg:sm:h-[450px] lg:md:h-[500px] lg:xl:h-[550px]">
            {activeCards.slice(0, 2).map((card, idx) => (
              <div 
                key={card.id || idx}
                className={`relative overflow-hidden rounded-3xl border border-neutral-100 shadow-md flex flex-col justify-end p-6 group cursor-pointer bg-charcoal bg-cover bg-center h-full min-h-[180px] sm:min-h-[210px] lg:min-h-0 ${getCardVisibility(card)}`}
                style={{ backgroundImage: `url(${card.imageUrl})` }}
              >
                {/* Overlay & Glass Effect */}
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-300 z-10" />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />

                {/* Glassmorphism Panel for text details */}
                <div className="relative z-20 text-left text-white space-y-2 glass p-4 rounded-2xl border border-white/10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="flex justify-between items-center gap-2">
                    {card.badgeText && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-white px-2 py-1 rounded-md">
                        {card.badgeText}
                      </span>
                    )}
                    {card.discountText && (
                      <span className="text-[10px] font-bold text-yellow-300">
                        {card.discountText}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-heading font-extrabold truncate">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-xs text-neutral-300 line-clamp-1">
                      {card.description}
                    </p>
                  )}
                  <Link
                    to={card.buttonUrl || '/'}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover pt-1 transition-colors group/btn min-h-[44px]"
                  >
                    {card.buttonText || 'Explore'} 
                    <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Featured Category circles */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-bold text-charcoal uppercase tracking-wider">
              Browse Categories
            </h3>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/collections/${cat.slug}`}
                className="flex flex-col items-center space-y-3 group flex-shrink-0"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-100 group-hover:border-primary transition-all duration-300 shadow-sm p-1 bg-white">
                  <img 
                    src={cat.thumbnailUrl || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=200&auto=format&fit=crop'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <span className="text-xs font-bold text-charcoal group-hover:text-primary transition-colors uppercase tracking-wider">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Best Sellers grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-charcoal">Best Selling Shoes</h2>
            <p className="text-xs text-muted mt-1">Our most popular designs handcrafted for comfort.</p>
          </div>
          <Link to="/collections/all-shoes" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.length > 0 ? (
              bestSellers.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))
            ) : (
              <p className="col-span-full text-center text-sm text-neutral-400 py-10">
                No featured best seller products found.
              </p>
            )}
          </div>
        )}
      </section>

      {/* 4. Hot Sale Clearance Section */}
      <section className="bg-neutral-50 py-16 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-neutral-200 pb-4">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-charcoal">Hot Sale Deals</h2>
              <p className="text-xs text-muted mt-1">Premium selections with exclusive markdown savings.</p>
            </div>
            <Link to="/collections/all-shoes" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
              View All Sale <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.length > 0 ? (
              saleProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))
            ) : (
              <p className="col-span-full text-center text-sm text-neutral-400 py-10">
                No active promotional discount items currently.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. Sizing & Sourcing Accordion policies */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-heading font-extrabold text-charcoal text-center mb-8">
          Shopping Policies & Sizing
        </h2>

        <div className="space-y-4">
          <details className="group border border-neutral-200 rounded-xl bg-white p-4 [&_summary::-webkit-details-marker]:hidden" open>
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">
                1. Delivery & Shipping Information
              </span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="text-sm text-neutral-500 mt-4 space-y-2 border-t border-neutral-100 pt-3">
              <p>• <strong>Inside Dhaka:</strong> Delivered in 24 to 48 hours. Delivery fee is BDT 80.</p>
              <p>• <strong>Outside Dhaka:</strong> Delivered in 3 to 5 business days. Delivery fee is BDT 150.</p>
              <p>• <strong>Free Shipping:</strong> Automatically activated on all cart subtotals above BDT 2,500!</p>
            </div>
          </details>

          <details className="group border border-neutral-200 rounded-xl bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">
                2. 3-Day Sizing & Return Policy
              </span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="text-sm text-neutral-500 mt-4 space-y-2 border-t border-neutral-100 pt-3">
              <p>We facilitate zero-hassle size swapping within 3 days of delivery:</p>
              <p>1. Keep the footwear unworn and inside its original packaging box.</p>
              <p>2. Drop a request via our hotline (+880 1700-000000) or email support@jaraviea.com.</p>
              <p>3. A replacement pair will be dispatched, and our courier will swap it at your address.</p>
            </div>
          </details>

          <details className="group border border-neutral-200 rounded-xl bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
              <span className="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">
                3. Sizing Reference Scale (EU Size)
              </span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="text-sm text-neutral-500 mt-4 space-y-2 border-t border-neutral-100 pt-3">
              <p>Measure your foot length to match our standard fitting guide:</p>
              <table className="w-full border-collapse mt-2 text-xs text-left">
                <thead>
                  <tr className="bg-neutral-50 text-charcoal border-b border-neutral-200">
                    <th className="p-2.5 font-semibold">EU Size</th>
                    <th className="p-2.5 font-semibold">UK Size</th>
                    <th className="p-2.5 font-semibold">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr><td className="p-2">36</td><td className="p-2">3</td><td className="p-2">22.5 cm</td></tr>
                  <tr><td className="p-2">37</td><td className="p-2">4</td><td className="p-2">23.0 cm</td></tr>
                  <tr><td className="p-2">38</td><td className="p-2">5</td><td className="p-2">23.8 cm</td></tr>
                  <tr><td className="p-2">39</td><td className="p-2">6</td><td className="p-2">24.6 cm</td></tr>
                  <tr><td className="p-2">40</td><td className="p-2">7</td><td className="p-2">25.1 cm</td></tr>
                  <tr><td className="p-2">41</td><td className="p-2">8</td><td className="p-2">25.9 cm</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* 6. Brand trust boxes */}
      <section className="bg-[#faf6f3] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-neutral-100/50">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <h4 className="font-heading font-bold text-charcoal text-sm uppercase tracking-wider">{item.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Newsletter capture */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 z-10 max-w-md">
            <h3 className="text-2xl font-heading font-extrabold tracking-wide">Join the VIP list</h3>
            <p className="text-sm text-neutral-400">
              Subscribe to receive updates on flash clearances, new arrival drops, and special coupon codes.
            </p>
          </div>

          <form className="w-full max-w-sm flex gap-3 z-10" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl text-sm border border-neutral-700 outline-none focus:border-primary"
            />
            <button type="submit" className="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};
export default Home;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Heart, ShoppingBag, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem: addCart } = useCartStore();
  const { addItem: addWishlist, items: wishlistItems } = useWishlistStore();

  const [product, setProduct] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const mobileSliderRef = React.useRef<HTMLDivElement>(null);

  // Instant Checkout Form States
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSaved = wishlistItems.some((item) => item.id === product?.id);

  const activeImageIndex = product?.images?.findIndex((img: any) => img.url === selectedImage) ?? 0;

  useEffect(() => {
    if (mobileSliderRef.current && product?.images) {
      const container = mobileSliderRef.current;
      const width = container.clientWidth;
      if (width > 0) {
        container.scrollTo({
          left: activeImageIndex * width,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImage, activeImageIndex, product?.images]);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0 && product?.images) {
      const index = Math.round(scrollLeft / width);
      if (product.images[index] && product.images[index].url !== selectedImage) {
        setSelectedImage(product.images[index].url);
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        
        // Default select first image
        if (res.data.images?.length > 0) {
          setSelectedImage(res.data.images[0].url);
        }
        
        // Auto-select first variant color & size if available
        if (res.data.variants?.length > 0) {
          setSelectedSize(res.data.variants[0].size);
          setSelectedColor(res.data.variants[0].color);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-charcoal font-heading">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
          Go back Home
        </button>
      </div>
    );
  }

  const originalPrice = Number(product.price);
  const currentPrice = product.discountPrice ? Number(product.discountPrice) : originalPrice;
  const isDiscounted = !!product.discountPrice;

  // Sizing list
  const availableSizes = Array.from(new Set(product.variants.map((v: any) => v.size))) as string[];
  const availableColors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[];

  // Find variant for selected combination
  const selectedVariant = product.variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );
  
  const stockAvailable = selectedVariant ? selectedVariant.stock : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addCart({
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url || '/placeholder.jpg',
      price: currentPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      variantId: selectedVariant.id,
    });
  };

  const handleWishlist = () => {
    addWishlist({
      id: product.id,
      name: product.name,
      price: originalPrice,
      discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
      slug: product.slug,
      image: product.images?.[0]?.url || '/placeholder.jpg',
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !streetAddress || !selectedVariant) {
      setErrorMsg('Please select a size/color variant and fill in delivery details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        paymentMethod: 'COD',
        shippingAddress: {
          fullName,
          phone,
          streetAddress,
          city: district,
          district,
        },
        items: [
          {
            variantId: selectedVariant.id,
            quantity,
          },
        ],
        guestPhone: phone,
      };

      const res = await api.post('/orders/checkout', payload);
      navigate(`/order-success?id=${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Checkout totals computation
  const checkoutSubtotal = currentPrice * quantity;
  const checkoutShipping = checkoutSubtotal > 2500 ? 0 : district === 'Dhaka' ? 80 : 150;
  const checkoutTax = checkoutSubtotal * 0.05;
  const checkoutTotal = checkoutSubtotal + checkoutShipping + checkoutTax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10 space-y-12">
      
      {/* Product main block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          {/* Desktop Gallery (Grid + Thumbnails) */}
          <div className="hidden md:block space-y-4">
            <div className="aspect-[4/5] bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100 relative">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {product.images?.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`aspect-square bg-neutral-50 rounded-lg overflow-hidden border transition-all ${
                    selectedImage === img.url ? 'border-primary border-2' : 'border-neutral-200 hover:border-primary'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Swipeable Gallery (Carousel + Dot indicators) */}
          <div className="block md:hidden space-y-3">
            <div 
              ref={mobileSliderRef}
              onScroll={handleMobileScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-2 rounded-2xl"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {product.images?.map((img: any, idx: number) => (
                <div key={idx} className="snap-center shrink-0 w-full aspect-[4/5] bg-neutral-50 border border-neutral-100 overflow-hidden rounded-2xl animate-fade-in">
                  <img src={img.url} alt={product.name} className="w-full h-full object-cover" loading={idx === 0 ? "eager" : "lazy"} />
                </div>
              ))}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-1">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      selectedImage === img.url ? 'w-5 bg-primary' : 'w-1.5 bg-neutral-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: details and controls */}
        <div className="space-y-6 md:sticky md:top-24 h-fit">
          <div className="space-y-2">
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
              {product.category?.name || 'Shoe'}
            </p>
            <h1 className="text-3xl font-heading font-extrabold text-charcoal tracking-wide">
              {product.name}
            </h1>
            <p className="text-xs text-neutral-400">SKU: {product.sku}</p>
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-2xl font-extrabold text-charcoal">BDT {currentPrice}</span>
            {isDiscounted && (
              <span className="text-base line-through text-neutral-400">BDT {originalPrice}</span>
            )}
          </div>

          <div className="border-t border-b border-neutral-100 py-4 space-y-4 text-sm text-neutral-600">
            <p>{product.description}</p>
            {product.material && <p><strong>Material:</strong> {product.material}</p>}
          </div>

          {/* Sizing selection */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400 tracking-wider">
                <span>Select Size</span>
                <span className="text-[10px] text-neutral-300">Available: 36-41</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
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
          )}

          {/* Color selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                Select Color
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
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
          )}

          {/* Stock availability banner */}
          <div className="text-xs">
            {stockAvailable > 0 ? (
              <span className="text-emerald-500 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                ✓ In Stock ({stockAvailable} remaining)
              </span>
            ) : (
              <span className="text-red-500 font-semibold bg-red-50 px-2.5 py-1 rounded-full">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Actions panel */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-neutral-200 rounded-xl bg-white h-12 px-2.5">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:text-primary transition-colors text-xs font-bold"
              >
                -
              </button>
              <span className="text-sm font-semibold px-3 w-8 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:text-primary transition-colors text-xs font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={stockAvailable === 0}
              className="flex-1 h-12 bg-primary hover:bg-primary-hover disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
            >
              <ShoppingBag size={16} /> Add To Bag
            </button>
            <button
              onClick={handleWishlist}
              className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all ${
                isSaved
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-neutral-200 hover:border-primary text-charcoal'
              }`}
            >
              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Instant Cash on Delivery Checkout Form on Page */}
          <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-sm">
            <button 
              onClick={() => setCheckoutOpen(!isCheckoutOpen)}
              className="w-full p-4 bg-neutral-900 hover:bg-black text-white text-sm font-bold uppercase tracking-wider flex justify-between items-center transition-colors"
            >
              <span>Instant Cash on Delivery Order</span>
              <span>{isCheckoutOpen ? '▲' : '▼'}</span>
            </button>
            
            {isCheckoutOpen && (
              <form onSubmit={handlePlaceOrder} className="p-5 space-y-4 border-t border-neutral-100">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg font-medium">
                    {errorMsg}
                  </div>
                )}
                {stockAvailable <= 0 && (
                  <div className="p-3 bg-amber-50 text-amber-600 text-xs rounded-lg font-medium flex items-center gap-1">
                    <AlertTriangle size={14} /> Selected variant is currently sold out.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase">Full Name *</label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase">Phone Number *</label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">District *</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-xs outline-none bg-white"
                  >
                    <option value="Dhaka">Inside Dhaka (Tk 80)</option>
                    <option value="Outside Dhaka">Outside Dhaka (Tk 150)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Street Address *</label>
                  <textarea 
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House, road number, delivery location details..."
                    rows={2.5}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>

                {/* Billing Summary */}
                <div className="bg-neutral-50 p-4 rounded-xl text-xs space-y-1.5 text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>BDT {checkoutSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>{checkoutShipping === 0 ? 'Free' : `BDT ${checkoutShipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (5%)</span>
                    <span>BDT {checkoutTax.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-charcoal pt-1.5 border-t border-neutral-200">
                    <span>Total Cost</span>
                    <span>BDT {checkoutTotal.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || stockAvailable <= 0}
                  className="w-full py-2.5 bg-[#f23086] hover:bg-[#d21d6f] disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Submitting Order...' : 'Confirm Cash On Delivery Order'}
                </button>
              </form>
            )}
          </div>

          {/* Quick policies info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span>Fast Doorstep Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-primary" />
              <span>3-Days Sizing Swaps</span>
            </div>
          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {product.relatedTo?.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-neutral-100">
          <h2 className="text-xl font-heading font-extrabold text-charcoal">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {product.relatedTo.slice(0, 4).map((relatedProd: any) => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      {!isCheckoutOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-100 p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-400 font-bold truncate">{product.name}</p>
            <p className="text-sm font-extrabold text-charcoal">
              BDT {currentPrice}
              {selectedSize && <span className="text-[10px] text-primary ml-1.5 font-bold">({selectedSize})</span>}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={stockAvailable === 0}
            className="flex-1 h-11 bg-primary hover:bg-primary-hover disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <ShoppingBag size={16} /> Add To Bag
          </button>
        </div>
      )}

    </div>
  );
};
export default ProductDetail;

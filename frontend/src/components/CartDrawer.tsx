import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    isCartOpen, 
    setCartOpen, 
    removeItem, 
    updateQuantity, 
    clearCart 
  } = useCartStore();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2500 ? 0 : district === 'Dhaka' ? 80 : 150;
  const tax = subtotal * 0.05; // 5% VAT
  const total = subtotal + shippingFee + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !streetAddress) {
      setErrorMsg('Please fill in all required checkout fields.');
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
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        guestEmail: guestEmail || undefined,
        guestPhone: phone,
      };

      const res = await api.post('/orders/checkout', payload);
      clearCart();
      setCartOpen(false);
      setCheckoutStep('cart');
      navigate(`/order-success?id=${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={() => setCartOpen(false)}
          />

          {/* Cart Drawer panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-110 max-w-full bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h3 className="font-heading font-bold text-lg text-charcoal">
                  {checkoutStep === 'cart' ? 'Shopping Bag' : 'Express Checkout'}
                </h3>
              </div>
              <button 
                onClick={() => setCartOpen(false)} 
                className="p-2 text-neutral-400 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Empty Cart State */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-semibold text-lg text-charcoal">Your bag is empty</h4>
                <p className="text-sm text-muted mt-2 max-w-xs">
                  It looks like you haven't added any shoes to your bag yet. Let's start shopping!
                </p>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Content Panel */}
                {checkoutStep === 'cart' ? (
                  /* ----------------- STEP 1: CART ITEMS LIST ----------------- */
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-4 p-3 border border-neutral-100 rounded-xl bg-white hover:shadow-sm transition-shadow">
                        <div className="w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-charcoal truncate">{item.name}</h4>
                              <button 
                                onClick={() => removeItem(item.variantId)}
                                className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="text-xs text-muted mt-0.5">Size: {item.size} | Color: {item.color}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                              <button 
                                onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                                className="p-1 px-2 hover:text-primary transition-colors text-xs"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-semibold px-2">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="p-1 px-2 hover:text-primary transition-colors text-xs"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-charcoal">BDT {item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ----------------- STEP 2: EXPRESS CHECKOUT FORM ----------------- */
                  <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {errorMsg && (
                      <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg font-medium">
                        {errorMsg}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Recipient's full name"
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="For invoice copy"
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Delivery Region / District *</label>
                      <select 
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                      >
                        <option value="Dhaka">Inside Dhaka (Tk 80)</option>
                        <option value="Outside Dhaka">Outside Dhaka (Tk 150)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address *</label>
                      <textarea 
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="House number, road number, area detail..."
                        rows={3}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-2">
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="text-xs text-neutral-400 hover:text-primary font-medium"
                      >
                        ← Back to Shopping Bag
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer summary and checkout buttons */}
                <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-charcoal">BDT {subtotal}</span>
                    </div>
                    {checkoutStep === 'checkout' && (
                      <>
                        <div className="flex justify-between">
                          <span>Delivery Charge</span>
                          <span className="font-semibold text-charcoal">
                            {shippingFee === 0 ? 'Free' : `BDT ${shippingFee}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (5%)</span>
                          <span className="font-semibold text-charcoal">BDT {tax.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-neutral-200">
                      <span>Total Estimate</span>
                      <span className="text-primary">
                        BDT {checkoutStep === 'checkout' ? total.toFixed(1) : subtotal}
                      </span>
                    </div>
                  </div>

                  {checkoutStep === 'cart' ? (
                    <button 
                      onClick={() => setCheckoutStep('checkout')}
                      className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      Checkout via Cash on Delivery <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-neutral-900 hover:bg-black disabled:bg-neutral-400 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      {isSubmitting ? 'Processing Order...' : 'Confirm Cash On Delivery'}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;

'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
    triggerToast,
  } = useCart();

  const [isCheckingOut, setCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [isSubmitting, setSubmitting] = useState(false);

  const shippingFee = district === 'Dhaka' ? 80 : 150;
  const totalAmount = cartTotal + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      triggerToast('Please fill all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        deliveryAddress,
        district,
        shippingFee,
        totalAmount,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        triggerToast('Order placed successfully! We will call you soon.');
        clearCart();
        setCheckingOut(false);
        setCartOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
      } else {
        triggerToast('Failed to place order. Try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3 className="cart-title">{isCheckingOut ? 'Checkout (Cash on Delivery)' : 'Your Shopping Cart'}</h3>
          <button className="close-btn" onClick={() => {
            setCartOpen(false);
            setCheckingOut(false);
          }}>&times;</button>
        </div>

        {isCheckingOut ? (
          <form className="cart-items" style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleCheckoutSubmit}>
            <div className="order-form-header" style={{ borderBottom: 'none' }}>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', textAlign: 'center', marginBottom: '10px' }}>
                Fill in your details to complete your order. Pay Cash on Delivery.
              </p>
            </div>
            
            <div className="form-group">
              <label className="option-label">Your Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="option-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="01xxxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="option-label">Delivery Address *</label>
              <textarea
                className="form-input"
                placeholder="House, Street, Area"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="option-label">District *</label>
              <select
                className="form-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value as 'Dhaka' | 'Outside Dhaka')}
              >
                <option value="Dhaka">Inside Dhaka (Tk 80)</option>
                <option value="Outside Dhaka">Outside Dhaka (Tk 150)</option>
              </select>
            </div>

            <div className="order-summary-box" style={{ marginTop: '10px' }}>
              <div className="order-summary-row">
                <span>Subtotal:</span>
                <span>Tk {cartTotal.toLocaleString()}</span>
              </div>
              <div className="order-summary-row">
                <span>Delivery:</span>
                <span>Tk {shippingFee}</span>
              </div>
              <div className="order-summary-row order-summary-total">
                <span>Total:</span>
                <span>Tk {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
                onClick={() => setCheckingOut(false)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <p>Your cart is currently empty.</p>
                  <button className="btn btn-primary" onClick={() => setCartOpen(false)}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img className="cart-item-img" src={item.image} alt={item.name} />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-meta">Size: {item.size} | Color: {item.color}</p>
                      <p className="cart-item-price">Tk {item.price.toLocaleString()}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span className="cart-summary-total">Tk {cartTotal.toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--foreground-muted)', textAlign: 'center' }}>
                  Shipping fee calculated at checkout
                </p>
                <button className="btn btn-primary" onClick={() => setCheckingOut(true)}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Product } from '../../../lib/db';
import { useCart } from '../../../context/CartContext';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: Product;
  shippingFeeDhaka: number;
  shippingFeeOutside: number;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  shippingFeeDhaka,
  shippingFeeOutside,
}) => {
  const { addToCart, triggerToast } = useCart();
  const [activeImage, setActiveImage] = useState<string>(product.images[0] || '/images/zeen-low-heel.jpg');
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '');
  const [quantity, setQuantity] = useState<number>(1);

  // Cash on Delivery Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [isSubmitting, setSubmitting] = useState(false);

  const shippingFee = district === 'Dhaka' ? shippingFeeDhaka : shippingFeeOutside;
  const subtotal = product.price * quantity;
  const totalAmount = subtotal + shippingFee;

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      triggerToast('Please select a size', 'error');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/images/zeen-low-heel.jpg',
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (product.sizes.length > 0 && !selectedSize) {
      triggerToast('Please select a shoe size before placing order.', 'error');
      return;
    }
    if (!customerName || !customerPhone || !deliveryAddress) {
      triggerToast('Please fill out all order form details.', 'error');
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
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            color: selectedColor,
            quantity,
          },
        ],
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        triggerToast('Order placed successfully! We will call you soon to confirm.');
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setQuantity(1);
      } else {
        triggerToast('Could not complete order. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Something went wrong. Please check connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '25px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
          <Link href="/">Home</Link> &nbsp;/&nbsp;&nbsp; 
          <Link href="/collections/all-shoes">Shoes</Link> &nbsp;/&nbsp;&nbsp;
          <span style={{ color: 'var(--foreground)' }}>{product.name}</span>
        </div>

        {/* Details Grid */}
        <div className="product-details-grid">
          
          {/* Left Column: Image Gallery */}
          <div className="gallery-container">
            <div className="main-image-wrapper">
              <img src={activeImage} alt={product.name} className="main-image" />
            </div>
            
            {/* Thumbnails (in case there are multiple images) */}
            {product.images.length > 1 && (
              <div className="thumbnail-row">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Ordering */}
          <div className="product-info-panel">
            <div>
              <span className="card-brand" style={{ fontSize: '12px' }}>MYRO</span>
              <h1 className="product-title">{product.name}</h1>
            </div>

            {/* Price Box */}
            <div className="product-price-box">
              <span className="detail-price">Tk {product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="detail-original-price">Tk {product.originalPrice.toLocaleString()}</span>
                  <span className="detail-save-badge">
                    Save Tk {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="options-group">
                <span className="option-label">Select Shoe Size:</span>
                <div className="options-list">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="options-group">
                <span className="option-label">Color:</span>
                <div className="options-list">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`option-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart button */}
            <div className="options-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
              <div className="quantity-control" style={{ height: '42px' }}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '38px', height: '40px' }}
                >
                  -
                </button>
                <span className="qty-val" style={{ width: '40px' }}>{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '38px', height: '40px' }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ flexGrow: 1, height: '42px', padding: '0 20px' }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? '🛒 Add to Cart' : 'Sold Out'}
              </button>
            </div>

            {/* Product Description */}
            <div className="product-description-text">
              <p>{product.description}</p>
            </div>

            {/* Cash on Delivery Form */}
            {product.inStock ? (
              <form className="order-form-card" onSubmit={handlePlaceOrder}>
                <div className="order-form-header">
                  <h3 className="order-form-title">⚡ Order Now (Cash on Delivery)</h3>
                  <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                    Fill the form and we will call you to confirm your purchase.
                  </p>
                </div>

                <div className="form-group">
                  <label className="option-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
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
                    placeholder="017xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="option-label">Delivery Address *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide full address (Home/Office number, road name, area)"
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
                    <option value="Dhaka">Inside Dhaka (Tk {shippingFeeDhaka})</option>
                    <option value="Outside Dhaka">Outside Dhaka (Tk {shippingFeeOutside})</option>
                  </select>
                </div>

                {/* COD Breakdowns */}
                <div className="order-summary-box">
                  <div className="order-summary-row">
                    <span>Product Subtotal ({quantity} item{quantity !== 1 ? 's' : ''}):</span>
                    <span>Tk {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Delivery Charge:</span>
                    <span>Tk {shippingFee}</span>
                  </div>
                  <div className="order-summary-row order-summary-total">
                    <span>Total Amount:</span>
                    <span>Tk {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '14px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing Order...' : 'Confirm Order (Tk ' + totalAmount.toLocaleString() + ')'}
                </button>
              </form>
            ) : (
              <div className="order-form-card" style={{ border: '1px solid var(--border)', background: 'var(--border-light)' }}>
                <p style={{ textAlign: 'center', fontWeight: '700', color: 'var(--foreground-muted)' }}>
                  This product is currently out of stock.
                </p>
              </div>
            )}

            {/* Support policies accordion */}
            <div className="accordion">
              <details className="accordion-item" open>
                <summary className="accordion-title">
                  Delivery & Shipping
                  <span>▼</span>
                </summary>
                <div className="accordion-content">
                  Delivery times: Inside Dhaka 1-2 days (Tk {shippingFeeDhaka}), Outside Dhaka 3-5 days (Tk {shippingFeeOutside}). Pay cash when you receive the product.
                </div>
              </details>

              <details className="accordion-item">
                <summary className="accordion-title">
                  Exchange & Return Policy
                  <span>▼</span>
                </summary>
                <div className="accordion-content">
                  We offer a 3-day exchange policy for size mismatches or defects. The shoe must be unworn, in original packaging, and with tags attached.
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailClient;

import React from 'react';
import Link from 'next/link';
import { readDB } from '../lib/db';
import { ProductCard } from '../components/ProductCard';

export const dynamic = 'force-dynamic';

export default function Home() {
  const db = readDB();
  const allProducts = db.products || [];

  // Filter products for featured collections
  const bestSellers = allProducts.filter(p => p.isBestSelling || p.collections.includes('best-selling')).slice(0, 4);
  const saleProducts = allProducts.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

  // Category circles configuration with matching image assets
  const categories = [
    { name: 'Heel', slug: 'heel', img: '/images/zeen-low-heel.jpg' },
    { name: 'Flat', slug: 'flat', img: '/images/isha-flat.jpg' },
    { name: 'Mules', slug: 'mules', img: '/images/ayzel-mules.jpg' },
    { name: 'Boston', slug: 'boston', img: '/images/luma-boston.jpg' },
    { name: 'Chappal', slug: 'chappal', img: '/images/chappal-classic.jpg' },
    { name: 'Slide', slug: 'slide', img: '/images/classic-slide.jpg' },
    { name: 'Karchupi', slug: 'karchupizardosi', img: '/images/zardosi-karchupi-slipper.jpg' },
    { name: 'Thongs', slug: 'thongs', img: '/images/casual-thongs.jpg' },
    { name: 'Strappy', slug: 'strappy', img: '/images/strappy-glint-sandal.jpg' },
    { name: 'Dr Shoe', slug: 'drshoe', img: '/images/dr-shoe-comfort.jpg' },
  ];

  return (
    <div>
      {/* Hero Slider Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-tag">NEW COLLECTION 2026</span>
            <h1 className="hero-title">Step Into Luxury & Comfort</h1>
            <p className="hero-desc">
              Discover MYRO's latest handcrafted collection of women's shoes. From stylish low heels to orthopedic-grade comfort flats, designed with premium materials for the modern woman.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <Link href="/collections/all-shoes" className="btn btn-primary">
                Shop All Shoes
              </Link>
              <Link href="/collections/sale" className="btn btn-secondary">
                View Clearance Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Circle Row Section */}
      <section className="category-circle-section">
        <div className="container">
          <h3 className="section-title" style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Browse Categories
          </h3>
          <div className="category-row">
            {categories.map((cat, idx) => (
              <Link href={`/collections/${cat.slug}`} key={idx} className="category-circle-card">
                <div className="circle-img-wrapper">
                  <img src={cat.img} alt={cat.name} className="circle-img" />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Best Selling Shoes</h2>
            <Link href="/collections/best-selling" className="section-link">
              View All Best Selling →
            </Link>
          </div>
          
          <div className="product-grid">
            {bestSellers.length > 0 ? (
              bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ gridColumn: 'span 4', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                No best selling products available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SALE Clearance Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Hot SALE Deals</h2>
            <Link href="/collections/sale" className="section-link">
              View All Sale Items →
            </Link>
          </div>
          
          <div className="product-grid">
            {saleProducts.length > 0 ? (
              saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ gridColumn: 'span 4', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                No discounted products available at the moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Policies Accordion & Trust Info */}
      <section className="section-padding" id="size-guide">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Shopping Guide & Store Policies</h2>
          
          <div className="accordion">
            <details className="accordion-item" open id="delivery-policy">
              <summary className="accordion-title">
                Shipping & Delivery Policy
                <span>▼</span>
              </summary>
              <div className="accordion-content">
                <p><strong>Delivery Timeframe:</strong></p>
                <p>• Inside Dhaka: Orders are delivered within 24 to 48 hours.</p>
                <p>• Outside Dhaka: Orders are delivered via courier service within 3 to 5 business days.</p>
                <br />
                <p><strong>Shipping Charges:</strong></p>
                <p>• Inside Dhaka: Tk 80 flat rate.</p>
                <p>• Outside Dhaka: Tk 150 flat rate.</p>
                <p>• Free shipping applies to all orders with cart values above Tk 2,500!</p>
              </div>
            </details>

            <details className="accordion-item" id="exchange-policy">
              <summary className="accordion-title">
                3-Days Exchange Guarantee
                <span>▼</span>
              </summary>
              <div className="accordion-content">
                <p>If you experience size mismatch issues or receive a defective item, we offer a hassle-free exchange within 3 days of delivery:</p>
                <p>1. The shoe must be unworn, unused, and in its original packaging box.</p>
                <p>2. Contact our helpline at +880 1700 000 000 or email us with your order number.</p>
                <p>3. We will send a reverse pickup or arrange for a replacement size to be shipped to your address. Please note that return delivery charges may apply unless the exchange is due to our error.</p>
              </div>
            </details>

            <details className="accordion-item">
              <summary className="accordion-title">
                How to Find Your Shoe Size (Guide)
                <span>▼</span>
              </summary>
              <div className="accordion-content">
                <p>Ensure you get the perfect fit by following our standard sizing reference chart:</p>
                <br />
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f5eae3', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>EU Size</th>
                      <th style={{ padding: '8px' }}>UK Size</th>
                      <th style={{ padding: '8px' }}>Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eaddd3' }}><td style={{ padding: '8px' }}>36</td><td style={{ padding: '8px' }}>3</td><td style={{ padding: '8px' }}>22.5 cm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eaddd3' }}><td style={{ padding: '8px' }}>37</td><td style={{ padding: '8px' }}>4</td><td style={{ padding: '8px' }}>23.0 cm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eaddd3' }}><td style={{ padding: '8px' }}>38</td><td style={{ padding: '8px' }}>5</td><td style={{ padding: '8px' }}>23.8 cm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eaddd3' }}><td style={{ padding: '8px' }}>39</td><td style={{ padding: '8px' }}>6</td><td style={{ padding: '8px' }}>24.6 cm</td></tr>
                    <tr style={{ borderBottom: '1px solid #eaddd3' }}><td style={{ padding: '8px' }}>40</td><td style={{ padding: '8px' }}>7</td><td style={{ padding: '8px' }}>25.1 cm</td></tr>
                    <tr><td style={{ padding: '8px' }}>41</td><td style={{ padding: '8px' }}>8</td><td style={{ padding: '8px' }}>25.9 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Trust Banners */}
      <section className="trust-banner">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">💵</div>
              <div>
                <h4 className="trust-title">Cash on Delivery</h4>
                <p className="trust-desc">Pay cash when you receive the product at your doorstep.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔄</div>
              <div>
                <h4 className="trust-title">3-Day Easy Exchange</h4>
                <p className="trust-desc">Size mismatch? Exchange easily within 3 business days.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📞</div>
              <div>
                <h4 className="trust-title">Dedicated Support</h4>
                <p className="trust-desc">Call us anytime at +880 1700 000 000 for order inquiries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

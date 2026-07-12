import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Logo & Description */}
          <div className="footer-col">
            <div className="footer-logo">
              MYRO<span>.</span>
            </div>
            <p className="footer-text">
              MYRO is Bangladesh's leading affordable ladies' shoes brand. Handcrafting stylish heels, comfortable sandals, clogs, and flats that blend high-fashion aesthetics with daily wear comfort.
            </p>
            <p className="footer-text" style={{ fontStyle: 'italic' }}>
              Standard Delivery: Dhaka (24-48 hrs), Outside Dhaka (3-5 days). Cash on delivery.
            </p>
          </div>

          {/* Quick Shop Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Shop Collections</h4>
            <ul className="footer-links">
              <li>
                <Link href="/collections/all-shoes" className="footer-link">
                  All Shoes
                </Link>
              </li>
              <li>
                <Link href="/collections/sale" className="footer-link">
                  SALE Clearance
                </Link>
              </li>
              <li>
                <Link href="/collections/best-selling" className="footer-link">
                  Best Selling
                </Link>
              </li>
              <li>
                <Link href="/collections/heel" className="footer-link">
                  Heels
                </Link>
              </li>
              <li>
                <Link href="/collections/boston" className="footer-link">
                  Boston Clogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Policy Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Information</h4>
            <ul className="footer-links">
              <li>
                <Link href="/#exchange-policy" className="footer-link">
                  Exchange & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/#delivery-policy" className="footer-link">
                  Shipping & Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/#size-guide" className="footer-link">
                  Shoe Size Guide
                </Link>
              </li>
              <li>
                <Link href="/shakil" className="footer-link">
                  Staff Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-col">
            <h4 className="footer-col-title">Customer Support</h4>
            <ul className="footer-links">
              <li className="footer-link">📞 Hotline: +880 1700 000 000</li>
              <li className="footer-link">✉️ Email: support@myrobd.com</li>
              <li className="footer-link">📍 Address: Banani Road 11, Dhaka, Bangladesh</li>
              <li className="footer-link" style={{ marginTop: '10px' }}>
                <span style={{ marginRight: '10px', fontSize: '18px', cursor: 'pointer' }}>👤</span>
                <span style={{ marginRight: '10px', fontSize: '18px', cursor: 'pointer' }}>📸</span>
                <span style={{ fontSize: '18px', cursor: 'pointer' }}>🐦</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Rights */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MYRO. All Rights Reserved. Master Copy Clone by Antigravity.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>🔒 Secure Checkout</span>
            <span>💵 Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

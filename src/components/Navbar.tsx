'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface NavbarItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export const Navbar: React.FC = () => {
  const { cartCount, setCartOpen, isMobileNavOpen, setMobileNavOpen } = useCart();
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setSearchVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const fetchNav = async () => {
    try {
      const res = await fetch('/api/navigation');
      if (res.ok) {
        const data = await res.json();
        // Sort items by order
        data.sort((a: NavbarItem, b: NavbarItem) => a.order - b.order);
        setNavItems(data);
      }
    } catch (err) {
      console.error('Error fetching navbar menu:', err);
    }
  };

  useEffect(() => {
    fetchNav();
  }, [pathname]); // Refresh menu on route change in case admin changed it

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections/all-shoes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchVisible(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          {/* Logo */}
          <Link href="/" className="logo">
            MYRO<span>.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            <ul className="nav-menu">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className={`nav-link ${pathname === item.url ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {/* Search Bar Toggle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {isSearchVisible && (
                <form onSubmit={handleSearchSubmit} style={{ position: 'absolute', right: '40px', top: '-5px', zIndex: 10 }}>
                  <input
                    type="text"
                    placeholder="Search shoes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      width: '180px',
                      backgroundColor: 'white',
                    }}
                    autoFocus
                  />
                </form>
              )}
              <button className="action-btn" onClick={() => setSearchVisible(!isSearchVisible)} title="Search">
                🔍
              </button>
            </div>

            {/* Admin Panel Link */}
            <Link href="/shakil" className="action-btn" title="Admin Portal">
              👤
            </Link>

            {/* Cart Icon & Count Badge */}
            <button className="action-btn" onClick={() => setCartOpen(true)} title="Shopping Cart">
              🛒
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>

            {/* Mobile Nav Hamburger */}
            <button
              className="mobile-toggle"
              style={{ display: 'none' }} /* controlled via responsive media queries in CSS or handled below */
              onClick={() => setMobileNavOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer Backdrop */}
      <div
        className={`cart-overlay ${isMobileNavOpen ? 'open-mobile-nav' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        style={{ zIndex: 999 }}
      >
        {/* Mobile Nav Drawer */}
        <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="logo">MYRO<span>.</span></span>
            <button className="close-btn" onClick={() => setMobileNavOpen(false)}>&times;</button>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className={`nav-link ${pathname === item.url ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                  style={{ fontSize: '15px', display: 'block' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .nav-menu {
            display: none;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

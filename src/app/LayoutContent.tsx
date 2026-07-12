'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../context/CartContext';
import { SiteSettings } from '../lib/db';

export const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useCart();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        {settings?.announcement || 'CASH ON DELIVERY AVAILABLE | 3-DAY EXCHANGE GUARANTEE | FREE SHIPPING OVER 2500 BDT'}
      </div>
      
      {/* Header / Navigation */}
      <Navbar />
      
      {/* Main Page Content */}
      <main style={{ minHeight: 'calc(100vh - var(--header-height) - 150px)' }}>
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};
export default LayoutContent;

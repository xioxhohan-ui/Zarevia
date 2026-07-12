import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, RefreshCcw, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white border-t border-neutral-800">
      
      {/* Policy highlights row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-primary">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-lg font-heading">Reliable Delivery</h4>
              <p className="text-sm text-neutral-400">Within 24-48h in Dhaka. 3-5 days nationwide.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-primary">
              <RefreshCcw size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-lg font-heading">3-Days Exchange Guarantee</h4>
              <p className="text-sm text-neutral-400">Hassle-free sizing exchanges at your doorstep.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-lg font-heading">Secure Payments</h4>
              <p className="text-sm text-neutral-400">Cash on delivery or fully encrypted checkout.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-extrabold tracking-wider text-white">JARAVIEA.</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Step into luxury and style with our hand-crafted, premium footwear designed for comfort and elegance. Uniquely crafted to stand the test of time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Shop Collections</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/collections/all-shoes" className="hover:text-primary transition-colors">All Shoes</Link></li>
              <li><Link to="/collections/heel" className="hover:text-primary transition-colors">Heels</Link></li>
              <li><Link to="/collections/flat" className="hover:text-primary transition-colors">Flats</Link></li>
              <li><Link to="/collections/mules" className="hover:text-primary transition-colors">Mules</Link></li>
            </ul>
          </div>

          {/* Policy Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Customer Service</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/pages/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/pages/delivery-policy" className="hover:text-primary transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/pages/exchange-policy" className="hover:text-primary transition-colors">Return & Exchange</Link></li>
              <li><Link to="/pages/faq" className="hover:text-primary transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@jaraviea.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>Banani, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright notice */}
        <div className="border-t border-neutral-800 mt-12 pt-6 text-center text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} JARAVIEA Footwear. All Rights Reserved. Crafted with passion.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

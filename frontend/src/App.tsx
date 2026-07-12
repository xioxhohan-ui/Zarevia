import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components & Pages
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home';
import { Collections } from './pages/Collections';
import { ProductDetail } from './pages/ProductDetail';
import { Wishlist } from './pages/Wishlist';
import { OrderSuccess } from './pages/OrderSuccess';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient();

// Route Protection: Requires authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route Protection: Requires Admin/Manager privileges
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const isAdmin = user && ['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-background">
          {/* Main layout shell */}
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Storefront Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/collections/:slug" element={<Collections />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              
              {/* Customer Dashboard Route */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Panel Route */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
          <CartDrawer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

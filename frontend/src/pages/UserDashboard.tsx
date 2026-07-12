import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { ShoppingBag, MapPin, LogOut, ChevronRight } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        setProfile(profileRes.data);

        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Error fetching dashboard details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      
      {/* Profile Header banner */}
      <div className="bg-[#f3eae3] rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:justify-between gap-6 border border-neutral-100">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-16 h-16 bg-white text-primary rounded-full flex items-center justify-center font-heading text-2xl font-bold border-2 border-neutral-200">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-charcoal">{profile?.name}</h1>
            <p className="text-xs text-neutral-400">{profile?.email}</p>
            <p className="text-[10px] text-primary uppercase font-bold tracking-wider mt-1">{profile?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-neutral-200 hover:border-red-500 hover:bg-red-50 text-charcoal hover:text-red-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
              activeTab === 'orders'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal hover:bg-neutral-50 border border-neutral-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} /> My Orders
            </span>
            <ChevronRight size={16} />
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
              activeTab === 'addresses'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal hover:bg-neutral-50 border border-neutral-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Saved Addresses
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Dynamic content cards */}
        <div className="md:col-span-3">
          {activeTab === 'orders' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-charcoal mb-4">Order History</h3>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100 text-neutral-400">
                  <ShoppingBag size={32} className="mx-auto mb-2" />
                  <p className="text-sm">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-neutral-50 pb-3 gap-2">
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-semibold">Order Number</p>
                          <p className="text-sm font-bold text-charcoal">{ord.orderNumber}</p>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Date</p>
                            <p className="font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Total Cost</p>
                            <p className="font-bold text-primary">BDT {Number(ord.totalAmount).toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Status</p>
                            <span className={`inline-block font-semibold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                              ord.status === 'DELIVERED' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : ord.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-neutral-50">
                        {ord.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-2 text-xs">
                            <span className="text-neutral-500">
                              {item.variant.product.name} (Size: {item.variant.size}) <span className="font-semibold text-charcoal">x{item.quantity}</span>
                            </span>
                            <span className="font-bold text-charcoal">BDT {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-charcoal mb-4">Saved Shipping Locations</h3>
              {profile?.addresses?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100 text-neutral-400">
                  <MapPin size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No saved addresses found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile?.addresses?.map((addr: any) => (
                    <div 
                      key={addr.id}
                      className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm relative space-y-2 text-xs text-neutral-600"
                    >
                      <p className="font-bold text-charcoal text-sm">{addr.fullName}</p>
                      <p>{addr.streetAddress}</p>
                      <p>{addr.city}, Bangladesh</p>
                      <p className="font-semibold text-primary">{addr.phone}</p>
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[9px] bg-primary-light text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default UserDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { 
  BarChart3, 
  ShoppingBag, 
  ListFilter, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  TrendingUp,
  Inbox,
  AlertCircle,
  Image
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'promotions' | 'settings' | 'media'>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Promotions/Hero states
  const [banners, setBanners] = useState<any[]>([]);
  const [promoCards, setPromoCards] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isBannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerForm, setBannerForm] = useState({
    heading: '',
    subtitle: '',
    description: '',
    buttonText: 'Shop Now',
    buttonUrl: '/',
    desktopImageUrl: '',
    tabletImageUrl: '',
    mobileImageUrl: '',
    discountBadge: '',
    overlayColor: 'rgba(0,0,0,0.3)',
    duration: 5,
    sortOrder: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [isCardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    discountText: '',
    badgeText: '',
    buttonText: 'Explore',
    buttonUrl: '/',
    imageUrl: '',
    isActive: true,
    showOnDesktop: true,
    showOnLaptop: true,
    showOnTablet: true,
    showOnMobile: false,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  });

  // Banner Operations
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/admin/hero/banners/${editingBanner.id}`, bannerForm);
        alert('Banner updated successfully!');
      } else {
        await api.post('/admin/hero/banners', bannerForm);
        alert('Banner created successfully!');
      }
      setBannerModalOpen(false);
      setEditingBanner(null);
      fetchAdminData();
    } catch (err) {
      alert('Failed to save banner.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/admin/hero/banners/${id}`);
      alert('Banner deleted successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete banner.');
    }
  };

  const handleToggleBannerActive = async (banner: any) => {
    try {
      await api.put(`/admin/hero/banners/${banner.id}`, {
        ...banner,
        isActive: !banner.isActive
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to toggle banner status.');
    }
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    const tempSort = newBanners[index].sortOrder;
    newBanners[index].sortOrder = newBanners[targetIndex].sortOrder;
    newBanners[targetIndex].sortOrder = tempSort;

    try {
      await Promise.all([
        api.put(`/admin/hero/banners/${newBanners[index].id}`, {
          ...newBanners[index],
          startDate: newBanners[index].startDate ? newBanners[index].startDate.substring(0, 10) : null,
          endDate: newBanners[index].endDate ? newBanners[index].endDate.substring(0, 10) : null,
        }),
        api.put(`/admin/hero/banners/${newBanners[targetIndex].id}`, {
          ...newBanners[targetIndex],
          startDate: newBanners[targetIndex].startDate ? newBanners[targetIndex].startDate.substring(0, 10) : null,
          endDate: newBanners[targetIndex].endDate ? newBanners[targetIndex].endDate.substring(0, 10) : null,
        })
      ]);
      fetchAdminData();
    } catch (err) {
      alert('Failed to reorder banners.');
    }
  };

  // Card Operations
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await api.put(`/admin/hero/cards/${editingCard.id}`, cardForm);
        alert('Promo card updated successfully!');
      } else {
        await api.post('/admin/hero/cards', cardForm);
        alert('Promo card created successfully!');
      }
      setCardModalOpen(false);
      setEditingCard(null);
      fetchAdminData();
    } catch (err) {
      alert('Failed to save promo card.');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await api.delete(`/admin/hero/cards/${id}`);
      alert('Promo card deleted successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete promo card.');
    }
  };

  const handleToggleCardActive = async (card: any) => {
    try {
      await api.put(`/admin/hero/cards/${card.id}`, {
        ...card,
        isActive: !card.isActive
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to toggle promo card status.');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'desktop' | 'tablet' | 'mobile') => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (mode === 'desktop') {
        setBannerForm(prev => ({ ...prev, desktopImageUrl: res.data.url }));
      } else if (mode === 'tablet') {
        setBannerForm(prev => ({ ...prev, tabletImageUrl: res.data.url }));
      } else if (mode === 'mobile') {
        setBannerForm(prev => ({ ...prev, mobileImageUrl: res.data.url }));
      }
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCardForm(prev => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file? This will remove it from Firebase.')) return;
    try {
      await api.delete(`/upload/${id}`);
      alert('Media deleted successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete media file.');
    }
  };

  // Analytics states
  const [stats, setStats] = useState<any>({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, monthlySales: [] });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  // Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<{ [id: string]: string }>({});

  // Products states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Site Config settings state
  const [siteSettings, setSiteSettings] = useState<{ [key: string]: string }>({
    shopName: 'JARAVIEA',
    announcement: 'Free Shipping over BDT 2,500',
    shippingDhaka: '80',
    shippingOutside: '150',
    sliderAutoplay: 'true',
    sliderAutoplayDelay: '5000',
    sliderTransitionSpeed: '700',
    sliderInfiniteLoop: 'true',
    sliderPauseOnHover: 'true',
    sliderShowArrows: 'true',
    sliderShowDots: 'true',
    sliderEnableSwipe: 'true',
  });

  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodStatus, setProdStatus] = useState('PUBLISHED');
  const [prodIsBest, setProdIsBest] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  
  // Custom single Variant builder states
  const [varSize, setVarSize] = useState('38');
  const [varColor, setVarColor] = useState('Beige');
  const [varStock, setVarStock] = useState('10');
  const [productVariants, setProductVariants] = useState<any[]>([]);

  // Image Upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // RBAC Security Check
    if (!user || !['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      navigate('/');
      return;
    }
    
    fetchAdminData();
  }, [user, activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'analytics') {
        const statsRes = await api.get('/admin/reports/sales');
        setStats(statsRes.data);

        const topRes = await api.get('/admin/reports/top-products');
        setTopProducts(topRes.data);

        const lowRes = await api.get('/admin/inventory/low-stock');
        setLowStock(lowRes.data);
      } else if (activeTab === 'orders') {
        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data);
        
        // Setup initial status map
        const initialStatus: { [id: string]: string } = {};
        ordersRes.data.forEach((o: any) => {
          initialStatus[o.id] = o.status;
        });
        setSelectedOrderStatus(initialStatus);
      } else if (activeTab === 'products') {
        const prodRes = await api.get('/products?status=all');
        setProducts(prodRes.data);

        const catRes = await api.get('/categories');
        setCategories(catRes.data);
      } else if (activeTab === 'promotions') {
        const bannersRes = await api.get('/admin/hero/banners');
        setBanners(bannersRes.data);
        const cardsRes = await api.get('/admin/hero/cards');
        setPromoCards(cardsRes.data);
      } else if (activeTab === 'settings') {
        const setRes = await api.get('/admin/settings');
        if (Object.keys(setRes.data).length > 0) {
          setSiteSettings(setRes.data);
        }
      } else if (activeTab === 'media') {
        const mediaRes = await api.get('/admin/media');
        setMediaList(mediaRes.data);
      }
    } catch (err) {
      console.error('Error loading admin panel resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status on server
  const handleUpdateOrderStatus = async (orderId: string) => {
    try {
      const status = selectedOrderStatus[orderId];
      await api.put(`/orders/${orderId}/status`, { status });
      alert('Order status updated successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Append uploaded image URL to local product form list
      setProdImages([...prodImages, res.data.url]);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Form: Add Variant to dynamic list
  const handleAddVariant = () => {
    if (!varSize || !varColor || !varStock) return;
    const vSku = `${prodSku || 'SKU'}-${varSize}-${varColor.substring(0, 3).toUpperCase()}`;
    const newV = {
      size: varSize,
      color: varColor,
      stock: Number(varStock),
      sku: vSku
    };
    // Ensure no duplicates
    if (productVariants.some((v) => v.size === varSize && v.color === varColor)) {
      alert('Variant already exists in local builder list.');
      return;
    }
    setProductVariants([...productVariants, newV]);
  };

  // Form: Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodCategoryId || productVariants.length === 0) {
      alert('Fill required fields and add at least 1 size/color variant.');
      return;
    }

    const payload = {
      name: prodName,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : null,
      sku: prodSku || 'SKU-' + Date.now(),
      description: prodDescription,
      categoryId: prodCategoryId,
      status: prodStatus,
      isBestSeller: prodIsBest,
      isFeatured: prodIsFeatured,
      isTrending: prodIsTrending,
      images: prodImages,
      variants: productVariants,
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        alert('Product created successfully!');
      }
      setProductModalOpen(false);
      resetProductForm();
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving product details.');
    }
  };

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(String(prod.price));
    setProdDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setProdSku(prod.sku);
    setProdDescription(prod.description);
    setProdCategoryId(prod.categoryId);
    setProdStatus(prod.status);
    setProdIsBest(prod.isBestSeller);
    setProdIsFeatured(prod.isFeatured);
    setProdIsTrending(prod.isTrending);
    setProdImages(prod.images.map((im: any) => im.url));
    setProductVariants(prod.variants);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdSku('');
    setProdDescription('');
    setProdCategoryId('');
    setProdStatus('PUBLISHED');
    setProdIsBest(false);
    setProdIsFeatured(false);
    setProdIsTrending(false);
    setProdImages([]);
    setProductVariants([]);
  };

  // Site Config Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', siteSettings);
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-charcoal text-white rounded-3xl p-6 sm:p-10 border border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-wide">Admin Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">Configure catalogs, manage order statuses, and inspect metrics.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary font-bold uppercase tracking-wider">{user?.role}</p>
          <p className="text-sm font-semibold text-neutral-300">{user?.name}</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-neutral-200 gap-6 overflow-x-auto pb-1 text-sm font-semibold">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <BarChart3 size={16} /> Reports & Metrics
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <ShoppingBag size={16} /> Orders Tracker
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <ListFilter size={16} /> Products Catalog
        </button>
        <button 
          onClick={() => setActiveTab('promotions')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'promotions' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <TrendingUp size={16} /> Hero & Promotions
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <Settings size={16} /> Site Config
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'
          }`}
        >
          <Image size={16} /> Media Library
        </button>
      </div>

      {/* Main panel displays */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ===================================== */}
          {/* TAB 1: ANALYTICS & REPORTS            */}
          {/* ===================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Highlight cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Sales Revenue</div>
                  <div className="text-2xl font-extrabold text-charcoal">BDT {stats.totalRevenue?.toFixed(1)}</div>
                  <div className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5"><TrendingUp size={12}/> +12% from last month</div>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Processed Orders</div>
                  <div className="text-2xl font-extrabold text-charcoal">{stats.totalOrders} Completed</div>
                  <div className="text-xs text-neutral-400">Excludes cancelled/refunded invoices</div>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-2">
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Average Cart Basket</div>
                  <div className="text-2xl font-extrabold text-charcoal">BDT {stats.averageOrderValue?.toFixed(1)}</div>
                  <div className="text-xs text-neutral-400">Order size conversion metrics</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Selling Table */}
                <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal border-b border-neutral-100 pb-2">Top Selling Footwear</h3>
                  {topProducts.length === 0 ? (
                    <p className="text-center text-xs text-neutral-400 py-10">No items registered sales yet.</p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {topProducts.map((p, idx) => (
                        <div key={idx} className="flex justify-between py-2.5 text-xs">
                          <span className="font-bold text-neutral-600">{idx+1}. {p.name}</span>
                          <span className="text-neutral-400">{p.quantity} Units | BDT {p.revenue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Low Stock Tracker */}
                <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-red-500" /> Low Stock Warning
                  </h3>
                  {lowStock.length === 0 ? (
                    <p className="text-center text-xs text-neutral-400 py-10">All sizes and variant colors are well stocked.</p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {lowStock.map((l, idx) => (
                        <div key={idx} className="flex justify-between py-2.5 text-xs">
                          <span className="font-bold text-red-500">{l.product.name} (Size: {l.size} | Color: {l.color})</span>
                          <span className="font-extrabold text-charcoal">{l.stock} left</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 2: ORDERS TRACKER                 */}
          {/* ===================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-100 font-heading font-bold text-sm uppercase tracking-wider text-charcoal">
                Incoming Orders
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-20 text-neutral-400">
                  <Inbox size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No checkout orders registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-100">
                        <th className="p-4">Order Code</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Total Billing</th>
                        <th className="p-4">Order Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-bold text-charcoal">{ord.orderNumber}</td>
                          <td className="p-4 space-y-1">
                            <p className="font-bold text-neutral-700">{ord.shippingAddress?.fullName || 'Guest User'}</p>
                            <p>{ord.shippingAddress?.streetAddress}</p>
                            <p className="text-primary font-semibold">{ord.shippingAddress?.phone}</p>
                          </td>
                          <td className="p-4 space-y-1">
                            {ord.items?.map((item: any, idx: number) => (
                              <p key={idx} className="text-[11px] text-neutral-500">
                                • {item.variant.product.name} (Size {item.variant.size}) x{item.quantity}
                              </p>
                            ))}
                          </td>
                          <td className="p-4 font-extrabold text-charcoal">BDT {ord.totalAmount}</td>
                          <td className="p-4">
                            <select
                              value={selectedOrderStatus[ord.id] || ord.status}
                              onChange={(e) => setSelectedOrderStatus({ ...selectedOrderStatus, [ord.id]: e.target.value })}
                              className="border border-neutral-200 rounded-lg p-1 text-xs outline-none bg-white font-semibold"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="PACKED">PACKED</option>
                              <option value="SHIPPING">SHIPPING</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="RETURNED">RETURNED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id)}
                              className="px-2.5 py-1.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                            >
                              Save Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 3: PRODUCTS INVENTORY             */}
          {/* ===================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal">Manage Products</h3>
                <button
                  onClick={() => { resetProductForm(); setProductModalOpen(true); }}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {/* Products Table list */}
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-100">
                      <th className="p-4">Product Info</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Variants Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                            <img src={prod.images?.[0]?.url || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-800">{prod.name}</p>
                            <p className="text-[10px] text-neutral-400">SKU: {prod.sku}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-neutral-600">{prod.category?.name}</td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-bold text-charcoal">BDT {prod.price}</p>
                          {prod.discountPrice && (
                            <p className="text-[10px] text-red-500 font-semibold">Sale: BDT {prod.discountPrice}</p>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-neutral-500">
                          {prod.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0} Units total
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                            prod.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'
                          }`}>
                            {prod.status}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="p-1.5 border border-neutral-200 hover:border-primary text-neutral-500 hover:text-primary rounded-lg transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 border border-neutral-200 hover:border-red-500 text-neutral-500 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 4: SITE SETTINGS & CONFIGS        */}
          {/* ===================================== */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 space-y-5 max-w-xl">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal border-b border-neutral-100 pb-2">Website Settings</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Website Shop Name</label>
                <input
                  type="text"
                  value={siteSettings.shopName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, shopName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Announcement Bar Promotion Text</label>
                <input
                  type="text"
                  value={siteSettings.announcement}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Shipping Fee Inside Dhaka</label>
                  <input
                    type="number"
                    value={siteSettings.shippingDhaka}
                    onChange={(e) => setSiteSettings({ ...siteSettings, shippingDhaka: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Shipping Fee Outside Dhaka</label>
                  <input
                    type="number"
                    value={siteSettings.shippingOutside}
                    onChange={(e) => setSiteSettings({ ...siteSettings, shippingOutside: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-charcoal border-b border-neutral-100 pt-4 pb-2">Hero Slider Configurations</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Auto-play Delay (ms)</label>
                  <input
                    type="number"
                    value={siteSettings.sliderAutoplayDelay || '5000'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, sliderAutoplayDelay: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Transition Speed (ms)</label>
                  <input
                    type="number"
                    value={siteSettings.sliderTransitionSpeed || '700'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, sliderTransitionSpeed: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderAutoplay !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderAutoplay: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Enable Auto-play</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderInfiniteLoop !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderInfiniteLoop: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Infinite Loop Slider</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderPauseOnHover !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderPauseOnHover: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Pause Auto-play on Hover</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderShowArrows !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderShowArrows: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Show Navigation Arrows</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderShowDots !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderShowDots: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Show Pagination Dots</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={siteSettings.sliderEnableSwipe !== 'false'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, sliderEnableSwipe: String(e.target.checked) })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-semibold text-neutral-600">Enable Mobile Swipe Gestures</span>
                  </label>
                </div>
              </div>

<button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Save Site Settings
              </button>
            </form>
          )}

          {/* Promotions and Hero Banners Tab Panel */}
          {activeTab === 'promotions' && (
            <div className="space-y-10">
              
              {/* Banners Manager Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-extrabold text-charcoal">Hero Slider Banners</h2>
                    <p className="text-xs text-neutral-400">Add, edit, or toggle auto-play slider banners.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerForm({
                        heading: '',
                        subtitle: '',
                        description: '',
                        buttonText: 'Shop Now',
                        buttonUrl: '/',
                        desktopImageUrl: '',
                        tabletImageUrl: '',
                        mobileImageUrl: '',
                        discountBadge: '',
                        overlayColor: 'rgba(0,0,0,0.3)',
                        duration: 5,
                        sortOrder: 0,
                        isActive: true,
                        startDate: '',
                        endDate: '',
                      });
                      setBannerModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    + Add Banner
                  </button>
                </div>

                <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-100">
                        <th className="p-4 w-12">Sort</th>
                        <th className="p-4">Banner Heading</th>
                        <th className="p-4">Subtitle</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-charcoal">
                      {banners.map((banner, index) => (
                        <tr key={banner.id} className="hover:bg-neutral-50/50">
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleMoveBanner(index, 'up')}
                                disabled={index === 0}
                                className="p-0.5 hover:bg-neutral-100 rounded text-neutral-500 disabled:opacity-30"
                                type="button"
                              >
                                ▲
                              </button>
                              <button 
                                onClick={() => handleMoveBanner(index, 'down')}
                                disabled={index === banners.length - 1}
                                className="p-0.5 hover:bg-neutral-100 rounded text-neutral-500 disabled:opacity-30"
                                type="button"
                              >
                                ▼
                              </button>
                              <span className="font-bold ml-1">{banner.sortOrder}</span>
                            </div>
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            <img src={banner.desktopImageUrl} alt="" className="w-12 h-8 rounded object-cover border border-neutral-100" />
                            <div className="font-semibold">{banner.heading}</div>
                          </td>
                          <td className="p-4 text-neutral-500">{banner.subtitle || '-'}</td>
                          <td className="p-4 font-medium">{banner.duration}s</td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleToggleBannerActive(banner)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                banner.isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                              }`}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => {
                                setEditingBanner(banner);
                                setBannerForm({
                                  heading: banner.heading,
                                  subtitle: banner.subtitle || '',
                                  description: banner.description || '',
                                  buttonText: banner.buttonText,
                                  buttonUrl: banner.buttonUrl,
                                  desktopImageUrl: banner.desktopImageUrl,
                                  tabletImageUrl: banner.tabletImageUrl || '',
                                  mobileImageUrl: banner.mobileImageUrl || '',
                                  discountBadge: banner.discountBadge || '',
                                  overlayColor: banner.overlayColor || 'rgba(0,0,0,0.3)',
                                  duration: banner.duration,
                                  sortOrder: banner.sortOrder,
                                  isActive: banner.isActive,
                                  startDate: banner.startDate ? banner.startDate.substring(0, 10) : '',
                                  endDate: banner.endDate ? banner.endDate.substring(0, 10) : '',
                                });
                                setBannerModalOpen(true);
                              }}
                              className="text-neutral-500 hover:text-primary font-semibold"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="text-red-400 hover:text-red-500 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {banners.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-neutral-400">
                            No hero banners found. Click "+ Add Banner" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Promo Cards Manager Section */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-extrabold text-charcoal">Promotional Offer Cards</h2>
                    <p className="text-xs text-neutral-400">Manage stacked deals displaying next to the hero slider.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingCard(null);
                      setCardForm({
                        title: '',
                        description: '',
                        discountText: '',
                        badgeText: '',
                        buttonText: 'Explore',
                        buttonUrl: '/',
                        imageUrl: '',
                        isActive: true,
                        showOnDesktop: true,
                        showOnLaptop: true,
                        showOnTablet: true,
                        showOnMobile: false,
                        sortOrder: 0,
                        startDate: '',
                        endDate: '',
                      });
                      setCardModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    + Add Card
                  </button>
                </div>

                <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-100">
                        <th className="p-4 w-12">Sort</th>
                        <th className="p-4">Promo Title</th>
                        <th className="p-4">Badge</th>
                        <th className="p-4">Discount Text</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-charcoal">
                      {promoCards.map((card) => (
                        <tr key={card.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-bold">{card.sortOrder}</td>
                          <td className="p-4 flex items-center gap-3">
                            <img src={card.imageUrl} alt="" className="w-12 h-8 rounded object-cover border border-neutral-100" />
                            <div className="font-semibold">{card.title}</div>
                          </td>
                          <td className="p-4 text-neutral-500">{card.badgeText || '-'}</td>
                          <td className="p-4 font-semibold text-primary">{card.discountText || '-'}</td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleToggleCardActive(card)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                card.isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                              }`}
                            >
                              {card.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => {
                                setEditingCard(card);
                                setCardForm({
                                  title: card.title,
                                  description: card.description || '',
                                  discountText: card.discountText || '',
                                  badgeText: card.badgeText || '',
                                  buttonText: card.buttonText,
                                  buttonUrl: card.buttonUrl,
                                  imageUrl: card.imageUrl,
                                  isActive: card.isActive,
                                  showOnDesktop: card.showOnDesktop,
                                  showOnLaptop: card.showOnLaptop,
                                  showOnTablet: card.showOnTablet,
                                  showOnMobile: card.showOnMobile,
                                  sortOrder: card.sortOrder,
                                  startDate: card.startDate ? card.startDate.substring(0, 10) : '',
                                  endDate: card.endDate ? card.endDate.substring(0, 10) : '',
                                });
                                setCardModalOpen(true);
                              }}
                              className="text-neutral-500 hover:text-primary font-semibold"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-red-400 hover:text-red-500 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {promoCards.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-neutral-400">
                            No promo cards found. Click "+ Add Card" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* PRODUCTS ADD/EDIT MODAL OVERLAY                  */}
      {/* ================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-charcoal">
                {editingProduct ? 'Edit Footwear details' : 'Add New Footwear Design'}
              </h3>
              <button 
                onClick={() => { setProductModalOpen(false); resetProductForm(); }} 
                className="p-1 text-neutral-400 hover:text-primary transition-colors text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Footwear Name *</label>
                  <input 
                    type="text" required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Zeen Low Block Heel"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Product SKU *</label>
                  <input 
                    type="text" required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="e.g. SHOE-ZEEN-01"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Category *</label>
                  <select 
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Base Price (BDT) *</label>
                  <input 
                    type="number" required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="1980"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Sale Price (BDT)</label>
                  <input 
                    type="number"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    placeholder="1580"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Footwear Description</label>
                <textarea 
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe footwear material, heel height, features..."
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Tag Toggles */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold bg-neutral-50 p-3 rounded-xl">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={prodIsBest} onChange={(e) => setProdIsBest(e.target.checked)} className="accent-primary" />
                  Best Seller
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} className="accent-primary" />
                  Featured
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={prodIsTrending} onChange={(e) => setProdIsTrending(e.target.checked)} className="accent-primary" />
                  Trending
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <label className="uppercase text-neutral-400 font-bold text-[10px]">Status</label>
                  <select 
                    value={prodStatus} 
                    onChange={(e) => setProdStatus(e.target.value)}
                    className="border border-neutral-200 rounded p-1 text-[11px] outline-none bg-white"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="HIDDEN">HIDDEN</option>
                  </select>
                </div>
              </div>

              {/* Dynamic size variant builder list */}
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white space-y-4">
                <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                  Sizing & Color Stock Builder (Variants) *
                </div>
                
                <div className="grid grid-cols-4 gap-2 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Size</label>
                    <select value={varSize} onChange={(e) => setVarSize(e.target.value)} className="w-full p-2 border rounded-lg text-xs outline-none bg-white">
                      <option value="36">36</option>
                      <option value="37">37</option>
                      <option value="38">38</option>
                      <option value="39">39</option>
                      <option value="40">40</option>
                      <option value="41">41</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Color</label>
                    <input type="text" value={varColor} onChange={(e) => setVarColor(e.target.value)} placeholder="Beige" className="w-full p-2 border rounded-lg text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Stock</label>
                    <input type="number" value={varStock} onChange={(e) => setVarStock(e.target.value)} className="w-full p-2 border rounded-lg text-xs outline-none" />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddVariant}
                    className="p-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg"
                  >
                    Add Variant
                  </button>
                </div>

                {/* Display added variants */}
                {productVariants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {productVariants.map((v, idx) => (
                      <span key={idx} className="bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-full text-[11px] font-bold text-charcoal flex items-center gap-1.5">
                        {v.size} / {v.color} ({v.stock} units)
                        <button type="button" onClick={() => setProductVariants(productVariants.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold hover:text-red-700">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Images Manager */}
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white space-y-4">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400 tracking-wider">
                  <span>Product Photo Gallery</span>
                  <span className="text-[10px] text-neutral-300">Local upload API enabled</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold hover:border-primary text-charcoal hover:text-primary flex items-center gap-1.5 cursor-pointer transition-colors bg-neutral-50/50">
                    <Upload size={14} /> Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {isUploading && <span className="text-xs text-neutral-400 animate-pulse">Uploading asset...</span>}
                  {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
                </div>

                {/* Display uploaded images urls list */}
                {prodImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {prodImages.map((url, idx) => (
                      <div key={idx} className="aspect-square bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden relative group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-red-500/80 text-white text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => { setProductModalOpen(false); resetProductForm(); }}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-charcoal text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#f23086] hover:bg-[#d21d6f] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* HERO BANNER ADD/EDIT MODAL                        */}
      {/* ================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-charcoal">
                {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
              </h3>
              <button 
                onClick={() => { setBannerModalOpen(false); setEditingBanner(null); }}
                className="text-neutral-400 hover:text-primary p-1.5 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Banner Subtitle / Category</label>
                  <input 
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. Summer Collection"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Banner Luxury Heading</label>
                  <input 
                    type="text"
                    value={bannerForm.heading}
                    onChange={(e) => setBannerForm({ ...bannerForm, heading: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. Up to 40% OFF"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400 uppercase">Description / Caption</label>
                <textarea 
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary h-20 resize-none"
                  placeholder="Slide promotional description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Button Display Text</label>
                  <input 
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Button Redirect Link URL</label>
                  <input 
                    type="text"
                    value={bannerForm.buttonUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Desktop Image Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Upload Desktop Image (1200x550)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, 'desktop')}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                  />
                  {bannerForm.desktopImageUrl && <p className="text-[10px] text-emerald-500 font-semibold mt-1">✓ Linked: {bannerForm.desktopImageUrl.substring(0, 40)}...</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Or Desktop Image URL</label>
                  <input 
                    type="text"
                    value={bannerForm.desktopImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, desktopImageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              {/* Tablet Image Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Upload Tablet Image (800x450)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, 'tablet')}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                  />
                  {bannerForm.tabletImageUrl && <p className="text-[10px] text-emerald-500 font-semibold mt-1">✓ Linked: {bannerForm.tabletImageUrl.substring(0, 40)}...</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Or Tablet Image URL</label>
                  <input 
                    type="text"
                    value={bannerForm.tabletImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, tabletImageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Mobile Image Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Upload Mobile Image (600x380)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, 'mobile')}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                  />
                  {bannerForm.mobileImageUrl && <p className="text-[10px] text-emerald-500 font-semibold mt-1">✓ Linked: {bannerForm.mobileImageUrl.substring(0, 40)}...</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Or Mobile Image URL</label>
                  <input 
                    type="text"
                    value={bannerForm.mobileImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Sort Order</label>
                  <input 
                    type="number"
                    value={bannerForm.sortOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Duration (Seconds)</label>
                  <input 
                    type="number"
                    value={bannerForm.duration}
                    onChange={(e) => setBannerForm({ ...bannerForm, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Discount Badge Text</label>
                  <input 
                    type="text"
                    value={bannerForm.discountBadge}
                    onChange={(e) => setBannerForm({ ...bannerForm, discountBadge: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. 20% OFF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Schedule Start Date</label>
                  <input 
                    type="date"
                    value={bannerForm.startDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Schedule End Date</label>
                  <input 
                    type="date"
                    value={bannerForm.endDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => { setBannerModalOpen(false); setEditingBanner(null); }}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-charcoal font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* PROMO CARD ADD/EDIT MODAL                        */}
      {/* ================================================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-charcoal">
                {editingCard ? 'Edit Promo Card' : 'Add New Promo Card'}
              </h3>
              <button 
                onClick={() => { setCardModalOpen(false); setEditingCard(null); }}
                className="text-neutral-400 hover:text-primary p-1.5 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Promo Card Title</label>
                  <input 
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. Summer Flats Special"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Badge Label / Header</label>
                  <input 
                    type="text"
                    value={cardForm.badgeText}
                    onChange={(e) => setCardForm({ ...cardForm, badgeText: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. 🔥 Flash Sale"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400 uppercase">Short Description</label>
                <input 
                  type="text"
                  value={cardForm.description || ''}
                  onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                  placeholder="Short description snippet..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Discount Highlight Text</label>
                  <input 
                    type="text"
                    value={cardForm.discountText || ''}
                    onChange={(e) => setCardForm({ ...cardForm, discountText: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="e.g. Save 50%"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Sort Order</label>
                  <input 
                    type="number"
                    value={cardForm.sortOrder}
                    onChange={(e) => setCardForm({ ...cardForm, sortOrder: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Button CTA Text</label>
                  <input 
                    type="text"
                    value={cardForm.buttonText}
                    onChange={(e) => setCardForm({ ...cardForm, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Button Destination URL</label>
                  <input 
                    type="text"
                    value={cardForm.buttonUrl}
                    onChange={(e) => setCardForm({ ...cardForm, buttonUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Upload Promo Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleCardUpload}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Or Image URL</label>
                  <input 
                    type="text"
                    value={cardForm.imageUrl}
                    onChange={(e) => setCardForm({ ...cardForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Schedule Start Date</label>
                  <input 
                    type="date"
                    value={cardForm.startDate}
                    onChange={(e) => setCardForm({ ...cardForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400 uppercase">Schedule End Date</label>
                  <input 
                    type="date"
                    value={cardForm.endDate}
                    onChange={(e) => setCardForm({ ...cardForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Visibility Controls */}
              <div className="space-y-2 border-t border-neutral-100 pt-3">
                <label className="font-semibold text-neutral-400 uppercase block">Device Visibility Rules</label>
                <div className="grid grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={cardForm.showOnDesktop}
                      onChange={(e) => setCardForm({ ...cardForm, showOnDesktop: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-medium text-neutral-600">Desktop</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={cardForm.showOnLaptop}
                      onChange={(e) => setCardForm({ ...cardForm, showOnLaptop: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-medium text-neutral-600">Laptop</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={cardForm.showOnTablet}
                      onChange={(e) => setCardForm({ ...cardForm, showOnTablet: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-medium text-neutral-600">Tablet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={cardForm.showOnMobile}
                      onChange={(e) => setCardForm({ ...cardForm, showOnMobile: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-medium text-neutral-600">Mobile</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => { setCardModalOpen(false); setEditingCard(null); }}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-charcoal font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg"
                >
                  {editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB 5: MEDIA LIBRARY                 */}
      {/* ===================================== */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-charcoal">Media Library</h2>
              <p className="text-xs text-neutral-400">Manage all images and assets uploaded to Firebase Storage.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((media) => {
              const isImage = media.mimeType?.startsWith('image/');
              const sizeKB = (media.fileSize / 1024).toFixed(1);
              return (
                <div key={media.id} className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-neutral-50 relative flex items-center justify-center border-b border-neutral-100 overflow-hidden">
                    {isImage ? (
                      <img src={media.downloadUrl} alt={media.fileName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <span className="text-xs font-bold text-neutral-400 uppercase">{media.mimeType?.split('/')[1] || 'File'}</span>
                    )}
                    <button 
                      onClick={() => handleDeleteMedia(media.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-neutral-500 hover:text-red-500 rounded-lg shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between text-[10px] space-y-1">
                    <div>
                      <p className="font-bold text-neutral-800 truncate" title={media.fileName}>{media.fileName}</p>
                      <p className="text-neutral-400">{sizeKB} KB • {media.mimeType?.split('/')[1]}</p>
                      {media.uploadedBy && (
                        <p className="text-neutral-400 truncate">By: {media.uploadedBy.name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(media.downloadUrl);
                        alert('Download URL copied to clipboard!');
                      }}
                      className="w-full py-1 text-center bg-neutral-50 hover:bg-primary/10 hover:text-primary border border-neutral-100 rounded text-[9px] font-semibold transition-colors mt-2"
                    >
                      Copy Link URL
                    </button>
                  </div>
                </div>
              );
            })}

            {mediaList.length === 0 && (
              <div className="col-span-full text-center py-20 text-neutral-400">
                <p className="font-semibold">No uploads found in the Media Library.</p>
                <p className="text-xs">Any files uploaded during product, card, or banner creation will automatically display here.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;

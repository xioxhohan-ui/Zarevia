'use client';

import React, { useState, useEffect } from 'react';
import { Product, NavbarItem, Order, SiteSettings } from '../../lib/db';
import { useCart } from '../../context/CartContext';

export default function AdminPage() {
  const { triggerToast } = useCart();
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'navbar' | 'orders' | 'settings'>('products');

  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [navbar, setNavbar] = useState<NavbarItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form modals and data
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isNavModalOpen, setNavModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingNav, setEditingNav] = useState<NavbarItem | null>(null);

  // Product Form fields
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOriginalPrice, setPOriginalPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pCollections, setPCollections] = useState<string[]>([]);
  const [pSizes, setPSizes] = useState<string[]>([]);
  const [pColors, setPColors] = useState<string[]>([]);
  const [pImages, setPImages] = useState<string[]>([]);
  const [pInStock, setPInStock] = useState(true);
  const [pIsBestSelling, setPIsBestSelling] = useState(false);

  // Nav Form fields
  const [nLabel, setNLabel] = useState('');
  const [nUrl, setNUrl] = useState('');
  const [nOrder, setNOrder] = useState('');

  // Settings Form fields
  const [sShopName, setSShopName] = useState('');
  const [sAnnouncement, setSAnnouncement] = useState('');
  const [sShippingDhaka, setSShippingDhaka] = useState('');
  const [sShippingOutside, setSShippingOutside] = useState('');

  // Multi-input utilities
  const [newColor, setNewColor] = useState('');
  const [newCollection, setNewCollection] = useState('');

  const checkAuthOnLoad = () => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('admin_auth');
      if (savedAuth === 'rifat991') {
        setIsAuthenticated(true);
      }
    }
  };

  useEffect(() => {
    checkAuthOnLoad();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'rifat991') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_auth', 'rifat991');
      }
      triggerToast('Welcome, Administrator!');
    } else {
      triggerToast('Incorrect password!', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_auth');
    }
    triggerToast('Logged out successfully.');
  };

  // Fetch all admin data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      // Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) setProducts(await prodRes.json());

      // Fetch Nav Links
      const navRes = await fetch('/api/navigation');
      if (navRes.ok) {
        const navData = await navRes.json();
        navData.sort((a: NavbarItem, b: NavbarItem) => a.order - b.order);
        setNavbar(navData);
      }

      // Fetch Orders
      const orderRes = await fetch('/api/orders');
      if (orderRes.ok) setOrders(await orderRes.json());

      // Fetch Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
        setSShopName(setData.shopName || 'MYRO');
        setSAnnouncement(setData.announcement || '');
        setSShippingDhaka(String(setData.shippingFeeDhaka || 80));
        setSShippingOutside(String(setData.shippingFeeOutside || 150));
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error loading administrative data.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Product Operations
  const resetProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setPOriginalPrice('');
    setPDescription('');
    setPCollections([]);
    setPSizes(['36', '37', '38', '39', '40', '41']);
    setPColors(['Black', 'Beige']);
    setPImages([]);
    setPInStock(true);
    setPIsBestSelling(false);
  };

  const openAddProductModal = () => {
    resetProductForm();
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setPName(product.name);
    setPPrice(String(product.price));
    setPOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setPDescription(product.description);
    setPCollections(product.collections);
    setPSizes(product.sizes);
    setPColors(product.colors);
    setPImages(product.images);
    setPInStock(product.inStock);
    setPIsBestSelling(product.isBestSelling || false);
    setProductModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    formData.append('file', fileList[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPImages([...pImages, data.url]);
        triggerToast('Image uploaded successfully!');
      } else {
        triggerToast('Image upload failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Upload API error.', 'error');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) {
      triggerToast('Name and Price are required.', 'error');
      return;
    }

    const payload = {
      id: editingProduct?.id,
      name: pName,
      price: Number(pPrice),
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : undefined,
      description: pDescription,
      collections: pCollections,
      sizes: pSizes,
      colors: pColors,
      images: pImages.length > 0 ? pImages : ['/images/zeen-low-heel.jpg'],
      inStock: pInStock,
      isBestSelling: pIsBestSelling,
    };

    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setProductModalOpen(false);
        fetchData();
        resetProductForm();
      } else {
        triggerToast('Failed to save product details.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Product API error.', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast('Product deleted.');
        fetchData();
      } else {
        triggerToast('Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error connecting to delete API.', 'error');
    }
  };

  // Nav Links Operations
  const resetNavForm = () => {
    setEditingNav(null);
    setNLabel('');
    setNUrl('');
    setNOrder('');
  };

  const openAddNavModal = () => {
    resetNavForm();
    setNavModalOpen(true);
  };

  const openEditNavModal = (item: NavbarItem) => {
    setEditingNav(item);
    setNLabel(item.label);
    setNUrl(item.url);
    setNOrder(String(item.order));
    setNavModalOpen(true);
  };

  const handleNavSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nLabel || !nUrl) {
      triggerToast('Label and URL are required.', 'error');
      return;
    }

    const payload = {
      id: editingNav?.id,
      label: nLabel,
      url: nUrl,
      order: nOrder ? Number(nOrder) : undefined,
    };

    const method = editingNav ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/navigation', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerToast(editingNav ? 'Navbar item updated!' : 'Navbar item added!');
        setNavModalOpen(false);
        fetchData();
        resetNavForm();
      } else {
        triggerToast('Failed to save navbar item.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Navbar API error.', 'error');
    }
  };

  const handleDeleteNav = async (id: string) => {
    if (!confirm('Delete this menu item from navigation?')) return;
    try {
      const res = await fetch(`/api/navigation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast('Navbar link deleted.');
        fetchData();
      } else {
        triggerToast('Failed to delete navbar link.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Delete API error.', 'error');
    }
  };

  // Order Status Updates
  const handleOrderStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        triggerToast(`Order status updated to: ${newStatus}`);
        fetchData();
      } else {
        triggerToast('Failed to update order status.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Order Status API error.', 'error');
    }
  };

  // Settings Save
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: sShopName,
          announcement: sAnnouncement,
          shippingFeeDhaka: Number(sShippingDhaka),
          shippingFeeOutside: Number(sShippingOutside),
        }),
      });

      if (res.ok) {
        triggerToast('Shop configurations saved successfully!');
        fetchData();
      } else {
        triggerToast('Failed to save settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Settings API error.', 'error');
    }
  };

  // Color & Collection pill add helpers
  const addColorPill = () => {
    if (newColor.trim() && !pColors.includes(newColor.trim())) {
      setPColors([...pColors, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColorPill = (color: string) => {
    setPColors(pColors.filter((c) => c !== color));
  };

  const addCollectionPill = () => {
    if (newCollection.trim() && !pCollections.includes(newCollection.trim())) {
      setPCollections([...pCollections, newCollection.trim()]);
      setNewCollection('');
    }
  };

  const removeCollectionPill = (col: string) => {
    setPCollections(pCollections.filter((c) => c !== col));
  };

  // Sizes toggle helper
  const toggleSizeCheckbox = (size: string) => {
    if (pSizes.includes(size)) {
      setPSizes(pSizes.filter((s) => s !== size));
    } else {
      setPSizes([...pSizes, size]);
    }
  };

  // Order stats calculations
  const orderStats = React.useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Delivered');
    const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    return { totalOrders, revenue, pendingOrders };
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-title">MYRO Admin Portal</div>
          <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', textAlign: 'center' }}>
            Access requires admin passcode.
          </p>
          <div className="form-group">
            <label className="option-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login to Portal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <div className="admin-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">⚙️ MYRO Store Control Center</h1>
          <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
            Logged in as staff administrator.
          </p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-portal">
        {/* Sidebar Nav Tabs */}
        <aside className="admin-sidebar">
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            👟 Products Catalog
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'navbar' ? 'active' : ''}`}
            onClick={() => setActiveTab('navbar')}
          >
            🔗 Navbar Menu
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders Tracker ({orders.filter(o => o.status === 'Pending').length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            🔧 Shop Settings
          </button>
        </aside>

        {/* Tab Panel Content */}
        <main className="admin-content">
          
          {/* TAB 1: PRODUCTS LISTING */}
          {activeTab === 'products' && (
            <>
              <div className="admin-header-row">
                <h3>Products Manager ({products.length})</h3>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={openAddProductModal}>
                  + Add New Shoe
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Slug (URL)</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.images[0] || '/images/zeen-low-heel.jpg'}
                            alt=""
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ fontWeight: '600' }}>{product.name}</td>
                        <td style={{ color: 'var(--foreground-muted)', fontSize: '12px' }}>/products/{product.slug}</td>
                        <td>
                          <span style={{ fontWeight: '700' }}>Tk {product.price}</span>
                          {product.originalPrice && (
                            <span style={{ textDecoration: 'line-through', fontSize: '11px', color: 'var(--foreground-muted)', marginLeft: '6px' }}>
                              Tk {product.originalPrice}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-status ${product.inStock ? 'delivered' : 'cancelled'}`} style={{ fontSize: '10px' }}>
                            {product.inStock ? 'In Stock' : 'Sold Out'}
                          </span>
                        </td>
                        <td>
                          <div className="action-row-btns">
                            <button
                              className="action-icon-btn edit"
                              onClick={() => openEditProductModal(product)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-icon-btn delete"
                              onClick={() => handleDeleteProduct(product.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 2: NAVBAR CUSTOMIZATION */}
          {activeTab === 'navbar' && (
            <>
              <div className="admin-header-row">
                <h3>Navbar Menu Links</h3>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={openAddNavModal}>
                  + Add Menu Link
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '-10px' }}>
                Manage navigation links. Order controls display sequence (from left to right in header).
              </p>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Link Label</th>
                      <th>URL Path</th>
                      <th>Display Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {navbar.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '600' }}>{item.label}</td>
                        <td style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{item.url}</td>
                        <td>{item.order}</td>
                        <td>
                          <div className="action-row-btns">
                            <button
                              className="action-icon-btn edit"
                              onClick={() => openEditNavModal(item)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-icon-btn delete"
                              onClick={() => handleDeleteNav(item.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 3: ORDERS LISTING */}
          {activeTab === 'orders' && (
            <>
              <div className="admin-header-row">
                <h3>Customer Orders Log</h3>
              </div>

              {/* Stats Overview */}
              <div className="stat-grid" style={{ marginBottom: '10px' }}>
                <div className="stat-card">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">{orderStats.totalOrders}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending Confirmation</div>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{orderStats.pendingOrders}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Delivered Revenue</div>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>Tk {orderStats.revenue.toLocaleString()}</div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items Ordered</th>
                      <th>Total Billing</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>{order.id}</td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>📞 {order.customerPhone}</div>
                            <div style={{ fontSize: '11px', color: 'var(--foreground-muted)', maxWidth: '200px', overflowWrap: 'break-word' }}>
                              📍 {order.deliveryAddress} ({order.district})
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '4px', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: '2px' }}>
                                  <strong>{item.name}</strong> x{item.quantity} 
                                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>
                                    Size: {item.size} | Color: {item.color}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700' }}>Tk {order.totalAmount.toLocaleString()}</div>
                            <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>Fee: Tk {order.shippingFee}</div>
                          </td>
                          <td>
                            <select
                              className="filter-select"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                backgroundColor:
                                  order.status === 'Pending' ? '#fef3c7' :
                                  order.status === 'Shipped' ? '#dbeafe' :
                                  order.status === 'Delivered' ? '#d1fae5' : '#fee2e2',
                                color:
                                  order.status === 'Pending' ? '#b45309' :
                                  order.status === 'Shipped' ? '#1d4ed8' :
                                  order.status === 'Delivered' ? '#047857' : '#b91c1c',
                              }}
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '30px' }}>
                          No orders placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 4: GENERAL SHOP SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-header-row" style={{ borderBottom: 'none' }}>
                <h3>Shop Configuration</h3>
              </div>

              <div className="form-group">
                <label className="option-label">Shop Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={sShopName}
                  onChange={(e) => setSShopName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="option-label">Top Banner Announcement Text</label>
                <textarea
                  className="form-textarea"
                  value={sAnnouncement}
                  onChange={(e) => setSAnnouncement(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="option-label">Shipping Charge Inside Dhaka (Tk)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={sShippingDhaka}
                    onChange={(e) => setSShippingDhaka(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="option-label">Shipping Charge Outside Dhaka (Tk)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={sShippingOutside}
                    onChange={(e) => setSShippingOutside(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                Save Configurations
              </button>
            </form>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay">
          <form className="admin-modal-content" onSubmit={handleProductSubmit}>
            <div className="admin-modal-title">
              {editingProduct ? 'Edit Shoe Details' : 'Add New Shoe Item'}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="option-label">Shoe Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="option-label">Price (Tk) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="option-label">Slashed Price (Tk)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Before discount"
                  value={pOriginalPrice}
                  onChange={(e) => setPOriginalPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="option-label">Product Description *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '80px' }}
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                required
              />
            </div>

            {/* Sizes Multi-checkbox */}
            <div className="form-group">
              <label className="option-label">Available Sizes * (Select all that apply)</label>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '5px' }}>
                {['36', '37', '38', '39', '40', '41'].map((size) => (
                  <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={pSizes.includes(size)}
                      onChange={() => toggleSizeCheckbox(size)}
                    />
                    Size {size}
                  </label>
                ))}
              </div>
            </div>

            {/* Colors Input Pills */}
            <div className="form-group">
              <label className="option-label">Colors</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add color (e.g. Nude)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{ width: '200px' }}
                />
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={addColorPill}>
                  Add
                </button>
              </div>
              <div className="flex-wrap">
                {pColors.map((color) => (
                  <span key={color} className="pill-tag">
                    {color}
                    <button type="button" className="pill-tag-remove" onClick={() => removeColorPill(color)}>&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Collections Tags Input Pills */}
            <div className="form-group">
              <label className="option-label">Collections / Category Tags</label>
              <p style={{ fontSize: '11px', color: 'var(--foreground-muted)', marginTop: '-5px' }}>
                Should match category urls. Common tags: heel, flat, mules, boston, sale, best-selling
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', marginTop: '5px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add tag (e.g. heel)"
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  style={{ width: '200px' }}
                />
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={addCollectionPill}>
                  Add
                </button>
              </div>
              <div className="flex-wrap">
                {pCollections.map((col) => (
                  <span key={col} className="pill-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {col}
                    <button type="button" className="pill-tag-remove" onClick={() => removeCollectionPill(col)}>&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload Input */}
            <div className="form-group">
              <label className="option-label">Product Images</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  style={{ fontSize: '13px' }}
                />
                
                {/* List of active images URLs */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  {pImages.map((imgUrl, index) => (
                    <div key={index} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border)' }}>
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setPImages(pImages.filter((_, i) => i !== index))}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox triggers */}
            <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={pInStock}
                  onChange={(e) => setPInStock(e.target.checked)}
                />
                In Stock & Available
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={pIsBestSelling}
                  onChange={(e) => setPIsBestSelling(e.target.checked)}
                />
                Featured (Best Seller)
              </label>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setProductModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                {editingProduct ? 'Save Changes' : 'Create Shoe'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT NAVIGATION MENU ITEM */}
      {isNavModalOpen && (
        <div className="admin-modal-overlay">
          <form className="admin-modal-content" style={{ maxWidth: '450px' }} onSubmit={handleNavSubmit}>
            <div className="admin-modal-title">
              {editingNav ? 'Edit Navigation Link' : 'Add Navbar Menu Link'}
            </div>

            <div className="form-group">
              <label className="option-label">Menu Label Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Flat"
                value={nLabel}
                onChange={(e) => setNLabel(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="option-label">Target URL Path *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. /collections/flat"
                value={nUrl}
                onChange={(e) => setNUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="option-label">Order Sequence Number</label>
              <input
                type="number"
                className="form-input"
                placeholder="1 (leftmost), 2, 3..."
                value={nOrder}
                onChange={(e) => setNOrder(e.target.value)}
              />
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setNavModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                {editingNav ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  BarChart3,
  Layers,
  Edit3,
  Trash2,
  Plus,
  X,
  Eye,
  LogOut,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  User,
  ArrowRight,
  Kanban,
  Users,
  Settings,
  Sliders,
  Bell,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  ShieldAlert
} from 'lucide-react';
import { SOCKET_URL } from '../config/api';

const ORDER_STATUSES = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminDashboard() {
  const { API_BASE_URL, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation Tabs: 'overview' | 'kanban' | 'orders' | 'inventory' | 'users' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data from MongoDB
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loadingInv, setLoadingInv] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Search, Filter & Sort States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('ALL');
  const [orderSort, setOrderSort] = useState('newest');

  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');
  const [invStockFilter, setInvStockFilter] = useState('ALL');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Modals & Drawers
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Edit Item Form State
  const [editStockQuantity, setEditStockQuantity] = useState(0);
  const [editThreshold, setEditThreshold] = useState(20);
  const [editPrice, setEditPrice] = useState(0);

  // Add Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'base',
    price: 50,
    stockQuantity: 100,
    minThreshold: 20,
    description: '',
  });

  // Settings State
  const [storeSettings, setStoreSettings] = useState({
    isStoreOpen: true,
    autoAcceptOrders: true,
    avgPrepTime: 25,
    lowStockThreshold: 20,
    notificationEmail: 'admin@slicecraftpizza.com',
    currency: 'INR (₹)',
    emergencyPause: false,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const getAuthHeader = () => {
    const saved = localStorage.getItem('pizza_user');
    const token = user?.token || (saved ? JSON.parse(saved)?.token : '');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    fetchInventory();
    fetchOrders();
    fetchUsers();
    fetchAnalytics();

    // Socket.io setup
    const socket = io(SOCKET_URL);

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      addToast(`🍕 New Order Received: #${newOrder._id?.slice(-8) || newOrder._id}!`, 'success');
      fetchInventory();
      fetchAnalytics();
    });

    socket.on('order_status_updated', (data) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === data.orderId ? { ...o, orderStatus: data.orderStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === data.orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: data.orderStatus }));
      }
    });

    socket.on('inventory_updated', () => {
      fetchInventory();
    });

    socket.on('stock_updated', () => {
      fetchInventory();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Inventory from DB
  const fetchInventory = async () => {
    setLoadingInv(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/admin/all`, getAuthHeader());
      setInventory(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoadingInv(false);
    }
  };

  // Fetch Orders from DB
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/admin/all-orders`, getAuthHeader());
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Users from DB
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/admin/users`, getAuthHeader());
      setUsersList(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Analytics from DB
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/admin/analytics`, getAuthHeader());
      setAnalytics(res.data || null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleRefreshAll = () => {
    fetchInventory();
    fetchOrders();
    fetchUsers();
    fetchAnalytics();
    addToast('Dashboard synchronized with MongoDB Atlas.', 'success');
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/orders/admin/status/${orderId}`,
        { orderStatus: newStatus },
        getAuthHeader()
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }

      addToast(`Order #${orderId.slice(-8)} updated to "${newStatus}"`, 'success');
      fetchAnalytics();
    } catch (err) {
      addToast(`Failed to update status: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Save Edit Stock
  const handleSaveStockUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await axios.put(
        `${API_BASE_URL}/inventory/admin/stock/${editingItem._id}`,
        {
          stockQuantity: Number(editStockQuantity),
          minThreshold: Number(editThreshold),
          price: Number(editPrice),
        },
        getAuthHeader()
      );

      addToast(`Stock for "${editingItem.name}" updated successfully!`, 'success');
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      addToast(`Failed to update item: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Add New Item
  const handleCreateNewItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/inventory/admin/add`, newItem, getAuthHeader());
      addToast(`New ingredient "${newItem.name}" added to inventory!`, 'success');
      setIsAddItemOpen(false);
      setNewItem({
        name: '',
        category: 'base',
        price: 50,
        stockQuantity: 100,
        minThreshold: 20,
        description: '',
      });
      fetchInventory();
    } catch (err) {
      addToast(`Failed to create item: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Delete Item
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/inventory/admin/delete/${id}`, getAuthHeader());
      addToast(`Item "${name}" removed from inventory.`, 'success');
      fetchInventory();
    } catch (err) {
      addToast(`Failed to delete: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // User CRUD States & Handlers
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    isVerified: true,
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isVerified: true,
    password: '',
  });

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setEditUserData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'user',
      isVerified: Boolean(u.isVerified),
      password: '',
    });
  };

  const handleSaveUserUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/auth/admin/users/${editingUser._id}`,
        editUserData,
        getAuthHeader()
      );
      addToast(res.data.message || `User "${editUserData.name}" updated successfully!`, 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      addToast(`Failed to update user: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`${API_BASE_URL}/auth/admin/users/${userId}/role`, { role: newRole }, getAuthHeader());
      addToast(`User role updated to ${newRole.toUpperCase()}`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(`Failed to update role: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleToggleUserVerify = async (userId) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/auth/admin/users/${userId}/verify`, {}, getAuthHeader());
      addToast(res.data.message || 'Verification status updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast(`Failed to update verification: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (user && (user._id === userId || user.id === userId)) {
      addToast('Security Warning: You cannot delete your own active Admin account!', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/auth/admin/users/${userId}`, getAuthHeader());
      addToast(res.data.message || `User "${name}" deleted from database.`, 'success');
      fetchUsers();
      fetchOrders();
    } catch (err) {
      addToast(`Failed to delete user: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Name, email, and password are required!', 'error');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/admin/users`, newUser, getAuthHeader());
      addToast(res.data.message || `User "${newUser.name}" created successfully!`, 'success');
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'user', isVerified: true });
      fetchUsers();
    } catch (err) {
      addToast(`Failed to create user: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    addToast('Kitchen & Store configuration updated successfully!', 'success');
  };

  // Computed KPIs directly from real orders & inventory
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Order Received').length;
  const inKitchenOrders = orders.filter((o) => o.orderStatus === 'In Kitchen').length;
  const outForDeliveryOrders = orders.filter((o) => o.orderStatus === 'Sent to Delivery').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const lowStockItems = inventory.filter((i) => i.stockQuantity <= i.minThreshold).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Today's Computed Metrics
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const yesterdayMidnight = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const todayOrdersList = useMemo(() => {
    return orders.filter((o) => new Date(o.createdAt) >= todayMidnight);
  }, [orders, todayMidnight]);

  const todayOrdersCount = todayOrdersList.length;
  const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Filtered Orders with Date Range
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = orderSearch.toLowerCase();
        const matchesSearch =
          (order._id && order._id.toLowerCase().includes(query)) ||
          (order.customerName && order.customerName.toLowerCase().includes(query)) ||
          (order.customerEmail && order.customerEmail.toLowerCase().includes(query)) ||
          (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(query));

        const matchesStatus =
          orderStatusFilter === 'ALL' || order.orderStatus === orderStatusFilter;

        const orderDate = new Date(order.createdAt || 0);
        let matchesDate = true;
        if (orderDateFilter === 'TODAY') {
          matchesDate = orderDate >= todayMidnight;
        } else if (orderDateFilter === 'YESTERDAY') {
          matchesDate = orderDate >= yesterdayMidnight && orderDate < todayMidnight;
        } else if (orderDateFilter === 'WEEK') {
          matchesDate = orderDate >= sevenDaysAgo;
        } else if (orderDateFilter === 'MONTH') {
          matchesDate = orderDate >= thirtyDaysAgo;
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return orderSort === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter, orderSort, todayMidnight, yesterdayMidnight, sevenDaysAgo, thirtyDaysAgo]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(invSearch.toLowerCase());
      const matchesCat = invCategoryFilter === 'ALL' || item.category === invCategoryFilter;
      const isLow = item.stockQuantity <= item.minThreshold && item.stockQuantity > 0;
      const isOut = item.stockQuantity === 0;
      const isNormal = item.stockQuantity > item.minThreshold;

      let matchesStock = true;
      if (invStockFilter === 'IN_STOCK') matchesStock = isNormal;
      if (invStockFilter === 'LOW_STOCK') matchesStock = isLow;
      if (invStockFilter === 'OUT_OF_STOCK') matchesStock = isOut;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [inventory, invSearch, invCategoryFilter, invStockFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const query = userSearch.toLowerCase();
      const matchesSearch =
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u._id && String(u._id).toLowerCase().includes(query));

      const matchesRole =
        userRoleFilter === 'ALL' ||
        (userRoleFilter === 'ADMIN' && u.role === 'admin') ||
        (userRoleFilter === 'CUSTOMER' && (u.role === 'user' || !u.role));

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Order Received':
        return 'order-received';
      case 'In Kitchen':
        return 'in-kitchen';
      case 'Sent to Delivery':
        return 'sent-to-delivery';
      case 'Delivered':
        return 'delivered';
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'order-received';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Dedicated Admin Navbar */}
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={orders.length}
        invCount={inventory.length}
        usersCount={usersList.length}
        onRefresh={handleRefreshAll}
      />

      <div className="site-container py-8 space-y-8 animate-fade-in" style={{ flex: 1 }}>
        {/* ========================================================
            TAB 1: OVERVIEW & OPERATIONS COMMAND CENTER
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Header & 8 KPI Cards */}
            <div className="admin-header-card">
              <div className="admin-header-top">
                <div className="admin-brand-info">
                  <div className="admin-icon-badge">
                    <ShieldCheck style={{ width: '28px', height: '28px' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '11px', padding: '2px 10px' }}>
                        Live MongoDB Sync
                      </span>
                      <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span> Socket.io Live
                      </span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                      SliceCraft <span className="gradient-text">Operations Command Center</span>
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Real-time administration, kitchen dispatching, user directories, and inventory automation.
                    </p>
                  </div>
                </div>

                <div className="admin-header-actions">
                  <button onClick={handleRefreshAll} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    <RefreshCw style={{ width: '14px', height: '14px' }} /> Sync MongoDB
                  </button>
                </div>
              </div>

              {/* 8 KPI CARDS */}
              <div className="admin-kpi-grid">
                {/* Today's Orders */}
                <div className="admin-kpi-card" onClick={() => { setActiveTab('orders'); setOrderDateFilter('TODAY'); }} style={{ cursor: 'pointer', borderColor: 'rgba(255, 138, 0, 0.4)' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label" style={{ color: '#FF8A00' }}>Today's Orders</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
                      <Calendar style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#FF8A00' }}>{todayOrdersCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Orders placed today</div>
                </div>

                {/* Today's Revenue */}
                <div className="admin-kpi-card" onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label" style={{ color: '#10B981' }}>Today's Revenue</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                      <DollarSign style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#10B981' }}>₹{todayRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gross today</div>
                </div>

                {/* Total All-Time Orders */}
                <div className="admin-kpi-card" onClick={() => { setActiveTab('orders'); setOrderDateFilter('ALL'); }} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">All-Time Orders</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
                      <ShoppingBag style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{totalOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Permanent in DB</div>
                </div>

                {/* All-Time Revenue */}
                <div className="admin-kpi-card" onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">All-Time Revenue</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
                      <TrendingUp style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#FF8A00' }}>₹{totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total sales</div>
                </div>

                {/* Pending Orders */}
                <div className="admin-kpi-card" onClick={() => setActiveTab('kanban')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">Pending</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
                      <Clock style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#FF8A00' }}>{pendingOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Order Received</div>
                </div>

                {/* In Kitchen */}
                <div className="admin-kpi-card" onClick={() => setActiveTab('kanban')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">In Kitchen</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(247, 37, 79, 0.15)', color: '#F7254F' }}>
                      <ChefHat style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#F7254F' }}>{inKitchenOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Baking in oven</div>
                </div>

                {/* Out for Delivery */}
                <div className="admin-kpi-card" onClick={() => setActiveTab('kanban')} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">Out for Delivery</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' }}>
                      <Bike style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#C084FC' }}>{outForDeliveryOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Riders dispatched</div>
                </div>

                {/* Completed */}
                <div className="admin-kpi-card" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('Delivered'); }} style={{ cursor: 'pointer' }}>
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">Completed</span>
                    <div className="admin-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                      <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                  <div className="admin-kpi-value" style={{ color: '#34D399' }}>{completedOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Delivered</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Recent Active Orders */}
              <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag style={{ width: '18px', height: '18px', color: '#FF8A00' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Orders</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    style={{ background: 'none', border: 'none', color: '#FF8A00', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View All ({orders.length}) <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {loadingOrders ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading recent orders...</div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders recorded yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.slice(0, 5).map((order) => {
                      const firstItemName = order.items?.[0]?.customName || order.items?.[0]?.name || 'Artisan Custom Pizza';
                      const extraCount = (order.items?.length || 1) - 1;
                      const itemSummary = extraCount > 0 ? `${firstItemName} +${extraCount} more` : firstItemName;

                      return (
                        <div
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: 'rgba(15, 17, 26, 0.6)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '12px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            gap: '14px',
                            minWidth: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span style={{ color: '#FF8A00', fontFamily: 'monospace' }}>#{order._id?.slice(-8) || order._id}</span> &bull; {order.customerName || 'Guest'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {itemSummary} &bull; <strong style={{ color: '#10B981' }}>₹{order.totalAmount}</strong>
                            </div>
                          </div>
                          <span className={`status-pill ${getStatusClass(order.orderStatus)}`} style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                            {order.orderStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Low Stock Alerts Glance */}
              <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle style={{ width: '18px', height: '18px', color: '#F7254F' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Stock Alerts</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    style={{ background: 'none', border: 'none', color: '#FF8A00', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Manage Inventory <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {inventory.filter((i) => i.stockQuantity <= i.minThreshold).length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 style={{ width: '32px', height: '32px' }} />
                    <span>All inventory levels are healthy! No stock alerts.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {inventory
                      .filter((i) => i.stockQuantity <= i.minThreshold)
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item._id}
                          style={{
                            background: 'rgba(247, 37, 79, 0.08)',
                            border: '1px solid rgba(247, 37, 79, 0.25)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{item.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Category: <strong style={{ color: '#FF8A00' }}>{item.category}</strong>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#F87171' }}>
                              {item.stockQuantity} left
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Min threshold: {item.minThreshold}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: KITCHEN KANBAN
            ======================================================== */}
        {activeTab === 'kanban' && (
          <div className="space-y-6 animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Live Kitchen & Delivery Workflow
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Move orders through the production pipeline. Status changes instantly reflect on customer live trackers.
                </p>
              </div>
              <button onClick={handleRefreshAll} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RefreshCw style={{ width: '13px', height: '13px' }} /> Sync Board
              </button>
            </div>

            <div className="kanban-board-grid">
              {/* Column 1: Received */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-title" style={{ color: '#FF8A00' }}>
                    <Clock style={{ width: '16px', height: '16px' }} /> 1. RECEIVED
                  </div>
                  <span className="kanban-count-pill" style={{ background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
                    {orders.filter((o) => o.orderStatus === 'Order Received').length}
                  </span>
                </div>
                <div className="kanban-column-body">
                  {orders
                    .filter((o) => o.orderStatus === 'Order Received')
                    .map((order) => (
                      <div key={order._id} className="kanban-card">
                        <div className="kanban-card-top">
                          <span className="kanban-order-id">#{order._id?.slice(-8) || order._id}</span>
                          <span className="kanban-order-time">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="kanban-customer-name">{order.customerName || 'SliceCraft Customer'}</div>
                        <div className="kanban-items-summary">
                          {order.items?.length || 1} Pizza(s) &bull; ₹{order.totalAmount}
                        </div>
                        <div className="kanban-card-actions">
                          <button onClick={() => setSelectedOrder(order)} className="btn-kanban-view">
                            <Eye style={{ width: '13px', height: '13px' }} /> View
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'In Kitchen')}
                            className="btn-kanban-action btn-to-kitchen"
                          >
                            To Kitchen <ArrowRight style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {orders.filter((o) => o.orderStatus === 'Order Received').length === 0 && (
                    <div className="kanban-empty">No pending orders.</div>
                  )}
                </div>
              </div>

              {/* Column 2: In Kitchen */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-title" style={{ color: '#60A5FA' }}>
                    <ChefHat style={{ width: '16px', height: '16px' }} /> 2. IN KITCHEN
                  </div>
                  <span className="kanban-count-pill" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
                    {orders.filter((o) => o.orderStatus === 'In Kitchen').length}
                  </span>
                </div>
                <div className="kanban-column-body">
                  {orders
                    .filter((o) => o.orderStatus === 'In Kitchen')
                    .map((order) => (
                      <div key={order._id} className="kanban-card" style={{ borderLeft: '3px solid #60A5FA' }}>
                        <div className="kanban-card-top">
                          <span className="kanban-order-id">#{order._id?.slice(-8) || order._id}</span>
                          <span className="kanban-order-time">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="kanban-customer-name">{order.customerName}</div>
                        <div className="kanban-items-summary">
                          {order.items?.length || 1} Pizza(s) &bull; ₹{order.totalAmount}
                        </div>
                        <div className="kanban-card-actions">
                          <button onClick={() => setSelectedOrder(order)} className="btn-kanban-view">
                            <Eye style={{ width: '13px', height: '13px' }} /> View
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'Sent to Delivery')}
                            className="btn-kanban-action btn-to-delivery"
                          >
                            Dispatch <Bike style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {orders.filter((o) => o.orderStatus === 'In Kitchen').length === 0 && (
                    <div className="kanban-empty">Kitchen is clear.</div>
                  )}
                </div>
              </div>

              {/* Column 3: Out for Delivery */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-title" style={{ color: '#C084FC' }}>
                    <Bike style={{ width: '16px', height: '16px' }} /> 3. OUT FOR DELIVERY
                  </div>
                  <span className="kanban-count-pill" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' }}>
                    {orders.filter((o) => o.orderStatus === 'Sent to Delivery').length}
                  </span>
                </div>
                <div className="kanban-column-body">
                  {orders
                    .filter((o) => o.orderStatus === 'Sent to Delivery')
                    .map((order) => (
                      <div key={order._id} className="kanban-card" style={{ borderLeft: '3px solid #C084FC' }}>
                        <div className="kanban-card-top">
                          <span className="kanban-order-id">#{order._id?.slice(-8) || order._id}</span>
                          <span className="kanban-order-time">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="kanban-customer-name">{order.customerName}</div>
                        <div className="kanban-items-summary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📍 {order.deliveryAddress}
                        </div>
                        <div className="kanban-card-actions">
                          <button onClick={() => setSelectedOrder(order)} className="btn-kanban-view">
                            <Eye style={{ width: '13px', height: '13px' }} /> View
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                            className="btn-kanban-action btn-to-delivered"
                          >
                            Delivered <Check style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {orders.filter((o) => o.orderStatus === 'Sent to Delivery').length === 0 && (
                    <div className="kanban-empty">No couriers currently en-route.</div>
                  )}
                </div>
              </div>

              {/* Column 4: Delivered */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-title" style={{ color: '#34D399' }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px' }} /> 4. DELIVERED
                  </div>
                  <span className="kanban-count-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                    {orders.filter((o) => o.orderStatus === 'Delivered').length}
                  </span>
                </div>
                <div className="kanban-column-body">
                  {orders
                    .filter((o) => o.orderStatus === 'Delivered')
                    .slice(0, 10)
                    .map((order) => (
                      <div key={order._id} className="kanban-card" style={{ opacity: 0.85, borderLeft: '3px solid #34D399' }}>
                        <div className="kanban-card-top">
                          <span className="kanban-order-id">#{order._id?.slice(-8) || order._id}</span>
                          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>Completed ✓</span>
                        </div>
                        <div className="kanban-customer-name">{order.customerName}</div>
                        <div className="kanban-items-summary">Total: ₹{order.totalAmount} &bull; Paid</div>
                        <button onClick={() => setSelectedOrder(order)} className="btn-kanban-view" style={{ width: '100%', marginTop: '6px' }}>
                          <Eye style={{ width: '13px', height: '13px' }} /> View Order Summary
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.orderStatus === 'Delivered').length === 0 && (
                    <div className="kanban-empty">No completed orders yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ORDERS MANAGEMENT
            ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Orders Controls */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                {/* Search */}
                <div className="admin-search-wrapper" style={{ flex: '1', minWidth: '240px' }}>
                  <Search className="admin-search-icon" style={{ width: '16px', height: '16px' }} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer Name, Email, Address..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {orderSearch && (
                    <button onClick={() => setOrderSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Date Filter */}
                  <select
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="admin-select"
                    style={{ borderColor: orderDateFilter !== 'ALL' ? '#FF8A00' : 'var(--border-color)' }}
                  >
                    <option value="ALL">📅 All Dates (Permanent)</option>
                    <option value="TODAY">⚡ Today's Orders ({todayOrdersCount})</option>
                    <option value="YESTERDAY">⏮ Yesterday's Orders</option>
                    <option value="WEEK">📊 Past 7 Days</option>
                    <option value="MONTH">🗓 Past 30 Days</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Statuses ({orders.length})</option>
                    <option value="Order Received">Order Received ({pendingOrders})</option>
                    <option value="In Kitchen">In Kitchen ({inKitchenOrders})</option>
                    <option value="Sent to Delivery">Sent to Delivery ({outForDeliveryOrders})</option>
                    <option value="Delivered">Delivered ({completedOrders})</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value)}
                    className="admin-select"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                  </select>
                </div>
              </div>
            </div>


            {/* Orders Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items & Customizations</th>
                    <th>Total</th>
                    <th>Date / Time</th>
                    <th>Live Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Loading orders from MongoDB...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No orders matching your search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span style={{ fontWeight: 800, color: '#FF8A00' }}>
                            #{order._id?.slice(-8) || order._id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#FFF' }}>{order.customerName || 'Guest User'}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{order.customerEmail || 'No Email'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {order.items?.map((item, idx) => (
                              <span key={idx} style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                                {item.quantity || 1}x <strong>{item.name}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#10B981' }}>₹{order.totalAmount}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`status-pill ${getStatusClass(order.orderStatus)}`}
                            style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status} style={{ background: '#1A1E2E', color: '#FFF' }}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            <Eye style={{ width: '12px', height: '12px' }} /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: STOCK INVENTORY
            ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Inventory Overview Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Master Ingredient Inventory
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Manage stock quantities, minimum threshold alerts, and pricing for bases, sauces, cheeses, and veggies.
                </p>
              </div>
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} /> Add New Ingredient
              </button>
            </div>

            {/* Inventory Filter Bar */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div className="admin-search-wrapper" style={{ flex: '1', minWidth: '240px' }}>
                  <Search className="admin-search-icon" style={{ width: '16px', height: '16px' }} />
                  <input
                    type="text"
                    placeholder="Search ingredients by name..."
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {invSearch && (
                    <button onClick={() => setInvSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={invCategoryFilter}
                    onChange={(e) => setInvCategoryFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="base">Crust Bases</option>
                    <option value="sauce">Sauces</option>
                    <option value="cheese">Cheeses</option>
                    <option value="veggie">Veggies & Toppings</option>
                  </select>

                  <select
                    value={invStockFilter}
                    onChange={(e) => setInvStockFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Stock Levels</option>
                    <option value="IN_STOCK">In Stock (Healthy)</option>
                    <option value="LOW_STOCK">Low Stock (Alert)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Alert Threshold</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingInv ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Loading inventory...
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No inventory items found.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = item.stockQuantity <= item.minThreshold && item.stockQuantity > 0;
                      const isOut = item.stockQuantity === 0;

                      return (
                        <tr key={item._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 138, 0, 0.1)',
                                  color: '#FF8A00',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Package style={{ width: '16px', height: '16px' }} />
                              </div>
                              <span style={{ fontWeight: 800, color: '#FFF' }}>{item.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#FFF' }}>₹{item.price}</span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 900,
                                fontSize: '1rem',
                                color: isOut ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                              }}
                            >
                              {item.stockQuantity}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-muted)' }}>{item.minThreshold}</span>
                          </td>
                          <td>
                            {isOut ? (
                              <span className="status-pill cancelled" style={{ fontSize: '0.72rem' }}>
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="status-pill order-received" style={{ fontSize: '0.72rem' }}>
                                ⚠️ Low Stock
                              </span>
                            ) : (
                              <span className="status-pill delivered" style={{ fontSize: '0.72rem' }}>
                                In Stock
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setEditStockQuantity(item.stockQuantity);
                                  setEditThreshold(item.minThreshold);
                                  setEditPrice(item.price);
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                title="Edit Stock & Pricing"
                              >
                                <Edit3 style={{ width: '12px', height: '12px' }} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id, item.name)}
                                className="btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}
                                title="Delete Item"
                              >
                                <Trash2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: USERS DIRECTORY
            ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Registered Users & Customer Directory
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Manage platform users, update access permissions, verify accounts, and perform user CRUD administration.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setIsAddUserOpen(true)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                  <Plus style={{ width: '14px', height: '14px' }} /> Add New User
                </button>
                <button onClick={fetchUsers} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                  <RefreshCw style={{ width: '13px', height: '13px' }} /> Sync Users
                </button>
              </div>
            </div>

            {/* Users Filter Bar */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div className="admin-search-wrapper" style={{ flex: '1', minWidth: '240px' }}>
                  <Search className="admin-search-icon" style={{ width: '16px', height: '16px' }} />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or ID..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="ALL">All Roles ({usersList.length})</option>
                  <option value="CUSTOMER">Customers Only</option>
                  <option value="ADMIN">Administrators Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Verification</th>
                    <th>Registered Date</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Loading users from MongoDB...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: u.role === 'admin' ? 'linear-gradient(135deg, #FF8A00, #F7254F)' : 'rgba(255,255,255,0.1)',
                                color: '#FFF',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style={{ fontWeight: 800, color: '#FFF' }}>{u.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#CBD5E1' }}>{u.email}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: u.phone ? '#94A3B8' : '#64748B' }}>
                            {u.phone || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {u.role === 'admin' ? (
                            <span
                              style={{
                                background: 'rgba(247, 37, 79, 0.15)',
                                color: '#F7254F',
                                border: '1px solid rgba(247, 37, 79, 0.3)',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                              }}
                            >
                              👑 Admin
                            </span>
                          ) : (
                            <span
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60A5FA',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              Customer
                            </span>
                          )}
                        </td>
                        <td>
                          {u.isVerified ? (
                            <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 style={{ width: '13px', height: '13px' }} /> Verified
                            </span>
                          ) : (
                            <span style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock style={{ width: '13px', height: '13px' }} /> Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {/* Edit User Button */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="btn-secondary"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.75rem',
                                color: '#60A5FA',
                                borderColor: 'rgba(96, 165, 250, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Edit Customer Details"
                            >
                              <Edit3 style={{ width: '13px', height: '13px' }} /> Edit
                            </button>

                            {/* Verification Toggle Button */}
                            <button
                              onClick={() => handleToggleUserVerify(u._id)}
                              className="btn-secondary"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.75rem',
                                color: u.isVerified ? '#F59E0B' : '#10B981',
                                borderColor: u.isVerified ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                              }}
                              title={u.isVerified ? 'Mark as Unverified' : 'Verify Account'}
                            >
                              {u.isVerified ? 'Unverify' : 'Verify'}
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              style={{
                                background: 'rgba(247, 37, 79, 0.12)',
                                border: '1px solid rgba(247, 37, 79, 0.35)',
                                color: '#F7254F',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Delete Customer Account"
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: ANALYTICS & INSIGHTS
            ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Real-Time Sales & Kitchen Analytics
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Aggregated performance metrics derived directly from MongoDB transactions.
                </p>
              </div>
              <button onClick={fetchAnalytics} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh Analytics
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Gross Revenue Card */}
              <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp style={{ width: '22px', height: '22px', color: '#10B981' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Revenue Breakdown</h3>
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FF8A00' }}>
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total gross revenue across {orders.length} orders recorded in the system.
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Average Order Value:</span>
                  <strong style={{ color: '#FFF' }}>₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}</strong>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 style={{ width: '22px', height: '22px', color: '#60A5FA' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Workflow Distribution</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Delivered ({completedOrders})</span>
                      <span>{orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${orders.length > 0 ? (completedOrders / orders.length) * 100 : 0}%`, height: '100%', background: '#10B981' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>In Kitchen ({inKitchenOrders})</span>
                      <span>{orders.length > 0 ? Math.round((inKitchenOrders / orders.length) * 100) : 0}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${orders.length > 0 ? (inKitchenOrders / orders.length) * 100 : 0}%`, height: '100%', background: '#60A5FA' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Pending Received ({pendingOrders})</span>
                      <span>{orders.length > 0 ? Math.round((pendingOrders / orders.length) * 100) : 0}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${orders.length > 0 ? (pendingOrders / orders.length) * 100 : 0}%`, height: '100%', background: '#FF8A00' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: SETTINGS
            ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in" style={{ maxWidth: '800px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Platform & Kitchen Operations Settings
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Configure restaurant ordering availability, alert triggers, and kitchen dispatch timing.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="glass-panel" style={{ borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Store Availability Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>Store Online Ordering</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Allow customers to place real-time orders via website.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStoreSettings((s) => ({ ...s, isStoreOpen: !s.isStoreOpen }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: storeSettings.isStoreOpen ? '#10B981' : '#64748B' }}
                >
                  {storeSettings.isStoreOpen ? <ToggleRight style={{ width: '38px', height: '38px' }} /> : <ToggleLeft style={{ width: '38px', height: '38px' }} />}
                </button>
              </div>

              {/* Prep Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
                  Average Kitchen Prep Time (Minutes)
                </label>
                <input
                  type="number"
                  value={storeSettings.avgPrepTime}
                  onChange={(e) => setStoreSettings((s) => ({ ...s, avgPrepTime: Number(e.target.value) }))}
                  className="input-field"
                  style={{ maxWidth: '240px' }}
                />
              </div>

              {/* Low Stock Alert Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
                  Low Stock Notification Email
                </label>
                <input
                  type="email"
                  value={storeSettings.notificationEmail}
                  onChange={(e) => setStoreSettings((s) => ({ ...s, notificationEmail: e.target.value }))}
                  className="input-field"
                  style={{ maxWidth: '380px' }}
                />
              </div>

              {/* Save Button */}
              <div style={{ paddingTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                  Save Platform Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================
          ORDER DETAILS DRAWER / MODAL
          ======================================================== */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                  Order Details #{selectedOrder._id?.slice(-8) || selectedOrder._id}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div className="admin-modal-body space-y-6">
              {/* Customer Details */}
              <div style={{ background: 'rgba(15, 17, 26, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF8A00', textTransform: 'uppercase' }}>
                  Customer Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Name: </span>
                    <strong style={{ color: '#FFF' }}>{selectedOrder.customerName || 'Guest User'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                    <strong style={{ color: '#FFF' }}>{selectedOrder.customerEmail || 'Not provided'}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                    <strong style={{ color: '#FFF' }}>{selectedOrder.deliveryAddress || 'Pickup'}</strong>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF8A00', textTransform: 'uppercase' }}>
                  Ordered Items ({selectedOrder.items?.length || 1})
                </div>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(15, 17, 26, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#FFF' }}>
                        {item.quantity || 1}x {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.base?.name && `Base: ${item.base.name} • `}
                        {item.sauce?.name && `Sauce: ${item.sauce.name} • `}
                        {item.cheese?.name && `Cheese: ${item.cheese.name}`}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, color: '#10B981' }}>₹{item.price * (item.quantity || 1)}</div>
                  </div>
                ))}
              </div>

              {/* Status Update Actions */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFF' }}>Update Order Status:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateOrderStatus(selectedOrder._id, st)}
                      className={`btn-secondary ${selectedOrder.orderStatus === st ? 'active' : ''}`}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderColor: selectedOrder.orderStatus === st ? '#FF8A00' : 'var(--border-color)',
                        color: selectedOrder.orderStatus === st ? '#FF8A00' : '#FFF',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT INVENTORY MODAL
          ======================================================== */}
      {editingItem && (
        <div className="admin-modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Edit Stock: {editingItem.name}
              </h3>
              <button onClick={() => setEditingItem(null)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleSaveStockUpdate} className="admin-modal-body space-y-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Current Stock Quantity</label>
                <input
                  type="number"
                  value={editStockQuantity}
                  onChange={(e) => setEditStockQuantity(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Min Threshold Alert</label>
                <input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Unit Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD INGREDIENT MODAL
          ======================================================== */}
      {isAddItemOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddItemOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Add New Ingredient
              </h3>
              <button onClick={() => setIsAddItemOpen(false)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleCreateNewItem} className="admin-modal-body space-y-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Ingredient Name</label>
                <input
                  type="text"
                  placeholder="e.g., Truffle Aioli"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="base">Crust Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="veggie">Veggie / Topping</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Initial Stock</label>
                  <input
                    type="number"
                    value={newItem.stockQuantity}
                    onChange={(e) => setNewItem({ ...newItem, stockQuantity: Number(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Unit Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setIsAddItemOpen(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW USER MODAL
          ======================================================== */}
      {isAddUserOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Add New User Account
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="admin-modal-body space-y-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>System Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="user">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Verification Status</label>
                  <select
                    value={newUser.isVerified ? 'true' : 'false'}
                    onChange={(e) => setNewUser({ ...newUser, isVerified: e.target.value === 'true' })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="true">Verified Account</option>
                    <option value="false">Pending Verification</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT USER MODAL
          ======================================================== */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Edit User: {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="admin-modal-close">
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleSaveUserUpdate} className="admin-modal-body space-y-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Full Name *</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Email Address *</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Reset Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editUserData.password}
                    onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>System Role</label>
                  {editingUser && (editingUser.email === 'admin@pizzadelivery.com' || (user && (user._id === editingUser._id || user.id === editingUser._id))) ? (
                    <input
                      type="text"
                      value="👑 Administrator (Protected)"
                      disabled
                      className="input-field"
                      style={{ opacity: 0.8, cursor: 'not-allowed', color: '#F7254F', fontWeight: 800, background: 'rgba(247, 37, 79, 0.1)', borderColor: 'rgba(247, 37, 79, 0.3)' }}
                      title="Super Admin role is protected to prevent lockout"
                    />
                  ) : (
                    <select
                      value={editUserData.role}
                      onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                      className="admin-select"
                      style={{ width: '100%' }}
                    >
                      <option value="user">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Verification Status</label>
                  <select
                    value={editUserData.isVerified ? 'true' : 'false'}
                    onChange={(e) => setEditUserData({ ...editUserData, isVerified: e.target.value === 'true' })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="true">Verified Account</option>
                    <option value="false">Pending Verification</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TOAST NOTIFICATIONS
          ======================================================== */}
      <div className="admin-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? (
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            ) : (
              <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

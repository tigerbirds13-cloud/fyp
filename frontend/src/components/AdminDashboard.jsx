import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Briefcase, Star, MessageSquare, LogOut, Menu, X,
  Home, CreditCard
} from 'lucide-react';
import axios from 'axios';
import AdminUsers from './admin/AdminUsers';
import AdminServices from './admin/AdminServices';
import AdminBookings from './admin/AdminBookings';
import AdminReviews from './admin/AdminReviews';
import AdminContacts from './admin/AdminContacts';
import AdminPaymentLogger from './admin/AdminPaymentLogger';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalBookings: 0,
    totalReviews: 0,
    totalMessages: 0,
    totalPayments: 0
  });
  const [dashboardData, setDashboardData] = useState({
    users: [],
    services: [],
    bookings: [],
    reviews: [],
    contacts: [],
    payments: [],
    paymentStats: null,
  });
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [users, services, bookings, reviews, contacts, payments] = await Promise.all([
        axios.get('/api/admin/users', { headers }).catch(() => ({ data: { users: [] } })),
        axios.get('/api/admin/services', { headers }).catch(() => ({ data: { services: [] } })),
        axios.get('/api/admin/bookings', { headers }).catch(() => ({ data: { bookings: [] } })),
        axios.get('/api/admin/reviews', { headers }).catch(() => ({ data: { reviews: [] } })),
        axios.get('/api/admin/contacts', { headers }).catch(() => ({ data: { contacts: [] } })),
        axios.get('/api/logs/payments', { headers }).catch(() => ({ data: { payments: [], stats: null } }))
      ]);

      const usersList = users.data?.data?.users || users.data?.users || [];
      const servicesList = services.data?.data?.services || services.data?.services || [];
      const bookingsList = bookings.data?.data?.bookings || bookings.data?.bookings || [];
      const reviewsList = reviews.data?.data?.reviews || reviews.data?.reviews || [];
      const contactsList = contacts.data?.data?.contacts || contacts.data?.data?.messages || contacts.data?.contacts || contacts.data?.messages || [];
      const paymentsList = payments.data?.payments || [];
      const paymentStats = payments.data?.stats || null;

      setStats({
        totalUsers: usersList.length,
        totalServices: servicesList.length,
        totalBookings: bookingsList.length,
        totalReviews: reviewsList.length,
        totalMessages: contactsList.length,
        totalPayments: paymentsList.length,
      });

      setDashboardData({
        users: usersList,
        services: servicesList,
        bookings: bookingsList,
        reviews: reviewsList,
        contacts: contactsList,
        payments: paymentsList,
        paymentStats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`stat-card stat-card-${color}`} style={{ borderLeftColor: color }}>
      <div className="stat-header">
        <Icon size={24} color={color} />
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'bookings', label: 'Bookings', icon: BarChart3 },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'contacts', label: 'Messages', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const roleBreakdown = dashboardData.users.reduce(
    (accumulator, user) => {
      const role = user.role || 'unknown';
      accumulator[role] = (accumulator[role] || 0) + 1;
      return accumulator;
    },
    { seeker: 0, helper: 0, admin: 0 }
  );

  const bookingBreakdown = dashboardData.bookings.reduce(
    (accumulator, booking) => {
      const status = (booking.status || 'pending').toLowerCase();
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    },
    { pending: 0, completed: 0, cancelled: 0, rejected: 0 }
  );

  const avgRating = dashboardData.reviews.length
    ? (
        dashboardData.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        dashboardData.reviews.length
      ).toFixed(1)
    : '0.0';

  const totalBookingRevenue = dashboardData.bookings.reduce(
    (sum, booking) => sum + (booking.totalPrice || booking.totalAmount || 0),
    0
  );

  const recentUsers = [...dashboardData.users]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const recentBookings = [...dashboardData.bookings]
    .sort((a, b) => new Date(b.scheduledDate || b.createdAt || 0) - new Date(a.scheduledDate || a.createdAt || 0))
    .slice(0, 5);
  const recentMessages = [...dashboardData.contacts]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const topServices = [...dashboardData.services]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
  const recentPayments = [...dashboardData.payments]
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    .slice(0, 5);

  const sectionCardStyle = {
    background: isDark ? '#0a0a0a' : '#fff',
    border: `1px solid ${isDark ? '#222' : '#e5e5e5'}`,
    borderRadius: 12,
    padding: 20,
  };

  return (
    <div className={`admin-dashboard ${isDark ? 'dark' : 'light'}`}>
      <style>{`
        .admin-dashboard {
          font-family: 'DM Sans', 'Syne', sans-serif;
          display: flex;
          height: 100vh;
          background: ${isDark ? '#000' : '#f9f9f9'};
          color: ${isDark ? '#fff' : '#000'};
        }

        .admin-sidebar {
          width: 280px;
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border-right: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          padding: 20px;
          overflow-y: auto;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 10;
        }

        .admin-sidebar.collapsed {
          width: 0;
          padding: 0;
          border: none;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid ${isDark ? '#222' : '#e5e5e5'};
        }

        .admin-logo {
          font-size: 20px;
          font-weight: 700;
          color: #22c55e;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: ${isDark ? '#fff' : '#000'};
          cursor: pointer;
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 999;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          color: ${isDark ? '#aaa' : '#666'};
          transition: all 0.3s ease;
          border: 1px solid transparent;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-item:hover {
          background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
          color: #22c55e;
        }

        .nav-item.active {
          background: ${isDark ? '#1a1a1a' : '#f0f0f0'};
          color: #22c55e;
          border-color: #22c55e;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-topbar {
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border-bottom: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          padding: 16px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .topbar-title {
          font-size: 24px;
          font-weight: 700;
        }

        .topbar-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .theme-toggle {
          background: ${isDark ? '#1a1a1a' : '#f0f0f0'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          color: ${isDark ? '#fff' : '#000'};
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: opacity 0.3s ease;
        }

        .logout-btn:hover {
          opacity: 0.9;
        }

        .admin-content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-label {
          font-size: 14px;
          color: ${isDark ? '#aaa' : '#666'};
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #22c55e;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${isDark ? '#0a0a0a' : '#f1f1f1'};
        }

        ::-webkit-scrollbar-thumb {
          background: ${isDark ? '#333' : '#ccc'};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #22c55e;
        }
      `}</style>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="admin-header">
          <div className="admin-logo">ADMIN</div>
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(false)}
            style={{ display: sidebarOpen ? 'block' : 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(item.id);
              setSidebarOpen(false);
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: !sidebarOpen ? 'block' : 'none' }}
            >
              <Menu size={24} />
            </button>
            <div className="topbar-title">
              {navItems.find(n => n.id === activeSection)?.label}
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {activeSection === 'overview' && (
            <div>
              <div className="overview-grid">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#3b82f6" />
                <StatCard icon={Briefcase} label="Total Services" value={stats.totalServices} color="#8b5cf6" />
                <StatCard icon={BarChart3} label="Total Bookings" value={stats.totalBookings} color="#ec4899" />
                <StatCard icon={Star} label="Total Reviews" value={stats.totalReviews} color="#f59e0b" />
                <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} color="#06b6d4" />
                <StatCard icon={CreditCard} label="Payment Tx" value={stats.totalPayments} color="#14b8a6" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>User Breakdown</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { label: 'Seekers', value: roleBreakdown.seeker || 0, color: '#3b82f6' },
                      { label: 'Helpers', value: roleBreakdown.helper || 0, color: '#22c55e' },
                      { label: 'Admins', value: roleBreakdown.admin || 0, color: '#ef4444' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: isDark ? '#aaa' : '#666' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Booking Status</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { label: 'Pending', value: bookingBreakdown.pending || 0, color: '#f59e0b' },
                      { label: 'Completed', value: bookingBreakdown.completed || 0, color: '#22c55e' },
                      { label: 'Cancelled', value: bookingBreakdown.cancelled || 0, color: '#ef4444' },
                      { label: 'Rejected', value: bookingBreakdown.rejected || 0, color: '#f43f5e' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: isDark ? '#aaa' : '#666' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Platform Health</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: isDark ? '#aaa' : '#666' }}>Average review rating</span>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>★ {avgRating}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: isDark ? '#aaa' : '#666' }}>Booking revenue</span>
                      <span style={{ fontWeight: 700, color: '#22c55e' }}>Rs. {totalBookingRevenue.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: isDark ? '#aaa' : '#666' }}>Service listings</span>
                      <span style={{ fontWeight: 700 }}>{stats.totalServices}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: isDark ? '#aaa' : '#666' }}>Payment volume</span>
                      <span style={{ fontWeight: 700, color: '#14b8a6' }}>Rs. {dashboardData.paymentStats?.totalAmount?.toLocaleString?.() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div style={sectionCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Recent Users</div>
                    <span style={{ color: isDark ? '#888' : '#777', fontSize: 13 }}>{dashboardData.users.length} total</span>
                  </div>
                  {recentUsers.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No users found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {recentUsers.map((user) => (
                        <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{user.name || 'N/A'}</div>
                            <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13 }}>{user.email}</div>
                            <div style={{ color: isDark ? '#888' : '#777', fontSize: 12, marginTop: 3 }}>
                              {user.phoneNumber || 'No phone'} • {user.location || 'No location'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ textTransform: 'capitalize', color: '#22c55e', fontWeight: 700 }}>{user.role}</div>
                            <div style={{ color: user.profileCompleteness >= 70 ? '#22c55e' : '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                              {user.profileCompleteness || 0}% profile
                            </div>
                            <div style={{ color: isDark ? '#888' : '#777', fontSize: 12 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Top Rated Services</div>
                    <span style={{ color: isDark ? '#888' : '#777', fontSize: 13 }}>Top 5</span>
                  </div>
                  {topServices.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No services found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {topServices.map((service) => (
                        <div key={service._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{service.title || 'Untitled service'}</div>
                            <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13 }}>{service.provider?.name || 'Unknown provider'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#f59e0b', fontWeight: 700 }}>★ {service.rating?.toFixed?.(1) || '0.0'}</div>
                            <div style={{ color: isDark ? '#888' : '#777', fontSize: 12 }}>{service.category?.name || service.category || 'Uncategorized'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Bookings</div>
                  {recentBookings.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No bookings found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {recentBookings.map((booking) => (
                        <div key={booking._id} style={{ paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <strong>{booking.service?.name || booking.service?.title || 'N/A'}</strong>
                            <span
                              style={{
                                textTransform: 'capitalize',
                                color:
                                  booking.status === 'completed'
                                    ? '#22c55e'
                                    : ['cancelled', 'rejected'].includes(booking.status)
                                      ? '#ef4444'
                                      : '#f59e0b',
                              }}
                            >
                              {booking.status || 'pending'}
                            </span>
                          </div>
                          <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13, marginTop: 4 }}>
                            Customer: {booking.seeker?.name || booking.customer?.name || 'N/A'}
                          </div>
                          <div style={{ color: isDark ? '#888' : '#777', fontSize: 12, marginTop: 4 }}>
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleString() : 'No date'} • Rs. {booking.totalPrice || booking.totalAmount || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Messages</div>
                  {recentMessages.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No messages found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {recentMessages.map((message) => (
                        <div key={message._id} style={{ paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <strong>{message.name || 'Anonymous'}</strong>
                            <span style={{ color: isDark ? '#888' : '#777', fontSize: 12 }}>{message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13, marginTop: 4 }}>{message.email || 'No email'}</div>
                          <div style={{ color: isDark ? '#ccc' : '#333', fontSize: 13, marginTop: 8 }}>
                            {(message.message || '').slice(0, 120)}{(message.message || '').length > 120 ? '...' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Reviews</div>
                  {dashboardData.reviews.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No reviews found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {dashboardData.reviews.slice(0, 5).map((review) => (
                        <div key={review._id} style={{ paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <strong>{review.reviewer?.name || 'Anonymous'}</strong>
                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {review.rating || 0}</span>
                          </div>
                          <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13, marginTop: 4 }}>{review.service?.name || review.service?.title || 'Unknown service'}</div>
                          <div style={{ color: isDark ? '#ccc' : '#333', fontSize: 13, marginTop: 8 }}>
                            {review.comment || 'No comment'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={sectionCardStyle}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Payments</div>
                  {recentPayments.length === 0 ? (
                    <div style={{ color: isDark ? '#888' : '#777' }}>No payment records found.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {recentPayments.map((payment, index) => (
                        <div key={`${payment.bookingId || 'payment'}-${index}`} style={{ paddingBottom: 12, borderBottom: `1px solid ${isDark ? '#1d1d1d' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <strong>{payment.bookingId || 'N/A'}</strong>
                            <span style={{ textTransform: 'capitalize', color: payment.status === 'success' ? '#22c55e' : payment.status === 'failed' ? '#ef4444' : '#f59e0b' }}>{payment.status || 'pending'}</span>
                          </div>
                          <div style={{ color: isDark ? '#aaa' : '#666', fontSize: 13, marginTop: 4 }}>
                            {payment.method || 'unknown'} • {payment.currency || 'NPR'}
                          </div>
                          <div style={{ color: isDark ? '#888' : '#777', fontSize: 12, marginTop: 4 }}>
                            {payment.timestamp ? new Date(payment.timestamp).toLocaleString() : 'No date'} • Rs. {payment.amount || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && <AdminUsers isDark={isDark} />}
          {activeSection === 'services' && <AdminServices isDark={isDark} />}
          {activeSection === 'bookings' && <AdminBookings isDark={isDark} />}
          {activeSection === 'reviews' && <AdminReviews isDark={isDark} />}
          {activeSection === 'contacts' && <AdminContacts isDark={isDark} />}
          {activeSection === 'payments' && <AdminPaymentLogger isDark={isDark} />}
        </div>
      </div>
    </div>
  );
}

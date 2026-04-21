import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminBookings({ isDark }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data?.data?.bookings || response.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.seeker?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'rejected':
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <style>{`
        .bookings-container {
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          border-radius: 12px;
          padding: 20px;
        }

        .search-box {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid ${isDark ? '#333' : '#e0e0e0'};
          border-radius: 8px;
          background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
          color: ${isDark ? '#fff' : '#000'};
          font-size: 14px;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
          border-bottom: 1px solid ${isDark ? '#333' : '#e5e5e5'};
        }

        .table-header th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          color: ${isDark ? '#aaa' : '#666'};
          text-transform: uppercase;
        }

        .table-row td {
          padding: 12px;
          border-bottom: 1px solid ${isDark ? '#222' : '#f0f0f0'};
          font-size: 14px;
        }

        .table-row:hover {
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .delete-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          background: #ef4444;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          transition: opacity 0.3s;
        }

        .delete-btn:hover {
          opacity: 0.8;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-completed {
          background: #22c55e;
          color: #fff;
        }

        .status-pending {
          background: #f59e0b;
          color: #fff;
        }

        .status-cancelled {
          background: #ef4444;
          color: #fff;
        }

        .status-rejected {
          background: #f43f5e;
          color: #fff;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .page-btn {
          padding: 8px 12px;
          border: 1px solid ${isDark ? '#333' : '#e0e0e0'};
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
          color: ${isDark ? '#fff' : '#000'};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .page-btn.active {
          background: #22c55e;
          color: #000;
          border-color: #22c55e;
        }

        .page-btn:hover {
          border-color: #22c55e;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: ${isDark ? '#aaa' : '#666'};
        }
      `}</style>

      <div className="bookings-container">
        <div className="search-box">
          <Search size={20} style={{ color: isDark ? '#aaa' : '#666', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Search by service or customer..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : paginatedBookings.length === 0 ? (
          <div className="loading">No bookings found</div>
        ) : (
          <>
            <table className="bookings-table">
              <thead className="table-header">
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map(booking => (
                  <tr key={booking._id} className="table-row">
                    <td>{booking.service?.name || booking.service?.title || 'N/A'}</td>
                    <td>{booking.seeker?.name || booking.customer?.name || 'N/A'}</td>
                    <td>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}</td>
                    <td>Rs. {booking.totalPrice || booking.totalAmount || 0}</td>
                    <td>
                      <span className={`status-badge status-${booking.status?.toLowerCase() || 'pending'}`}>
                        {getStatusIcon(booking.status?.toLowerCase())}
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="delete-btn"
                          onClick={() => deleteBooking(booking._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

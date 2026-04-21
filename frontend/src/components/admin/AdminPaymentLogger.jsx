import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

export default function AdminPaymentLogger({ isDark }) {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/logs/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPayments(response.data?.payments || []);
      setStats(response.data?.stats || null);
    } catch (error) {
      console.error('Error fetching payment logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  );

  const downloadCSV = () => {
    const headers = ['Booking ID', 'Amount', 'Currency', 'Method', 'Status', 'Date'];
    const rows = filteredPayments.map(p => [
      p.bookingId,
      p.amount,
      p.currency,
      p.method,
      p.status,
      new Date(p.timestamp).toLocaleDateString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => csv += row.join(',') + '\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
    element.click();
  };

  return (
    <div>
      <style>{`
        .payment-logger {
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          border-radius: 12px;
          padding: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-item {
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
          border: 1px solid ${isDark ? '#333' : '#e5e5e5'};
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }

        .stat-label {
          color: ${isDark ? '#aaa' : '#666'};
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #22c55e;
        }

        .controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid ${isDark ? '#333' : '#e0e0e0'};
          border-radius: 6px;
          background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
          color: ${isDark ? '#fff' : '#000'};
          cursor: pointer;
        }

        .download-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: opacity 0.3s;
        }

        .download-btn:hover {
          opacity: 0.8;
        }

        .payment-table {
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

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-success {
          background: #22c55e;
          color: #fff;
        }

        .status-failed {
          background: #ef4444;
          color: #fff;
        }

        .status-pending {
          background: #f59e0b;
          color: #fff;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: ${isDark ? '#aaa' : '#666'};
        }
      `}</style>

      <div className="payment-logger">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>Payment Logger</h2>
          <p style={{ color: isDark ? '#aaa' : '#666', fontSize: 14, margin: 0 }}>Track all payment transactions</p>
        </div>

        {loading ? (
          <div className="loading">Loading payment logs...</div>
        ) : (
          <>
            {stats && (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Transactions</div>
                  <div className="stat-value">{stats.totalTransactions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Successful</div>
                  <div className="stat-value" style={{ color: '#22c55e' }}>{stats.successfulTransactions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Failed</div>
                  <div className="stat-value" style={{ color: '#ef4444' }}>{stats.failedTransactions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Amount</div>
                  <div className="stat-value">Rs. {stats.totalAmount?.toLocaleString()}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Average Amount</div>
                  <div className="stat-value">Rs. {stats.averageAmount?.toFixed(0)}</div>
                </div>
              </div>
            )}

            <div className="controls">
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <button className="download-btn" onClick={downloadCSV}>
                <Download size={16} />
                Download CSV
              </button>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="loading">No payment records found</div>
            ) : (
              <table className="payment-table">
                <thead className="table-header">
                  <tr>
                    <th>Booking ID</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    <tr key={index} className="table-row">
                      <td>{payment.bookingId}</td>
                      <td>Rs. {payment.amount?.toLocaleString()}</td>
                      <td>{payment.currency}</td>
                      <td>
                        <span style={{
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {payment.method}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${payment.status}`}>
                          {payment.status === 'success' && '✓'}
                          {payment.status === 'failed' && '✗'}
                          {payment.status === 'pending' && '⏳'}
                          {' ' + (payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1))}
                        </span>
                      </td>
                      <td>{new Date(payment.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

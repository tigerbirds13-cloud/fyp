import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, ChevronLeft, ChevronRight, Mail, User } from 'lucide-react';

export default function AdminContacts({ isDark }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data?.data?.contacts || response.data?.data?.messages || response.data?.contacts || response.data?.messages || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/contacts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.message?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  return (
    <div>
      <style>{`
        .contacts-container {
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

        .message-card {
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
          border: 1px solid ${isDark ? '#333' : '#e5e5e5'};
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .message-card:hover {
          border-color: #22c55e;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .message-sender {
          flex: 1;
        }

        .sender-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #22c55e;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .sender-email {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${isDark ? '#aaa' : '#666'};
          font-size: 13px;
          margin-bottom: 4px;
        }

        .sent-date {
          color: ${isDark ? '#888' : '#999'};
          font-size: 12px;
        }

        .message-content {
          color: ${isDark ? '#ccc' : '#333'};
          font-size: 14px;
          line-height: 1.6;
          padding: 12px;
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border-radius: 6px;
          border-left: 3px solid #22c55e;
          margin-bottom: 12px;
          max-height: 120px;
          overflow-y: auto;
        }

        .message-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .delete-btn {
          padding: 6px 12px;
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

      <div className="contacts-container">
        <div className="search-box">
          <Search size={20} style={{ color: isDark ? '#aaa' : '#666', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : paginatedContacts.length === 0 ? (
          <div className="loading">No messages found</div>
        ) : (
          <>
            {paginatedContacts.map(contact => (
              <div key={contact._id} className="message-card">
                <div className="message-header">
                  <div className="message-sender">
                    <div className="sender-name">
                      <User size={16} />
                      {contact.name || 'N/A'}
                    </div>
                    <div className="sender-email">
                      <Mail size={14} />
                      {contact.email}
                    </div>
                    <div className="sent-date">
                      {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                      {new Date(contact.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteContact(contact._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {contact.message && (
                  <div className="message-content">
                    {contact.message}
                  </div>
                )}
              </div>
            ))}

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

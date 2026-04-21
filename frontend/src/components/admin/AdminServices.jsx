import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Search, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

export default function AdminServices({ isDark }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewService, setViewService] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    duration: '',
    isReported: false,
  });
  const [savingId, setSavingId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data?.data?.services || response.data?.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data?.data?.categories || response.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openServiceDetails = async (service) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/services/${service._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const detailService = response.data?.data?.service || service;
      setViewService(detailService);
    } catch (error) {
      console.error('Error fetching service details:', error);
      setViewService(service);
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price ?? '',
      category: service.category?._id || service.category || '',
      location: service.location || '',
      duration: service.duration || '',
      isReported: Boolean(service.isReported),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      category: '',
      location: '',
      duration: '',
      isReported: false,
    });
  };

  const saveEdit = async (id) => {
    try {
      setSavingId(id);
      const token = localStorage.getItem('token');

      const payload = {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price) || 0,
        category: editForm.category,
        location: editForm.location,
        duration: editForm.duration,
        isReported: editForm.isReported,
      };

      const response = await axios.patch(`/api/admin/services/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedService = response.data?.data?.service;
      if (updatedService) {
        setServices((prev) => prev.map((service) => (service._id === id ? updatedService : service)));
      } else {
        fetchServices();
      }

      cancelEdit();
    } catch (error) {
      console.error('Error updating service:', error);
      window.alert(error.response?.data?.message || 'Failed to update service');
    } finally {
      setSavingId(null);
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const filteredServices = services.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.provider?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <div>
      <style>{`
        .services-container {
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

        .services-table {
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

        .action-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          transition: opacity 0.3s;
        }

        .view-btn {
          background: #8b5cf6;
          color: white;
        }

        .edit-btn {
          background: #3b82f6;
          color: white;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
        }

        .action-btn:hover {
          opacity: 0.8;
        }

        .action-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .save-btn {
          background: #22c55e;
          color: #06280f;
          font-weight: 700;
        }

        .cancel-btn {
          background: ${isDark ? '#374151' : '#e5e7eb'};
          color: ${isDark ? '#fff' : '#111'};
        }

        .edit-input,
        .edit-select,
        .edit-textarea {
          width: 100%;
          background: ${isDark ? '#111827' : '#fff'};
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'};
          color: ${isDark ? '#fff' : '#111'};
          border-radius: 6px;
          padding: 7px 8px;
          font-size: 13px;
        }

        .edit-textarea {
          min-height: 70px;
          resize: vertical;
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

        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .service-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .service-modal {
          width: min(680px, 100%);
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          border-radius: 12px;
          padding: 20px;
        }

        .service-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .service-modal-title {
          font-size: 18px;
          font-weight: 700;
        }

        .service-close-btn {
          border: none;
          background: transparent;
          color: ${isDark ? '#fff' : '#111'};
          cursor: pointer;
          display: inline-flex;
        }

        .service-modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .service-modal-item {
          border: 1px solid ${isDark ? '#222' : '#ececec'};
          border-radius: 8px;
          padding: 10px;
        }

        .service-modal-label {
          font-size: 12px;
          color: ${isDark ? '#a1a1aa' : '#666'};
          margin-bottom: 4px;
        }

        .service-modal-value {
          font-size: 14px;
          font-weight: 600;
          color: ${isDark ? '#fff' : '#111'};
          word-break: break-word;
        }

        .service-description {
          border: 1px solid ${isDark ? '#222' : '#ececec'};
          border-radius: 8px;
          padding: 10px;
          margin-top: 8px;
          line-height: 1.5;
          color: ${isDark ? '#e5e5e5' : '#222'};
        }
      `}</style>

      <div className="services-container">
        <div className="search-box">
          <Search size={20} style={{ color: isDark ? '#aaa' : '#666', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Search by service name or category..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading services...</div>
        ) : paginatedServices.length === 0 ? (
          <div className="loading">No services found</div>
        ) : (
          <>
            <table className="services-table">
              <thead className="table-header">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Provider</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map(service => (
                  <tr key={service._id} className="table-row">
                    <td>{service.name || 'N/A'}</td>
                    <td>
                      {editingId === service._id ? (
                        <select
                          className="edit-select"
                          value={editForm.category}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{
                          background: '#1a1a1a',
                          color: '#22c55e',
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: 12
                        }}>
                          {service.category?.name || 'Uncategorized'}
                        </span>
                      )}
                    </td>
                    <td>{service.provider?.name || 'N/A'}</td>
                    <td>
                      {editingId === service._id ? (
                        <input
                          type="number"
                          min="0"
                          className="edit-input"
                          value={editForm.price}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                        />
                      ) : `Rs. ${service.price || 0}`}
                    </td>
                    <td>
                      <span className="rating-badge">
                        ⭐ {service.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openServiceDetails(service)}
                          disabled={editingId === service._id}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {editingId === service._id ? (
                          <>
                            <button
                              className="action-btn save-btn"
                              onClick={() => saveEdit(service._id)}
                              disabled={savingId === service._id}
                              title="Save service"
                            >
                              {savingId === service._id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              className="action-btn cancel-btn"
                              onClick={cancelEdit}
                              disabled={savingId === service._id}
                              title="Cancel edit"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="action-btn edit-btn"
                            onClick={() => startEdit(service)}
                            title="Edit service"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteService(service._id)}
                          disabled={savingId === service._id}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingId && (
              <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }}>
                  Editing service details
                </div>
                <input
                  className="edit-input"
                  placeholder="Service title"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <textarea
                  className="edit-textarea"
                  placeholder="Service description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <input
                    className="edit-input"
                    placeholder="Location"
                    value={editForm.location}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                  <input
                    className="edit-input"
                    placeholder="Duration"
                    value={editForm.duration}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: isDark ? '#ddd' : '#333' }}>
                  <input
                    type="checkbox"
                    checked={editForm.isReported}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isReported: e.target.checked }))}
                  />
                  Mark as reported
                </label>
              </div>
            )}

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

      {viewService && (
        <div className="service-modal-overlay" onClick={() => setViewService(null)}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="service-modal-header">
              <div className="service-modal-title">Service Details</div>
              <button className="service-close-btn" onClick={() => setViewService(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="service-modal-grid">
              <div className="service-modal-item">
                <div className="service-modal-label">Title</div>
                <div className="service-modal-value">{viewService.name || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Category</div>
                <div className="service-modal-value">{viewService.category?.name || 'Uncategorized'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Provider</div>
                <div className="service-modal-value">{viewService.provider?.name || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Provider Email</div>
                <div className="service-modal-value">{viewService.provider?.email || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Price</div>
                <div className="service-modal-value">Rs. {viewService.price || 0}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Rating</div>
                <div className="service-modal-value">{viewService.rating?.toFixed?.(1) || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Duration</div>
                <div className="service-modal-value">{viewService.duration || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Location</div>
                <div className="service-modal-value">{viewService.location || 'N/A'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Reported</div>
                <div className="service-modal-value">{viewService.isReported ? 'Yes' : 'No'}</div>
              </div>
              <div className="service-modal-item">
                <div className="service-modal-label">Created</div>
                <div className="service-modal-value">{viewService.createdAt ? new Date(viewService.createdAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

            <div className="service-modal-label">Description</div>
            <div className="service-description">{viewService.description || 'No description provided.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

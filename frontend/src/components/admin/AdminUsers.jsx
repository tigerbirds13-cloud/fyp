import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsers({ isDark }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'seeker', phoneNumber: '', location: '' });
  const [savingId, setSavingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data?.data?.users || response.data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'seeker',
      phoneNumber: user.phoneNumber || '',
      location: user.location || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '', role: 'seeker', phoneNumber: '', location: '' });
  };

  const saveEdit = async (id) => {
    try {
      setSavingId(id);
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/admin/users/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) {
        setUsers((prev) => prev.map((user) => (user._id === id ? updatedUser : user)));
      } else {
        fetchUsers();
      }
      cancelEdit();
    } catch (error) {
      console.error('Error updating user:', error);
      window.alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      setStatusUpdatingId(user._id);
      const token = localStorage.getItem('token');
      const endpoint = user.isDisabled ? 'enable' : 'disable';
      const response = await axios.patch(`/api/admin/users/${user._id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) {
        setUsers((prev) => prev.map((item) => (item._id === user._id ? updatedUser : item)));
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      window.alert(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.toLowerCase?.().includes(search.toLowerCase()) ||
    u.location?.toLowerCase?.().includes(search.toLowerCase()) ||
    u.role?.toLowerCase?.().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div>
      <style>{`
        .users-container {
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border: 1px solid ${isDark ? '#222' : '#e5e5e5'};
          border-radius: 12px;
          padding: 20px;
          overflow-x: auto;
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

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
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

        .save-btn {
          background: #22c55e;
          color: #06280f;
          font-weight: 700;
        }

        .cancel-btn {
          background: ${isDark ? '#374151' : '#e5e7eb'};
          color: ${isDark ? '#fff' : '#111'};
        }

        .status-btn {
          border: none;
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .status-btn.active {
          background: #22c55e;
          color: #fff;
        }

        .status-btn.inactive {
          background: #9ca3af;
          color: #fff;
        }

        .edit-input,
        .edit-select {
          width: 100%;
          background: ${isDark ? '#111827' : '#fff'};
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'};
          color: ${isDark ? '#fff' : '#111'};
          border-radius: 6px;
          padding: 7px 8px;
          font-size: 13px;
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

      <div className="users-container">
        <div className="search-box">
          <Search size={20} style={{ color: isDark ? '#aaa' : '#666', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone, location, role..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="loading">No users found</div>
        ) : (
          <>
            <table className="users-table">
              <thead className="table-header">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Profile</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user._id} className="table-row">
                    <td>
                      {editingId === user._id ? (
                        <input
                          className="edit-input"
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (user.name || 'N/A')}
                    </td>
                    <td>
                      {editingId === user._id ? (
                        <input
                          className="edit-input"
                          value={editForm.email}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      ) : user.email}
                    </td>
                    <td>
                      {editingId === user._id ? (
                        <input
                          className="edit-input"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="Phone"
                        />
                      ) : (
                        user.phoneNumber || 'N/A'
                      )}
                    </td>
                    <td>
                      {editingId === user._id ? (
                        <input
                          className="edit-input"
                          value={editForm.location}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="Location"
                        />
                      ) : (
                        user.location || 'N/A'
                      )}
                    </td>
                    <td>
                      {editingId === user._id ? (
                        <select
                          className="edit-select"
                          value={editForm.role}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                        >
                          <option value="seeker">seeker</option>
                          <option value="helper">helper</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span style={{
                          background: user.role === 'admin' ? '#ef4444' : '#3b82f6',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <span style={{ color: user.profileCompleteness >= 70 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                          {user.profileCompleteness || 0}% complete
                        </span>
                        <span style={{ color: isDark ? '#999' : '#666', fontSize: 12 }}>
                          {user.roleTitle || 'No role title'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'grid', gap: 3, fontSize: 12, color: isDark ? '#aaa' : '#666' }}>
                        <span>Services: {user.stats?.services || 0}</span>
                        <span>Seeker bookings: {user.stats?.seekerBookings || 0}</span>
                        <span>Helper bookings: {user.stats?.helperBookings || 0}</span>
                        <span>Reviews: {user.stats?.reviews || 0}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`status-btn ${!user.isDisabled ? 'active' : 'inactive'}`}
                        onClick={() => toggleUserActive(user)}
                        disabled={statusUpdatingId === user._id}
                        title="Toggle active status"
                      >
                        {statusUpdatingId === user._id ? 'Updating...' : (!user.isDisabled ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {editingId === user._id ? (
                          <>
                            <button
                              className="action-btn save-btn"
                              onClick={() => saveEdit(user._id)}
                              disabled={savingId === user._id}
                            >
                              {savingId === user._id ? 'Saving...' : 'Save'}
                            </button>
                            <button className="action-btn cancel-btn" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button className="action-btn edit-btn" onClick={() => startEdit(user)}>
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteUser(user._id)}
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

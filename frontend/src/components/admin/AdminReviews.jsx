import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminReviews({ isDark }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data?.data?.reviews || response.data?.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.reviewer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  return (
    <div>
      <style>{`
        .reviews-container {
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

        .review-card {
          background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
          border: 1px solid ${isDark ? '#333' : '#e5e5e5'};
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .review-card:hover {
          border-color: #22c55e;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .review-meta {
          flex: 1;
        }

        .review-user {
          font-weight: 600;
          color: #22c55e;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .review-service {
          color: ${isDark ? '#aaa' : '#666'};
          font-size: 13px;
          margin-bottom: 4px;
        }

        .review-rating {
          display: flex;
          gap: 2px;
          font-size: 16px;
        }

        .review-date {
          color: ${isDark ? '#888' : '#999'};
          font-size: 12px;
        }

        .review-comment {
          color: ${isDark ? '#ccc' : '#333'};
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
          padding: 12px;
          background: ${isDark ? '#0a0a0a' : '#fff'};
          border-radius: 6px;
          border-left: 3px solid #22c55e;
        }

        .review-actions {
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

      <div className="reviews-container">
        <div className="search-box">
          <Search size={20} style={{ color: isDark ? '#aaa' : '#666', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Search by service, reviewer, or comment..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : paginatedReviews.length === 0 ? (
          <div className="loading">No reviews found</div>
        ) : (
          <>
            {paginatedReviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="review-meta">
                    <div className="review-user">
                      {review.reviewer?.name || 'Anonymous'}
                    </div>
                    <div className="review-service">
                      Service: {review.service?.name || review.service?.title || 'N/A'}
                    </div>
                    <div className="review-rating">
                      {Array(5).fill().map((_, i) => (
                        <span key={i}>
                          {i < review.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteReview(review._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {review.comment && (
                  <div className="review-comment">
                    "{review.comment}"
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

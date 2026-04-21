import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobPostingForm({ isDark, onClose, showToast }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    workType: 'On-site',
    jobType: 'Full-time',
    pay: '',
    requirements: [''],
    benefits: [''],
    tags: [''],
    urgent: false,
    applicationDeadline: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty array items
      const cleanData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        applicationDeadline: formData.applicationDeadline || null
      };

      const token = localStorage.getItem('token');
      await axios.post('/api/jobs', cleanData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast('Job posted successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error posting job:', error);
      showToast(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const subColor = isDark ? "#9ca3af" : "#64748b";
  const inputBg = isDark ? "#1a1a1a" : "#f9fafb";
  const inputBorder = isDark ? "#374151" : "#d1d5db";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
      <div className="modal-anim" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 20, padding: "32px 28px", width: 700, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", position: "relative", boxShadow: isDark ? "none" : "0 20px 40px rgba(0,0,0,0.1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #22c55e", background: "transparent", color: "#22c55e", cursor: "pointer", fontSize: 16 }}>✕</button>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: titleColor, fontFamily: "Syne", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>Post a New Job</h2>
          <p style={{ color: subColor, fontFamily: "DM Sans", fontSize: 14, margin: 0 }}>Find the right talent for your local business</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
          {/* Basic Information */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., House Cleaner"
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the job responsibilities, requirements, and what you're looking for..."
              rows={4}
              style={{
                width: "100%",
                background: inputBg,
                color: textColor,
                border: `1px solid ${inputBorder}`,
                borderRadius: 8,
                padding: "12px 16px",
                fontFamily: "DM Sans",
                fontSize: 14,
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          {/* Job Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Pokhara"
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Work Type</label>
              <select
                name="workType"
                value={formData.workType}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Job Type</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Pay *</label>
              <input
                type="text"
                name="pay"
                value={formData.pay}
                onChange={handleInputChange}
                required
                placeholder="e.g., NPR 800 / per visit"
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Requirements</label>
            {formData.requirements.map((req, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  placeholder="e.g., Experience in cleaning services"
                  style={{
                    flex: 1,
                    background: inputBg,
                    color: textColor,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "DM Sans",
                    fontSize: 14,
                    outline: "none"
                  }}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              style={{
                background: "transparent",
                color: "#22c55e",
                border: "1px solid #22c55e",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "DM Sans",
                fontSize: 12
              }}
            >
              + Add Requirement
            </button>
          </div>

          {/* Benefits */}
          <div>
            <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Benefits</label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                  placeholder="e.g., Flexible hours"
                  style={{
                    flex: 1,
                    background: inputBg,
                    color: textColor,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "DM Sans",
                    fontSize: 14,
                    outline: "none"
                  }}
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('benefits', index)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('benefits')}
              style={{
                background: "transparent",
                color: "#22c55e",
                border: "1px solid #22c55e",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "DM Sans",
                fontSize: 12
              }}
            >
              + Add Benefit
            </button>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Tags</label>
            {formData.tags.map((tag, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder="e.g., cleaning"
                  style={{
                    flex: 1,
                    background: inputBg,
                    color: textColor,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "DM Sans",
                    fontSize: 14,
                    outline: "none"
                  }}
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              style={{
                background: "transparent",
                color: "#22c55e",
                border: "1px solid #22c55e",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "DM Sans",
                fontSize: 12
              }}
            >
              + Add Tag
            </button>
          </div>

          {/* Additional Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
              <input
                type="checkbox"
                id="urgent"
                name="urgent"
                checked={formData.urgent}
                onChange={handleInputChange}
                style={{ marginRight: 8 }}
              />
              <label htmlFor="urgent" style={{ color: textColor, fontFamily: "DM Sans", fontSize: 14, cursor: "pointer" }}>
                Mark as urgent job
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="contact@company.com"
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: textColor, fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="+977-1234567890"
                style={{
                  width: "100%",
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, background: "transparent", color: subColor, border: `1px solid ${inputBorder}`, borderRadius: 10, padding: "14px 0", fontFamily: "Syne", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? "#6b7280" : "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 0",
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
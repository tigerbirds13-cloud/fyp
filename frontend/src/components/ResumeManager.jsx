import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ResumeManager.css";

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    file: null,
  });

  const apiURL = process.env.REACT_APP_API_URL || "http://localhost:5002/api";

  // Fetch resumes
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiURL}/resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data.data.resumes);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Only PDF and Word documents are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setUploadData({ ...uploadData, file });
      setError("");
    }
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.title.trim() || !uploadData.file) {
      setError("Please provide a title and select a file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("resume", uploadData.file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${apiURL}/resumes/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Resume uploaded successfully");
      setUploadData({ title: "", file: null });
      setShowUploadForm(false);
      fetchResumes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  // Set primary resume
  const setPrimaryResume = async (resumeId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${apiURL}/resumes/${resumeId}/set-primary`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSuccess("Primary resume updated");
      fetchResumes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set primary resume");
    } finally {
      setLoading(false);
    }
  };

  // Delete resume
  const deleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiURL}/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Resume deleted successfully");
      fetchResumes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };

  // Download resume
  const downloadResume = async (resumeId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiURL}/resumes/${resumeId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      setError("Failed to download resume");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="resume-manager">
      <div className="resume-header">
        <h2>Resume Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? "Cancel" : "+ Upload New Resume"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showUploadForm && (
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Resume Title *</label>
            <input
              type="text"
              id="title"
              placeholder="e.g., Senior Developer 2024"
              value={uploadData.title}
              onChange={(e) =>
                setUploadData({ ...uploadData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Select File (PDF or Word) *</label>
            <input
              type="file"
              id="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
            {uploadData.file && (
              <p className="file-info">
                Selected: {uploadData.file.name} (
                {formatFileSize(uploadData.file.size)})
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      )}

      {loading && !showUploadForm ? (
        <p className="loading">Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <p className="no-resumes">
          No resumes uploaded yet. Upload your first resume to get started!
        </p>
      ) : (
        <div className="resumes-list">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className={`resume-card ${resume.isPrimary ? "primary" : ""}`}
            >
              <div className="resume-info">
                <div className="resume-title">
                  {resume.isPrimary && (
                    <span className="badge-primary">Primary</span>
                  )}
                  <h3>{resume.title}</h3>
                </div>
                <p className="resume-details">
                  <span>{resume.fileName}</span>
                  <span>{formatFileSize(resume.fileSize)}</span>
                  <span>{formatDate(resume.uploadedAt)}</span>
                </p>
              </div>

              <div className="resume-actions">
                <button
                  className="btn-action btn-download"
                  onClick={() => downloadResume(resume._id, resume.fileName)}
                  title="Download"
                >
                  ⬇ Download
                </button>

                {!resume.isPrimary && (
                  <button
                    className="btn-action btn-primary-set"
                    onClick={() => setPrimaryResume(resume._id)}
                    disabled={loading}
                    title="Set as Primary"
                  >
                    ✓ Set Primary
                  </button>
                )}

                <button
                  className="btn-action btn-delete"
                  onClick={() => deleteResume(resume._id)}
                  disabled={loading}
                  title="Delete"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="resume-info-box">
        <h4>Resume Guidelines</h4>
        <ul>
          <li>Upload PDF or Word documents only (.pdf, .doc, .docx)</li>
          <li>Maximum file size: 5MB</li>
          <li>You can upload up to 5 resumes</li>
          <li>Your primary resume will be used for all job applications</li>
          <li>You can change your primary resume anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeManager;

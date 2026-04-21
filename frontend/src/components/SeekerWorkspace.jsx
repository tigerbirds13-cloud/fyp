import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  User,
  X,
} from "lucide-react";

export default function SeekerWorkspace({
  onBack,
  profile,
  loading,
  saving,
  message,
  handleInput,
  saveProfile,
  discardChanges,
  showMessage,
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: "",
    location: profile.location || "",
    notes: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [helperProfile, setHelperProfile] = useState(null);
  const [helperProfileLoading, setHelperProfileLoading] = useState(false);
  const [bookingMessageDrafts, setBookingMessageDrafts] = useState({});
  const [bookingMessageSendingId, setBookingMessageSendingId] = useState("");
  const [bookingConfirmingId, setBookingConfirmingId] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState({});
  const [reviewForm, setReviewForm] = useState({
    bookingId: "",
    rating: "5",
    comment: "",
  });

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    profile.name ||
    "Help Seeker";

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchNotifications();
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const res = await axios.get("/api/services");
      setServices(res.data?.data?.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBookings = res.data?.data?.bookings || [];
      const userId = localStorage.getItem("userId");
      const seekerBookings = userId
        ? allBookings.filter((booking) => {
            const seekerId =
              typeof booking.seeker === "string"
                ? booking.seeker
                : booking.seeker?._id;
            return seekerId === userId;
          })
        : allBookings;
      setBookings(seekerBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/api/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data?.data?.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "/api/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => {
      const categoryName = service.category?.name || "";
      const source = [
        service.name,
        service.description,
        categoryName,
        service.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return source.includes(query);
    });
  }, [services, search]);

  const openBookingModal = (service) => {
    setSelectedService(service);
    setBookingForm({
      scheduledDate: "",
      location: profile.location || service.location || "",
      notes: "",
    });
  };

  const createBooking = async (event) => {
    event.preventDefault();
    if (!selectedService) return;

    if (!bookingForm.scheduledDate || !bookingForm.location) {
      showMessage("Please select date and location for booking.");
      return;
    }

    try {
      setBookingSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/bookings",
        {
          serviceId: selectedService._id,
          scheduledDate: bookingForm.scheduledDate,
          location: bookingForm.location,
          notes: bookingForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSelectedService(null);
      setBookingForm({
        scheduledDate: "",
        location: profile.location || "",
        notes: "",
      });
      showMessage("Booking request sent. Waiting for local helper acceptance.");
      fetchBookings();
      fetchNotifications();
      setActiveTab("bookings");
    } catch (error) {
      console.error("Booking error:", error);
      showMessage(error.response?.data?.message || "Could not create booking.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("Booking cancelled.");
      fetchBookings();
      fetchNotifications();
    } catch (error) {
      console.error("Cancel booking error:", error);
      showMessage(error.response?.data?.message || "Unable to cancel booking.");
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      setBookingConfirmingId(bookingId);
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/bookings/${bookingId}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showMessage("Booking confirmed successfully!");
      fetchBookings();
      fetchNotifications();
    } catch (error) {
      console.error("Confirm booking error:", error);
      showMessage(
        error.response?.data?.message || "Unable to confirm booking.",
      );
    } finally {
      setBookingConfirmingId("");
    }
  };

  const viewAcceptedHelperProfile = async (bookingId) => {
    try {
      setHelperProfileLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/bookings/${bookingId}/helper-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHelperProfile(res.data?.data?.helper || null);
    } catch (error) {
      console.error("Error loading helper profile:", error);
      showMessage(
        error.response?.data?.message ||
          "Helper profile is available after acceptance.",
      );
    } finally {
      setHelperProfileLoading(false);
    }
  };

  const updateBookingMessageDraft = (bookingId, value) => {
    setBookingMessageDrafts((prev) => ({ ...prev, [bookingId]: value }));
  };

  const sendBookingMessage = async (bookingId) => {
    const text = (bookingMessageDrafts[bookingId] || "").trim();
    if (!text) {
      showMessage("Please type a message before sending.");
      return;
    }

    try {
      setBookingMessageSendingId(bookingId);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/bookings/${bookingId}/message`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookingMessageDrafts((prev) => ({ ...prev, [bookingId]: "" }));
      showMessage("Message sent successfully.");
      fetchNotifications();
    } catch (error) {
      console.error("Error sending booking message:", error);
      showMessage(error.response?.data?.message || "Unable to send message.");
    } finally {
      setBookingMessageSendingId("");
    }
  };

  const openReviewModal = (bookingId) => {
    setReviewForm({ bookingId, rating: "5", comment: "" });
  };

  const submitReview = async (event) => {
    event.preventDefault();

    const booking = bookings.find((item) => item._id === reviewForm.bookingId);
    if (!booking) {
      showMessage("Booking not found for review.");
      return;
    }

    const helperId =
      typeof booking.helper === "string" ? booking.helper : booking.helper?._id;
    const serviceId =
      typeof booking.service === "string"
        ? booking.service
        : booking.service?._id;

    if (!helperId || !serviceId || !reviewForm.comment.trim()) {
      showMessage("Please write a review comment before submitting.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/reviews",
        {
          bookingId: reviewForm.bookingId,
          serviceId,
          helperId,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setReviewedBookings((prev) => ({
        ...prev,
        [reviewForm.bookingId]: true,
      }));
      showMessage("Thanks for rating your local helper.");
      setReviewForm({ bookingId: "", rating: "5", comment: "" });
      fetchBookings();
      fetchNotifications();
    } catch (error) {
      console.error("Error submitting review:", error);
      showMessage(error.response?.data?.message || "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070a10",
        color: "#e2e8f0",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        .seeker-wrap { max-width: 1140px; margin: 0 auto; padding: 76px 24px 40px; }
        .seeker-back {
          position: fixed; top: 14px; left: 16px; z-index: 20;
          border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.05);
          color: #f8fafc; border-radius: 999px; padding: 8px 14px;
          display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .seeker-top {
          border-radius: 18px; border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(95deg, rgba(18,24,38,0.98), rgba(20,22,28,0.98));
          padding: 22px 26px; display: flex; justify-content: space-between; gap: 16px; align-items: center;
        }
        .seeker-name { margin: 0; font-family: 'Syne', sans-serif; font-size: clamp(24px, 3vw, 34px); }
        .seeker-meta { margin-top: 6px; color: #9aa6bb; display: flex; gap: 14px; flex-wrap: wrap; font-size: 14px; }
        .seeker-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.3);
          border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 700;
        }
        .seeker-stats { display: grid; grid-template-columns: repeat(3, minmax(84px, 110px)); gap: 10px; }
        .seeker-stats > div {
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); text-align: center; padding: 8px 6px;
        }
        .seeker-stats strong { display: block; font-family: 'Syne', sans-serif; font-size: 22px; }
        .seeker-stats span { font-size: 12px; color: #9aa6bb; }
        .seeker-tabs {
          margin-top: 16px; display: inline-flex; gap: 8px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03); padding: 8px;
        }
        .seeker-tab {
          border: 0; border-radius: 9px; padding: 9px 14px; cursor: pointer;
          color: #a9b5c8; background: transparent; display: inline-flex; gap: 7px; align-items: center;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
        }
        .seeker-tab.active { background: #22c55e; color: #effef5; }
        .seeker-card {
          margin-top: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, rgba(18,22,31,0.98), rgba(14,18,24,0.98));
          padding: 20px;
        }
        .seeker-card h3 { margin: 0 0 12px; font-family: 'Syne', sans-serif; font-size: 18px; }
        .seeker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .seeker-field { display: grid; gap: 6px; margin-bottom: 12px; }
        .seeker-field span { color: #c8d1e0; font-size: 13px; font-weight: 600; }
        .seeker-field input, .seeker-field textarea {
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: #f8fafc; font-size: 14px;
          padding: 11px 12px; outline: none; font-family: 'DM Sans', sans-serif;
        }
        .seeker-field input:focus, .seeker-field textarea:focus {
          border-color: rgba(59,130,246,0.7); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .seeker-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
        .seeker-btn {
          border: 0; border-radius: 10px; padding: 10px 16px; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
        }
        .seeker-btn.primary { background: #22c55e; color: #f0fff7; }
        .seeker-btn.secondary { background: rgba(255,255,255,0.06); color: #d3dbe8; border: 1px solid rgba(255,255,255,0.12); }
        .seeker-services-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 12px; }
        .seeker-search {
          width: 280px; max-width: 100%;
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: #f8fafc; padding: 9px 11px;
        }
        .seeker-services-list { display: grid; gap: 12px; }
        .seeker-service-item {
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 14px; display: flex; justify-content: space-between; gap: 12px; align-items: center;
          background: rgba(255,255,255,0.02);
        }
        .seeker-service-item h4 { margin: 0; font-family: 'Syne', sans-serif; font-size: 16px; }
        .seeker-service-item p { margin: 6px 0 0; color: #95a3ba; font-size: 13px; }
        .seeker-bookings-list { display: grid; gap: 10px; }
        .seeker-booking-item {
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 14px; display: flex; justify-content: space-between; gap: 12px; align-items: center;
          background: rgba(255,255,255,0.02);
        }
        .seeker-booking-meta { color: #93a0b7; font-size: 13px; margin-top: 6px; display: flex; gap: 10px; flex-wrap: wrap; }
        .seeker-notification-list { display: grid; gap: 10px; }
        .seeker-notification-item {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
        }
        .seeker-notification-item.unread {
          border-color: rgba(59,130,246,0.45);
          background: rgba(59,130,246,0.1);
        }
        .helper-profile-box {
          display: grid;
          gap: 8px;
          font-size: 14px;
          color: #c7d2e6;
        }
        .seeker-status {
          border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; text-transform: capitalize;
        }
        .st-pending { background: rgba(245,158,11,0.16); color: #f59e0b; }
        .st-accepted { background: rgba(59,130,246,0.16); color: #60a5fa; }
        .st-confirmed { background: rgba(34,197,94,0.16); color: #22c55e; }
        .st-completed { background: rgba(34,197,94,0.16); color: #22c55e; }
        .st-cancelled { background: rgba(239,68,68,0.16); color: #f87171; }
        .st-rejected { background: rgba(251,113,133,0.18); color: #fb7185; }
        .seeker-modal-wrap {
          position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 90;
          display: flex; align-items: center; justify-content: center; padding: 18px;
        }
        .seeker-modal {
          width: 100%; max-width: 540px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12); background: #121827; padding: 18px;
        }
        .seeker-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .seeker-ghost {
          border: 0; background: transparent; color: #93a0b7; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
        }
        @media (max-width: 900px) {
          .seeker-top { flex-direction: column; align-items: flex-start; }
          .seeker-grid { grid-template-columns: 1fr; }
          .seeker-service-item, .seeker-booking-item { flex-direction: column; align-items: flex-start; }
          .seeker-actions { justify-content: flex-start; }
        }
      `}</style>

      <button className="seeker-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="seeker-wrap">
        <section className="seeker-top">
          <div>
            <h1 className="seeker-name">{displayName}</h1>
            <div className="seeker-meta">
              <span className="seeker-pill">
                <User size={12} /> Help Seeker
              </span>
              <span>
                <MapPin size={14} /> {profile.location || "Add your location"}
              </span>
            </div>
          </div>

          <div className="seeker-stats">
            <div>
              <strong>{bookings.length}</strong>
              <span>Total Bookings</span>
            </div>
            <div>
              <strong>
                {bookings.filter((b) => b.status === "pending").length}
              </strong>
              <span>Pending</span>
            </div>
            <div>
              <strong>
                {bookings.filter((b) => b.status === "completed").length}
              </strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        <div className="seeker-tabs">
          <button
            className={`seeker-tab${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={14} /> My Profile
          </button>
          <button
            className={`seeker-tab${activeTab === "services" ? " active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            <Search size={14} /> Find Services
          </button>
          <button
            className={`seeker-tab${activeTab === "bookings" ? " active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar size={14} /> My Bookings
          </button>
          <button
            className={`seeker-tab${activeTab === "notifications" ? " active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={14} /> Notifications{" "}
            {notifications.filter((item) => !item.isRead).length > 0
              ? `(${notifications.filter((item) => !item.isRead).length})`
              : ""}
          </button>
        </div>

        {activeTab === "profile" && (
          <section className="seeker-card">
            <h3>Profile Information</h3>
            <div className="seeker-grid">
              <label className="seeker-field">
                <span>First Name</span>
                <input
                  type="text"
                  value={profile.firstName || ""}
                  onChange={(e) => handleInput("firstName", e.target.value)}
                  placeholder="First name"
                />
              </label>
              <label className="seeker-field">
                <span>Last Name</span>
                <input
                  type="text"
                  value={profile.lastName || ""}
                  onChange={(e) => handleInput("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </label>
              <label className="seeker-field">
                <span>Email</span>
                <input
                  type="text"
                  value={profile.email || ""}
                  onChange={(e) => handleInput("email", e.target.value)}
                  placeholder="Email"
                />
              </label>
              <label className="seeker-field">
                <span>Phone</span>
                <input
                  type="text"
                  value={profile.phoneNumber || ""}
                  onChange={(e) => handleInput("phoneNumber", e.target.value)}
                  placeholder="Phone number"
                />
              </label>
              <label className="seeker-field" style={{ gridColumn: "1 / -1" }}>
                <span>Location</span>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => handleInput("location", e.target.value)}
                  placeholder="City, Area"
                />
              </label>
              <label className="seeker-field" style={{ gridColumn: "1 / -1" }}>
                <span>Bio</span>
                <textarea
                  rows={4}
                  value={profile.bio || ""}
                  onChange={(e) => handleInput("bio", e.target.value)}
                  placeholder="Describe your help needs and preferences"
                />
              </label>
            </div>
            <div className="seeker-actions">
              <button className="seeker-btn secondary" onClick={discardChanges}>
                Discard
              </button>
              <button
                className="seeker-btn primary"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </section>
        )}

        {activeTab === "services" && (
          <section className="seeker-card">
            <div className="seeker-services-head">
              <h3>Find Help & Book Service</h3>
              <input
                className="seeker-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service, category, location"
              />
            </div>

            {servicesLoading ? (
              <div style={{ color: "#9eb0ca" }}>Loading services...</div>
            ) : filteredServices.length === 0 ? (
              <div style={{ color: "#9eb0ca" }}>No services found.</div>
            ) : (
              <div className="seeker-services-list">
                {filteredServices.map((service) => (
                  <article key={service._id} className="seeker-service-item">
                    <div>
                      <h4>{service.name}</h4>
                      <p>
                        {service.category?.name || "Service"} ·{" "}
                        {service.location || "Location not set"} · NPR{" "}
                        {Number(service.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="seeker-btn primary"
                      onClick={() => openBookingModal(service)}
                    >
                      Book Service
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="seeker-card">
            <h3>My Bookings</h3>

            {bookingsLoading ? (
              <div style={{ color: "#9eb0ca" }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div style={{ color: "#9eb0ca" }}>
                No bookings yet. Go to Find Services and book one.
              </div>
            ) : (
              <div className="seeker-bookings-list">
                {bookings.map((booking) => (
                  <article key={booking._id} className="seeker-booking-item">
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontFamily: "Syne, sans-serif",
                          fontSize: 16,
                        }}
                      >
                        {booking.service?.name || "Service"}
                      </h4>
                      <div className="seeker-booking-meta">
                        <span>
                          <Calendar size={13} />{" "}
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>
                          <MapPin size={13} /> {booking.location}
                        </span>
                        <span>
                          NPR {Number(booking.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className={`seeker-status st-${booking.status}`}>
                        {booking.status}
                      </span>
                      {![
                        "cancelled",
                        "rejected",
                        "completed",
                        "confirmed",
                      ].includes(booking.status) && (
                        <button
                          className="seeker-btn secondary"
                          onClick={() => cancelBooking(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === "accepted" && (
                        <button
                          className="seeker-btn primary"
                          onClick={() => confirmBooking(booking._id)}
                          disabled={bookingConfirmingId === booking._id}
                        >
                          {bookingConfirmingId === booking._id
                            ? "Confirming..."
                            : "Confirm Booking"}
                        </button>
                      )}
                      {["accepted", "confirmed", "completed"].includes(
                        booking.status,
                      ) && (
                        <>
                          <input
                            type="text"
                            className="seeker-search"
                            style={{ width: 220 }}
                            placeholder="Message helper"
                            value={bookingMessageDrafts[booking._id] || ""}
                            onChange={(e) =>
                              updateBookingMessageDraft(
                                booking._id,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            className="seeker-btn secondary"
                            onClick={() => sendBookingMessage(booking._id)}
                            disabled={bookingMessageSendingId === booking._id}
                          >
                            {bookingMessageSendingId === booking._id
                              ? "Sending..."
                              : "Send Message"}
                          </button>
                        </>
                      )}
                      {["accepted", "completed"].includes(booking.status) && (
                        <button
                          className="seeker-btn primary"
                          onClick={() => viewAcceptedHelperProfile(booking._id)}
                          disabled={helperProfileLoading}
                        >
                          {helperProfileLoading
                            ? "Loading..."
                            : "View Local Helper Profile"}
                        </button>
                      )}
                      {booking.status === "completed" &&
                        !reviewedBookings[booking._id] && (
                          <button
                            className="seeker-btn primary"
                            onClick={() => openReviewModal(booking._id)}
                          >
                            Rate Helper
                          </button>
                        )}
                      {booking.status === "completed" &&
                        reviewedBookings[booking._id] && (
                          <span className="seeker-status st-completed">
                            Reviewed
                          </span>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="seeker-card">
            <div className="seeker-services-head">
              <h3>Notifications</h3>
              <button
                className="seeker-btn secondary"
                onClick={markAllNotificationsRead}
              >
                Mark All Read
              </button>
            </div>

            {notificationsLoading ? (
              <div style={{ color: "#9eb0ca" }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ color: "#9eb0ca" }}>No notifications yet.</div>
            ) : (
              <div className="seeker-notification-list">
                {notifications.map((notification) => (
                  <article
                    key={notification._id}
                    className={`seeker-notification-item ${notification.isRead ? "" : "unread"}`}
                    onClick={() =>
                      !notification.isRead &&
                      markNotificationRead(notification._id)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <strong
                        style={{ fontFamily: "Syne, sans-serif", fontSize: 15 }}
                      >
                        {notification.title}
                      </strong>
                      <span style={{ color: "#95a3ba", fontSize: 12 }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#c7d2e6",
                        fontSize: 13,
                      }}
                    >
                      {notification.message}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {message && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 10,
              border: "1px solid rgba(59,130,246,0.28)",
              background: "rgba(59,130,246,0.12)",
              color: "#93c5fd",
              padding: "10px 12px",
            }}
          >
            {message}
          </div>
        )}
      </div>

      {selectedService && (
        <div
          className="seeker-modal-wrap"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="seeker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="seeker-modal-head">
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Syne, sans-serif",
                  fontSize: 18,
                }}
              >
                Book {selectedService.name}
              </h3>
              <button
                className="seeker-ghost"
                onClick={() => setSelectedService(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createBooking}>
              <label className="seeker-field">
                <span>Scheduled Date *</span>
                <input
                  type="date"
                  value={bookingForm.scheduledDate}
                  onChange={(e) =>
                    setBookingForm((p) => ({
                      ...p,
                      scheduledDate: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="seeker-field">
                <span>Location *</span>
                <input
                  type="text"
                  value={bookingForm.location}
                  onChange={(e) =>
                    setBookingForm((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="Booking location"
                  required
                />
              </label>
              <label className="seeker-field">
                <span>Notes</span>
                <textarea
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Extra instructions"
                />
              </label>

              <div className="seeker-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="seeker-btn secondary"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="seeker-btn primary"
                  disabled={bookingSubmitting}
                >
                  {bookingSubmitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {helperProfile && (
        <div
          className="seeker-modal-wrap"
          onClick={() => setHelperProfile(null)}
        >
          <div
            className="seeker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="seeker-modal-head">
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Syne, sans-serif",
                  fontSize: 18,
                }}
              >
                Local Helper Profile
              </h3>
              <button
                className="seeker-ghost"
                onClick={() => setHelperProfile(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="helper-profile-box">
              <div>
                <strong>Name:</strong>{" "}
                {helperProfile.name ||
                  [helperProfile.firstName, helperProfile.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  "N/A"}
              </div>
              <div>
                <strong>Role:</strong>{" "}
                {helperProfile.roleTitle || "Local Helper"}
              </div>
              <div>
                <strong>Location:</strong> {helperProfile.location || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong>{" "}
                <Phone size={13} style={{ verticalAlign: "text-bottom" }} />{" "}
                {helperProfile.phoneNumber || "N/A"}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                <Mail size={13} style={{ verticalAlign: "text-bottom" }} />{" "}
                {helperProfile.email || "N/A"}
              </div>
              <div>
                <strong>Rating:</strong>{" "}
                <Star size={13} style={{ verticalAlign: "text-bottom" }} />{" "}
                {helperProfile.rating || "N/A"}
              </div>
              <div>
                <strong>Total Jobs:</strong> {helperProfile.totalJobs || 0}
              </div>
              <div>
                <strong>Skills:</strong>{" "}
                {(helperProfile.skills || []).join(", ") || "N/A"}
              </div>
              <div>
                <strong>About:</strong>{" "}
                {helperProfile.bio || helperProfile.about || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewForm.bookingId && (
        <div
          className="seeker-modal-wrap"
          onClick={() =>
            !reviewSubmitting &&
            setReviewForm({ bookingId: "", rating: "5", comment: "" })
          }
        >
          <div
            className="seeker-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="seeker-modal-head">
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Syne, sans-serif",
                  fontSize: 18,
                }}
              >
                Rate Local Helper
              </h3>
              <button
                className="seeker-ghost"
                onClick={() =>
                  !reviewSubmitting &&
                  setReviewForm({ bookingId: "", rating: "5", comment: "" })
                }
                disabled={reviewSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReview}>
              <label className="seeker-field">
                <span>Rating</span>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: e.target.value,
                    }))
                  }
                  className="seeker-search"
                  style={{ width: "100%", height: 44 }}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </label>
              <label className="seeker-field">
                <span>Comment</span>
                <textarea
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience with this helper"
                  required
                />
              </label>
              <div className="seeker-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="seeker-btn secondary"
                  onClick={() =>
                    setReviewForm({ bookingId: "", rating: "5", comment: "" })
                  }
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seeker-btn primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4,8,12,0.65)",
            display: "grid",
            placeItems: "center",
            color: "#dbeafe",
          }}
        >
          Loading profile...
        </div>
      )}
    </div>
  );
}

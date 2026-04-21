import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import JobPostingForm from './JobPostingForm';
import SeekerWorkspace from './SeekerWorkspace';
import {
  ArrowLeft,
  Award,
  Bell,
  Briefcase,
  Camera,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
  Plus,
  Shield,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'professional', label: 'Professional Details', icon: Briefcase },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'security', label: 'Privacy & Security', icon: Shield },
];

const EXP_FIELDS = [
  { key: 'title', label: 'Job Title', placeholder: 'e.g. Senior Developer' },
  { key: 'company', label: 'Company', placeholder: 'e.g. Acme Corp' },
  { key: 'from', label: 'Start Date', placeholder: 'e.g. Jan 2022' },
  { key: 'to', label: 'End Date', placeholder: 'e.g. Present' },
  { key: 'desc', label: 'Description', placeholder: 'Describe your role...', type: 'textarea' },
];

const EDU_FIELDS = [
  { key: 'degree', label: 'Degree / Qualification', placeholder: 'e.g. B.Sc. Computer Science' },
  { key: 'school', label: 'Institution', placeholder: 'e.g. Tribhuvan University' },
  { key: 'from', label: 'Start Year', placeholder: 'e.g. 2018' },
  { key: 'to', label: 'End Year', placeholder: 'e.g. 2022' },
];

const CERT_FIELDS = [
  { key: 'name', label: 'Certification Name', placeholder: 'e.g. AWS Solutions Architect' },
  { key: 'issuer', label: 'Issuing Organisation', placeholder: 'e.g. Amazon Web Services' },
  { key: 'date', label: 'Issue Date', placeholder: 'e.g. March 2024' },
];

const defaultProfile = {
  firstName: '', lastName: '', email: '', phoneNumber: '',
  timezone: 'UTC', locale: 'en-US',
  address: { line1: '', line2: '', city: '', region: '', postcode: '', country: '' },
  companyName: '', roleTitle: '', location: '', skills: [],
  bio: '', website: '', industry: '', teamSize: '', about: '',
  socialLinks: { linkedIn: '', twitter: '', website: '' },
  avatar: '', coverKey: '', publicProfileVisible: false, publicProfileSlug: '',
  stats: { applied: 0, won: 0, current: 0 },
};

function AddModal({ title, fields, onSave, onClose }) {
  const [form, setForm] = useState({});
  return (
    <div className="pp-overlay">
      <div className="pp-modal">
        <div className="pp-modal-head">
          <strong>{title}</strong>
          <button onClick={onClose} className="pp-icon-btn"><X size={18} /></button>
        </div>
        <div className="pp-modal-body">
          {fields.map((f) => (
            <label key={f.key} className="pp-field">
              <span>{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea
                  placeholder={f.placeholder}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              )}
            </label>
          ))}
        </div>
        <div className="pp-modal-foot">
          <button onClick={onClose} className="pp-btn pp-btn-ghost">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="pp-btn pp-btn-orange">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ onBack }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [initialProfile, setInitialProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('professional');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [userRole, setUserRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [openToWork, setOpenToWork] = useState(false);
  const [workExp, setWorkExp] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [modal, setModal] = useState(null);
  const [showJobPosting, setShowJobPosting] = useState(false);
  const [helperTab, setHelperTab] = useState('profile');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [helperListings, setHelperListings] = useState([]);
  const [helperBookings, setHelperBookings] = useState([]);
  const [helperNotifications, setHelperNotifications] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [bookingActionLoadingId, setBookingActionLoadingId] = useState(null);
  const [bookingMessageLoadingId, setBookingMessageLoadingId] = useState('');
  const [seekerMessageModal, setSeekerMessageModal] = useState({
    open: false,
    bookingId: '',
    text: '',
  });
  const [listingsLoading, setListingsLoading] = useState(false);
  const [postingService, setPostingService] = useState(false);
  const [helperRate, setHelperRate] = useState('');
  const [helperAvailability, setHelperAvailability] = useState('');
  const [serviceForm, setServiceForm] = useState({
    title: '',
    pay: '',
    category: '',
    location: '',
    workType: 'On-site',
    jobType: 'Full-time',
    positions: '1',
    description: '',
    urgent: false,
  });
  const msgTimeout = useRef(null);

  const isHelper = userRole === 'helper';

  const showMsg = (val) => {
    setMessage(val);
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    msgTimeout.current = setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        const res = await axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        const d = res.data?.data?.profile || {};
        const next = {
          ...defaultProfile,
          ...d,
          skills: Array.isArray(d.skills) ? d.skills : [],
          stats: role === 'helper'
            ? { applied: d.totalJobs || 0, won: d.rating ? d.rating.toFixed(1) : '5.0', current: Array.isArray(d.skills) ? d.skills.length : 0 }
            : { applied: d.totalJobs || 0, won: Math.round((d.rating || 0) * 10), current: 3 },
        };
        setProfile(next);
        setInitialProfile(next);
        setAvatarPreview(d.avatar || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => { if (msgTimeout.current) clearTimeout(msgTimeout.current); };
  }, []);

  useEffect(() => {
    if (!loading && isHelper) {
      fetchServiceCategories();
      fetchHelperListings();
      fetchHelperBookings();
      fetchHelperNotifications();
    }
  }, [loading, isHelper]);

  useEffect(() => {
    if (!loading && isHelper) {
      setHelperRate((profile.skills || []).find((skill) => /^NPR\s/i.test(skill)) || '');
      setHelperAvailability(profile.timezone === 'UTC' ? '' : profile.timezone || '');
    }
  }, [loading, isHelper, profile.skills, profile.timezone]);

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      const categories = response.data?.data?.categories || [];
      setServiceCategories(categories);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  const fetchHelperListings = async () => {
    try {
      setListingsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await axios.get(`/api/services/provider/${userId}`);
      const services = response.data?.data?.services || [];
      setHelperListings(services);
    } catch (error) {
      console.error('Error fetching helper listings:', error);
      setHelperListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchHelperBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) return;

      const response = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allBookings = response.data?.data?.bookings || [];
      const incomingBookings = allBookings.filter((booking) => {
        const helperId = typeof booking.helper === 'string' ? booking.helper : booking.helper?._id;
        return helperId === userId;
      });

      setHelperBookings(incomingBookings);
    } catch (error) {
      console.error('Error fetching helper bookings:', error);
      setHelperBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchHelperNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/notifications/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHelperNotifications(response.data?.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching helper notifications:', error);
      setHelperNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const updateIncomingBookingStatus = async (bookingId, status) => {
    try {
      setBookingActionLoadingId(bookingId);
      const token = localStorage.getItem('token');
      if (!token) {
        showMsg('Please login again. Session expired.');
        return;
      }

      await axios.patch(`/api/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMsg(`Booking ${status} successfully.`);
      fetchHelperBookings();
      fetchHelperNotifications();
    } catch (error) {
      console.error('Error updating booking status:', error);
      showMsg(error.response?.data?.message || 'Unable to update booking status.');
    } finally {
      setBookingActionLoadingId(null);
    }
  };

  const markHelperNotificationRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHelperNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
    } catch (error) {
      console.error('Error marking helper notification read:', error);
    }
  };

  const openSeekerMessageModal = (bookingId) => {
    setSeekerMessageModal({
      open: true,
      bookingId,
      text: '',
    });
  };

  const closeSeekerMessageModal = () => {
    setSeekerMessageModal({
      open: false,
      bookingId: '',
      text: '',
    });
  };

  const sendMessageToSeeker = async () => {
    const text = seekerMessageModal.text.trim();
    if (!text) {
      showMsg('Please enter a message for the seeker.');
      return;
    }

    try {
      setBookingMessageLoadingId(seekerMessageModal.bookingId);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/bookings/${seekerMessageModal.bookingId}/message`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg('Message sent to seeker.');
      closeSeekerMessageModal();
      fetchHelperNotifications();
    } catch (error) {
      console.error('Error sending message to seeker:', error);
      showMsg(error.response?.data?.message || 'Unable to send message.');
    } finally {
      setBookingMessageLoadingId('');
    }
  };

  const updateServiceForm = (key, value) => {
    setServiceForm((prev) => ({ ...prev, [key]: value }));
  };

  const parsePriceValue = (raw) => {
    const numeric = String(raw || '').replace(/[^\d.]/g, '');
    return Number.parseFloat(numeric || '0');
  };

  const getServiceCategoryLabel = (service) => {
    const categoryValue = service?.category;

    if (categoryValue && typeof categoryValue === 'object') {
      if (categoryValue.name) return categoryValue.name;
      if (categoryValue.title) return categoryValue.title;
      if (categoryValue.label) return categoryValue.label;

      const categoryId = categoryValue._id || categoryValue.id;
      if (categoryId) {
        const matchedCategory = serviceCategories.find((item) => item._id === categoryId);
        if (matchedCategory?.name) return matchedCategory.name;
      }
    }

    if (typeof categoryValue === 'string' && categoryValue.trim()) {
      const matchedCategory = serviceCategories.find((item) => item._id === categoryValue || item.name === categoryValue);
      return matchedCategory?.name || categoryValue;
    }

    return 'Service';
  };

  const submitHelperService = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showMsg('Please login again. Session expired.');
      return;
    }

    if (!serviceForm.title || !serviceForm.category || !serviceForm.pay || !serviceForm.description) {
      showMsg('Please fill all required service fields.');
      return;
    }

    const price = parsePriceValue(serviceForm.pay);
    if (!price || Number.isNaN(price)) {
      showMsg('Please enter a valid pay or rate amount.');
      return;
    }

    const descriptionBits = [
      serviceForm.description.trim(),
      `Work Type: ${serviceForm.workType}`,
      `Job Type: ${serviceForm.jobType}`,
      `Positions: ${serviceForm.positions || '1'}`,
    ];

    if (serviceForm.urgent) {
      descriptionBits.push('Urgent: Yes');
    }

    const payload = {
      name: serviceForm.title.trim(),
      description: descriptionBits.join('\n'),
      price,
      category: serviceForm.category,
      location: serviceForm.location.trim() || profile.location || '',
      tags: [serviceForm.workType, serviceForm.jobType, serviceForm.urgent ? 'Urgent' : null].filter(Boolean),
      duration: `${serviceForm.positions || '1'} position(s)`,
    };

    try {
      setPostingService(true);
      await axios.post('/api/services', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMsg('Service posted successfully.');
      setServiceForm({
        title: '',
        pay: '',
        category: '',
        location: profile.location || '',
        workType: 'On-site',
        jobType: 'Full-time',
        positions: '1',
        description: '',
        urgent: false,
      });
      await fetchHelperListings();
      setHelperTab('listings');
    } catch (error) {
      console.error('Error posting helper service:', error);
      showMsg(error.response?.data?.message || 'Failed to post service.');
    } finally {
      setPostingService(false);
    }
  };

  const deleteHelperListing = async (serviceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showMsg('Please login again. Session expired.');
      return;
    }

    try {
      await axios.delete(`/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMsg('Service deleted successfully.');
      await fetchHelperListings();
    } catch (error) {
      console.error('Error deleting service:', error);
      showMsg(error.response?.data?.message || 'Unable to delete this service.');
    }
  };

  const handleInput = (path, value) => {
    setDirty(true);
    if (path.startsWith('address.')) {
      const k = path.split('.')[1];
      setProfile((p) => ({ ...p, address: { ...p.address, [k]: value } }));
    } else if (path.startsWith('socialLinks.')) {
      const k = path.split('.')[1];
      setProfile((p) => ({ ...p, socialLinks: { ...p.socialLinks, [k]: value } }));
    } else {
      setProfile((p) => ({ ...p, [path]: value }));
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/profile', profile, { headers: { Authorization: `Bearer ${token}` } });
      const saved = res.data?.data?.profile
        ? { ...defaultProfile, ...res.data.data.profile, skills: Array.isArray(res.data.data.profile.skills) ? res.data.data.profile.skills : [], stats: profile.stats }
        : profile;
      setProfile(saved);
      setInitialProfile(saved);
      setDirty(false);
      showMsg('Saved successfully.');
    } catch (err) {
      showMsg('Unable to save changes.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setProfile(initialProfile);
    setAvatarPreview(initialProfile.avatar || '');
    setDirty(false);
    showMsg('Changes discarded.');
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.post('/api/profile/avatar', { avatarUrl: reader.result }, { headers: { Authorization: `Bearer ${token}` } });
        const url = res.data?.data?.avatar || reader.result;
        setAvatarPreview(url);
        setProfile((p) => ({ ...p, avatar: url }));
        setDirty(true);
        showMsg('Avatar updated.');
      } catch {
        showMsg('Avatar upload failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || (profile.skills || []).includes(s)) return;
    setProfile((p) => ({ ...p, skills: [...(p.skills || []), s] }));
    setSkillInput('');
    setDirty(true);
  };

  const removeSkill = (s) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
    setDirty(true);
  };

  const getInitial = () => {
    const n = profile.firstName || profile.name || profile.email || '?';
    return n.charAt(0).toUpperCase();
  };

  const getHelperInitials = () => {
    const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || profile.name || profile.email || 'U';
    return full
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'User';

  const postedCount = helperListings.length;
  const applicantCount = helperListings.reduce((sum, item) => sum + (item.totalJobs || 0), 0);
  const activeCount = helperListings.filter((item) => {
    const ageInDays = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays <= 90;
  }).length;

  const helperStatusForService = (service) => {
    const ageInDays = Math.floor((Date.now() - new Date(service.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays > 90 ? 'Expired' : 'Active';
  };

  if (!loading && !isHelper) {
    return (
      <SeekerWorkspace
        onBack={onBack}
        profile={profile}
        loading={loading}
        dirty={dirty}
        saving={saving}
        message={message}
        avatarPreview={avatarPreview}
        handleInput={handleInput}
        saveProfile={saveProfile}
        discardChanges={discardChanges}
        uploadFile={(file) => uploadAvatar(file)}
        showMessage={showMsg}
        onOpenJobs={() => setShowJobPosting(true)}
      />
    );
  }

  if (!loading && isHelper) {
    const fullNameValue = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || profile.name || '';

    return (
      <div className="helper-shell">
        <style>{PP_CSS}</style>

        <button onClick={onBack} className="pp-back"><ArrowLeft size={18} /> Back</button>

        <div className="helper-wrap">
          <section className="helper-top-card">
            <div className="helper-profile-head">
              {avatarPreview && /^(data:|https?:|\/)/.test(avatarPreview) ? (
                <img src={avatarPreview} alt="avatar" className="helper-avatar-img" />
              ) : (
                <div className="helper-avatar-circle">{getHelperInitials()}</div>
              )}
              <div>
                <h1>{displayName}</h1>
                <div className="helper-meta-line">
                  <span>{profile.roleTitle || 'Helper'}</span>
                  <span><MapPin size={13} /> {profile.location || 'Add location'}</span>
                  <span><Phone size={13} /> {profile.phoneNumber || 'Add phone'}</span>
                </div>
              </div>
            </div>

            <div className="helper-stats-grid">
              <div>
                <strong>{postedCount}</strong>
                <span>Posted</span>
              </div>
              <div>
                <strong>{applicantCount}</strong>
                <span>Applicants</span>
              </div>
              <div>
                <strong>{activeCount}</strong>
                <span>Active</span>
              </div>
            </div>
          </section>

          <div className="helper-tabs-row">
            <button className={`helper-tab-btn${helperTab === 'profile' ? ' active' : ''}`} onClick={() => setHelperTab('profile')}>
              <User size={14} /> My Profile
            </button>
            <button className={`helper-tab-btn${helperTab === 'requests' ? ' active' : ''}`} onClick={() => setHelperTab('requests')}>
              <Calendar size={14} /> Booking Requests
            </button>
            <button className={`helper-tab-btn${helperTab === 'post' ? ' active' : ''}`} onClick={() => setHelperTab('post')}>
              <Plus size={14} /> Post a Service
            </button>
            <button className={`helper-tab-btn${helperTab === 'listings' ? ' active' : ''}`} onClick={() => setHelperTab('listings')}>
              <ClipboardList size={14} /> My Listings
            </button>
            <button className={`helper-tab-btn${helperTab === 'notifications' ? ' active' : ''}`} onClick={() => setHelperTab('notifications')}>
              <Bell size={14} /> Notifications {helperNotifications.filter((item) => !item.isRead).length > 0 ? `(${helperNotifications.filter((item) => !item.isRead).length})` : ''}
            </button>
          </div>

          {helperTab === 'profile' && (
            <section className="helper-two-col">
              <div className="helper-card">
                <h3>Personal Info</h3>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={fullNameValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [first, ...rest] = value.split(' ');
                      handleInput('firstName', first || '');
                      handleInput('lastName', rest.join(' '));
                      handleInput('name', value);
                    }}
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  Role / Trade
                  <input type="text" value={profile.roleTitle || ''} onChange={(e) => handleInput('roleTitle', e.target.value)} placeholder="Electrician" />
                </label>
                <label>
                  Location
                  <input type="text" value={profile.location || ''} onChange={(e) => handleInput('location', e.target.value)} placeholder="Pokhara" />
                </label>
                <label>
                  Phone Number
                  <input type="text" value={profile.phoneNumber || ''} onChange={(e) => handleInput('phoneNumber', e.target.value)} placeholder="98XXXXXXXX" />
                </label>
                <label>
                  Hourly / Visit Rate
                  <input type="text" value={helperRate} onChange={(e) => setHelperRate(e.target.value)} placeholder="NPR 1,200/hr" />
                </label>
              </div>

              <div className="helper-card">
                <h3>About & Availability</h3>
                <label>
                  Bio
                  <textarea
                    rows={4}
                    value={profile.bio || profile.about || ''}
                    onChange={(e) => {
                      handleInput('bio', e.target.value);
                      handleInput('about', e.target.value);
                    }}
                    placeholder="Tell seekers about your experience"
                  />
                </label>
                <label>
                  Availability
                  <input type="text" value={helperAvailability} onChange={(e) => setHelperAvailability(e.target.value)} placeholder="Weekdays 9am-6pm" />
                </label>

                <button className="helper-save-btn" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </section>
          )}

          {helperTab === 'requests' && (
            <section className="helper-card">
              <h3>Incoming Booking Requests</h3>
              {bookingsLoading ? (
                <div className="helper-empty">Loading booking requests...</div>
              ) : helperBookings.length === 0 ? (
                <div className="helper-empty">No booking requests yet.</div>
              ) : (
                <div className="helper-list-wrap">
                  {helperBookings.map((booking) => (
                    <article key={booking._id} className="helper-list-item">
                      <div>
                        <h4>{booking.service?.name || 'Service'}</h4>
                        <p>
                          <span>Seeker: {booking.seeker?.name || 'N/A'}</span>
                          <span><MapPin size={13} /> {booking.location || 'N/A'}</span>
                          <span><Calendar size={13} /> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}</span>
                        </p>
                        {booking.notes ? (
                          <p style={{ marginTop: 8 }}>
                            <span>Notes: {booking.notes}</span>
                          </p>
                        ) : null}
                      </div>
                      <div className="helper-list-right">
                        <span className={`helper-status ${['cancelled', 'rejected'].includes(booking.status) ? 'expired' : 'active'}`}>
                          {booking.status}
                        </span>
                        {booking.status === 'pending' ? (
                          <>
                            <button
                              className="helper-save-btn"
                              style={{ width: 'auto', marginTop: 0, padding: '10px 14px' }}
                              onClick={() => updateIncomingBookingStatus(booking._id, 'accepted')}
                              disabled={bookingActionLoadingId === booking._id}
                            >
                              {bookingActionLoadingId === booking._id ? 'Saving...' : 'Accept'}
                            </button>
                            <button
                              className="helper-delete-btn"
                              onClick={() => updateIncomingBookingStatus(booking._id, 'rejected')}
                              disabled={bookingActionLoadingId === booking._id}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {['accepted', 'completed'].includes(booking.status) ? (
                          <button
                            className="helper-clear-btn"
                            onClick={() => openSeekerMessageModal(booking._id)}
                            disabled={bookingMessageLoadingId === booking._id}
                          >
                            {bookingMessageLoadingId === booking._id ? 'Sending...' : 'Message Seeker'}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {helperTab === 'post' && (
            <section className="helper-card helper-post-card">
              <h3>Post a New Service</h3>
              <form onSubmit={submitHelperService} className="helper-post-grid">
                <label>
                  Service Title *
                  <input type="text" value={serviceForm.title} onChange={(e) => updateServiceForm('title', e.target.value)} placeholder="e.g. Need a House Cleaner" required />
                </label>
                <label>
                  Pay / Rate *
                  <input type="text" value={serviceForm.pay} onChange={(e) => updateServiceForm('pay', e.target.value)} placeholder="e.g. NPR 800/visit" required />
                </label>

                <label>
                  Category *
                  <select value={serviceForm.category} onChange={(e) => updateServiceForm('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {serviceCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Location *
                  <input type="text" value={serviceForm.location} onChange={(e) => updateServiceForm('location', e.target.value)} placeholder="City or area" required />
                </label>

                <label>
                  Work Type
                  <select value={serviceForm.workType} onChange={(e) => updateServiceForm('workType', e.target.value)}>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
                <label>
                  Job Type
                  <select value={serviceForm.jobType} onChange={(e) => updateServiceForm('jobType', e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </label>

                <label>
                  Positions
                  <input type="number" min="1" value={serviceForm.positions} onChange={(e) => updateServiceForm('positions', e.target.value)} />
                </label>

                <label className="helper-span-2">
                  Description *
                  <textarea rows={5} value={serviceForm.description} onChange={(e) => updateServiceForm('description', e.target.value)} placeholder="Describe what you need, requirements, timing, etc." required />
                </label>

                <label className="helper-checkbox">
                  <input type="checkbox" checked={serviceForm.urgent} onChange={(e) => updateServiceForm('urgent', e.target.checked)} />
                  Mark as Urgent
                </label>

                <div className="helper-post-actions">
                  <button type="submit" className="helper-save-btn" disabled={postingService}>
                    {postingService ? 'Posting...' : 'Post Service'}
                  </button>
                  <button type="button" className="helper-clear-btn" onClick={() => setServiceForm((prev) => ({ ...prev, title: '', pay: '', description: '', urgent: false }))}>
                    Clear
                  </button>
                </div>
              </form>
            </section>
          )}

          {helperTab === 'listings' && (
            <section className="helper-card">
              <div className="helper-list-head">
                <h3>My Posted Services ({helperListings.length})</h3>
                <button className="helper-save-btn helper-post-new" onClick={() => setHelperTab('post')}>+ Post New</button>
              </div>

              {listingsLoading ? (
                <div className="helper-empty">Loading listings...</div>
              ) : helperListings.length === 0 ? (
                <div className="helper-empty">No services posted yet.</div>
              ) : (
                <div className="helper-list-wrap">
                  {helperListings.map((service) => {
                    const status = helperStatusForService(service);
                    return (
                      <article key={service._id} className="helper-list-item">
                        <div>
                          <h4>{service.name}</h4>
                          <p>
                            <span>{getServiceCategoryLabel(service)}</span>
                            <span>NPR {Number(service.price || 0).toLocaleString()}</span>
                            <span><Calendar size={13} /> {new Date(service.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                        <div className="helper-list-right">
                          <div className="helper-applied-count">{service.totalJobs || 0}<span>applied</span></div>
                          <span className={`helper-status ${status === 'Expired' ? 'expired' : 'active'}`}>{status}</span>
                          <button className="helper-delete-btn" onClick={() => deleteHelperListing(service._id)}>Delete</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {helperTab === 'notifications' && (
            <section className="helper-card">
              <h3>Notifications</h3>
              {notificationsLoading ? (
                <div className="helper-empty">Loading notifications...</div>
              ) : helperNotifications.length === 0 ? (
                <div className="helper-empty">No notifications yet.</div>
              ) : (
                <div className="helper-list-wrap">
                  {helperNotifications.map((notification) => (
                    <article
                      key={notification._id}
                      className="helper-list-item"
                      onClick={() => !notification.isRead && markHelperNotificationRead(notification._id)}
                      style={{ cursor: 'pointer', borderLeft: !notification.isRead ? '3px solid #3b82f6' : undefined }}
                    >
                      <div>
                        <h4>{notification.title}</h4>
                        <p>
                          <span>{notification.message}</span>
                        </p>
                      </div>
                      <div className="helper-list-right">
                        <span style={{ color: '#9ba4b6', fontSize: 13 }}>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {seekerMessageModal.open ? (
            <div className="pp-overlay" onClick={closeSeekerMessageModal}>
              <div className="pp-modal" onClick={(event) => event.stopPropagation()}>
                <div className="pp-modal-head">
                  <strong>Message Seeker</strong>
                  <button onClick={closeSeekerMessageModal} className="pp-icon-btn"><X size={18} /></button>
                </div>
                <div className="pp-modal-body">
                  <label className="pp-field">
                    <span>Write a clear update for the seeker</span>
                    <textarea
                      rows={5}
                      value={seekerMessageModal.text}
                      maxLength={500}
                      onChange={(event) => setSeekerMessageModal((prev) => ({ ...prev, text: event.target.value }))}
                      placeholder="Hi, I have reviewed your request and can arrive tomorrow at 10 AM. Please confirm if that works for you."
                    />
                  </label>
                  <div className="pp-list-meta" style={{ textAlign: 'right' }}>
                    {seekerMessageModal.text.length}/500
                  </div>
                </div>
                <div className="pp-modal-foot">
                  <button onClick={closeSeekerMessageModal} className="pp-btn pp-btn-ghost">Cancel</button>
                  <button
                    onClick={sendMessageToSeeker}
                    className="pp-btn pp-btn-orange"
                    disabled={!seekerMessageModal.text.trim() || bookingMessageLoadingId === seekerMessageModal.bookingId}
                  >
                    {bookingMessageLoadingId === seekerMessageModal.bookingId ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {message && <div className="pp-msg helper-toast">{message}</div>}
        </div>
      </div>
    );
  }

  const renderProfile = () => (
    <div className="pp-tab-content">
      <div className="pp-section-header">
        <strong>Personal Information</strong>
        <span>Update your basic profile details.</span>
      </div>
      <div className="pp-form-grid">
        {[
          { label: 'First Name', key: 'firstName', placeholder: 'First name' },
          { label: 'Last Name', key: 'lastName', placeholder: 'Last name' },
          { label: 'Email', key: 'email', placeholder: 'Email address', disabled: true },
          { label: 'Phone', key: 'phoneNumber', placeholder: 'Phone number' },
          { label: 'Location', key: 'location', placeholder: 'City, Country' },
          { label: 'Website', key: 'website', placeholder: 'https://yoursite.com' },
        ].map((f) => (
          <label key={f.key} className="pp-field">
            <span>{f.label}</span>
            <input
              type="text"
              value={profile[f.key] || ''}
              disabled={f.disabled}
              onChange={(e) => handleInput(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </label>
        ))}
      </div>
      <label className="pp-field">
        <span>Bio</span>
        <textarea
          value={profile.bio || profile.about || ''}
          onChange={(e) => handleInput('bio', e.target.value)}
          placeholder="Write a short bio about yourself..."
          rows={4}
        />
      </label>
    </div>
  );

  const renderProfessional = () => (
    <div className="pp-tab-content">
      <div className="pp-section-header">
        <strong>Professional Details</strong>
        <span>Showcase your skills, experience, and career preferences</span>
      </div>

      {/* Skills */}
      <div className="pp-prof-section">
        <label className="pp-field">
          <span>Skills</span>
          <div className="pp-skills-row">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Enter Your Skills"
            />
            <button onClick={addSkill} className="pp-add-btn">+</button>
          </div>
        </label>
        {(profile.skills || []).length > 0 && (
          <div className="pp-tags">
            {profile.skills.map((s) => (
              <span key={s} className="pp-tag">
                {s}
                <button onClick={() => removeSkill(s)} className="pp-tag-x"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Work Experience */}
      <div className="pp-prof-section">
        <div className="pp-section-row">
          <div className="pp-section-title">
            <FileText size={18} color="#f97316" />
            <strong>Work Experience</strong>
          </div>
          <button onClick={() => setModal('experience')} className="pp-outline-btn">+ Add Experience</button>
        </div>
        {workExp.length > 0 && (
          <div className="pp-list">
            {workExp.map((item, i) => (
              <div key={i} className="pp-list-item">
                <div><strong>{item.title}</strong>{item.company ? ` · ${item.company}` : ''}</div>
                {(item.from || item.to) && <div className="pp-list-meta">{item.from} – {item.to || 'Present'}</div>}
                {item.desc && <div className="pp-list-desc">{item.desc}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="pp-prof-section">
        <div className="pp-section-row">
          <div className="pp-section-title">
            <GraduationCap size={18} color="#f97316" />
            <strong>Education</strong>
          </div>
          <button onClick={() => setModal('education')} className="pp-outline-btn">+ Add Education</button>
        </div>
        {education.length > 0 && (
          <div className="pp-list">
            {education.map((item, i) => (
              <div key={i} className="pp-list-item">
                <div><strong>{item.degree}</strong></div>
                {item.school && <div className="pp-list-meta">{item.school}{item.from ? ` · ${item.from}–${item.to || ''}` : ''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="pp-prof-section">
        <div className="pp-section-row">
          <div className="pp-section-title">
            <Award size={18} color="#f97316" />
            <strong>Certifications</strong>
          </div>
          <button onClick={() => setModal('certification')} className="pp-outline-btn">+ Add Certifications</button>
        </div>
        {certifications.length > 0 && (
          <div className="pp-list">
            {certifications.map((item, i) => (
              <div key={i} className="pp-list-item">
                <div><strong>{item.name}</strong></div>
                {item.issuer && <div className="pp-list-meta">{item.issuer}{item.date ? ` · ${item.date}` : ''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="pp-tab-content">
      <div className="pp-section-header">
        <strong>Preferences</strong>
        <span>Manage your regional and notification preferences.</span>
      </div>
      <div className="pp-form-grid">
        {[
          { label: 'Timezone', key: 'timezone', placeholder: 'e.g. UTC+5:45' },
          { label: 'Locale', key: 'locale', placeholder: 'e.g. en-US' },
        ].map((f) => (
          <label key={f.key} className="pp-field">
            <span>{f.label}</span>
            <input type="text" value={profile[f.key] || ''} onChange={(e) => handleInput(f.key, e.target.value)} placeholder={f.placeholder} />
          </label>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="pp-tab-content">
      <div className="pp-section-header">
        <strong>Privacy & Security</strong>
        <span>Manage your account security settings.</span>
      </div>
      <div className="pp-form-grid">
        <label className="pp-field">
          <span>New Password</span>
          <input type="password" placeholder="Enter new password" />
        </label>
        <label className="pp-field">
          <span>Confirm Password</span>
          <input type="password" placeholder="Confirm new password" />
        </label>
      </div>
      <label className="pp-field pp-checkbox-row" style={{ marginTop: 8 }}>
        <input
          type="checkbox"
          checked={profile.publicProfileVisible}
          onChange={(e) => handleInput('publicProfileVisible', e.target.checked)}
        />
        <span>Make profile publicly visible</span>
      </label>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div style={{ padding: 40, color: '#64748b', textAlign: 'center' }}>Loading...</div>;
    switch (activeTab) {
      case 'profile': return renderProfile();
      case 'professional': return renderProfessional();
      case 'preferences': return renderPreferences();
      case 'security': return renderSecurity();
      default: return null;
    }
  };

  const modalConfig = {
    experience: { title: 'Add Work Experience', fields: EXP_FIELDS, onSave: (d) => setWorkExp((p) => [...p, d]) },
    education: { title: 'Add Education', fields: EDU_FIELDS, onSave: (d) => setEducation((p) => [...p, d]) },
    certification: { title: 'Add Certification', fields: CERT_FIELDS, onSave: (d) => setCertifications((p) => [...p, d]) },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f1f5f9', fontFamily: "'DM Sans','Syne',sans-serif" }}>
      <style>{PP_CSS}</style>

      <button onClick={onBack} className="pp-back"><ArrowLeft size={18} /> Back</button>

      <div className="pp-root">
        {/* Heading */}
        <div className="pp-heading">
          <h1>Account Settings</h1>
          <p>Manage your HomeTown Helper Account and preferences</p>
        </div>

        {/* User card */}
        <div className="pp-user-card">
          <div className="pp-avatar-wrap">
            {avatarPreview && /^(data:|https?:|\/)/.test(avatarPreview) ? (
              <img src={avatarPreview} alt="avatar" className="pp-avatar-img" />
            ) : (
              <div className="pp-avatar-letter">{getInitial()}</div>
            )}
            <label className="pp-avatar-camera">
              <Camera size={13} />
              <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="pp-user-info">
            <strong className="pp-user-name">{displayName}</strong>
            <span className="pp-user-email">{profile.email || ''}</span>
            <button onClick={() => setOpenToWork((v) => !v)} className={`pp-otw${openToWork ? ' pp-otw-on' : ''}`}>
              {openToWork ? 'Open To Work' : 'Open To Work'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="pp-tabs">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pp-tab${activeTab === t.id ? ' pp-tab-act' : ''}`}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="pp-panel">{renderContent()}</div>

        {/* Toast message */}
        {message && <div className="pp-msg">{message}</div>}

        {/* Action bar */}
        <div className="pp-bar">
          <button onClick={discardChanges} className="pp-btn pp-btn-ghost">Cancel</button>
          <button onClick={saveProfile} disabled={!dirty || saving} className="pp-btn pp-btn-orange">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {modal && (
        <AddModal
          {...modalConfig[modal]}
          onClose={() => setModal(null)}
        />
      )}
      {showJobPosting && <JobPostingForm onClose={() => setShowJobPosting(false)} />}
    </div>
  );
}

const PP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');

  .pp-back {
    position: fixed; top: 16px; left: 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    color: #f1f5f9; border-radius: 999px;
    padding: 8px 16px; display: inline-flex;
    align-items: center; gap: 8px;
    cursor: pointer; font: inherit; font-size: 14px; z-index: 20;
    transition: background 0.2s;
  }
  .pp-back:hover { background: rgba(255,255,255,0.10); }

  .pp-root {
    max-width: 820px; margin: 0 auto;
    padding: 60px 24px 48px;
  }

  .pp-heading { margin-bottom: 28px; }
  .pp-heading h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; }
  .pp-heading p { margin: 6px 0 0; color: #64748b; font-size: 13px; }

  /* User card */
  .pp-user-card { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }

  .pp-avatar-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
  .pp-avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }
  .pp-avatar-letter {
    width: 72px; height: 72px; border-radius: 50%;
    display: grid; place-items: center;
    background: #f97316; color: #111;
    font-size: 28px; font-weight: 800;
  }
  .pp-avatar-camera {
    position: absolute; bottom: 1px; right: 1px;
    width: 24px; height: 24px; border-radius: 50%;
    background: #1c1c1c; border: 1.5px solid rgba(255,255,255,0.15);
    display: grid; place-items: center;
    cursor: pointer; color: #94a3b8;
  }

  .pp-user-info { display: flex; flex-direction: column; gap: 3px; }
  .pp-user-name { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .pp-user-email { color: #64748b; font-size: 13px; }

  .pp-otw {
    margin-top: 6px; border-radius: 6px;
    padding: 5px 14px; border: 1px solid rgba(249,115,22,0.35);
    background: rgba(249,115,22,0.15); color: #f97316;
    font: inherit; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: background 0.2s, color 0.2s; width: fit-content;
  }
  .pp-otw-on, .pp-otw:hover { background: #f97316; color: #111; border-color: #f97316; }

  /* Tabs */
  .pp-tabs {
    display: flex; gap: 2px; flex-wrap: wrap;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 18px;
  }
  .pp-tab {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 16px; font: inherit; font-size: 13px;
    background: transparent; border: none;
    border-bottom: 2px solid transparent;
    color: #64748b; cursor: pointer; margin-bottom: -1px;
    transition: color 0.2s, border-color 0.2s; white-space: nowrap;
  }
  .pp-tab:hover { color: #f1f5f9; }
  .pp-tab-act { color: #f1f5f9; border-bottom-color: #f97316; font-weight: 700; }

  /* Panel */
  .pp-panel {
    background: #111; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; overflow: hidden;
  }

  .pp-tab-content { padding: 24px; display: grid; gap: 20px; }

  .pp-section-header { display: grid; gap: 3px; }
  .pp-section-header strong { font-size: 14px; font-weight: 700; }
  .pp-section-header span { color: #64748b; font-size: 13px; }

  /* Form */
  .pp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .pp-field { display: grid; gap: 6px; }
  .pp-field span { font-size: 12px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.01em; }

  .pp-field input, .pp-field textarea {
    background: #0d0d0d; border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; padding: 11px 14px;
    color: #f1f5f9; font: inherit; font-size: 14px;
    width: 100%; box-sizing: border-box; resize: vertical;
    transition: border-color 0.2s;
  }
  .pp-field input::placeholder, .pp-field textarea::placeholder { color: #334155; }
  .pp-field input:focus, .pp-field textarea:focus { outline: none; border-color: rgba(249,115,22,0.45); }
  .pp-field input:disabled { opacity: 0.45; cursor: not-allowed; }

  .pp-checkbox-row { flex-direction: row; align-items: center; gap: 10px; display: flex; }
  .pp-checkbox-row input[type=checkbox] { width: 16px; height: 16px; accent-color: #f97316; flex-shrink: 0; }
  .pp-checkbox-row span { color: #94a3b8; font-size: 13px; font-weight: 400; letter-spacing: 0; }

  /* Professional sections */
  .pp-prof-section { display: grid; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  .pp-section-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .pp-section-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; }

  /* Skills */
  .pp-skills-row { display: flex; }
  .pp-skills-row input { flex: 1; border-radius: 10px 0 0 10px; height: 44px; }
  .pp-add-btn {
    width: 44px; height: 44px; border: none;
    border-radius: 0 10px 10px 0;
    background: #f97316; color: #111;
    font-size: 24px; font-weight: 700;
    cursor: pointer; display: grid; place-items: center;
    flex-shrink: 0; transition: background 0.2s; line-height: 1;
  }
  .pp-add-btn:hover { background: #fb923c; }

  .pp-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .pp-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(249,115,22,0.13); color: #fdba74;
    border: 1px solid rgba(249,115,22,0.22);
    border-radius: 999px; padding: 4px 12px; font-size: 13px;
  }
  .pp-tag-x { background: transparent; border: none; cursor: pointer; color: #fdba74; display: grid; place-items: center; padding: 0; }

  /* Outline add button */
  .pp-outline-btn {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid #f97316; background: transparent;
    color: #f97316; border-radius: 8px;
    padding: 7px 14px; font: inherit; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: background 0.2s;
  }
  .pp-outline-btn:hover { background: rgba(249,115,22,0.10); }

  /* Entry list */
  .pp-list { display: grid; gap: 10px; }
  .pp-list-item {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 12px 14px;
    display: grid; gap: 4px; font-size: 14px;
  }
  .pp-list-meta { color: #64748b; font-size: 12px; }
  .pp-list-desc { color: #94a3b8; font-size: 13px; margin-top: 4px; }

  /* Toast */
  .pp-msg {
    margin-top: 14px; padding: 12px 16px; border-radius: 10px;
    background: rgba(249,115,22,0.12); color: #fdba74;
    font-size: 14px; border: 1px solid rgba(249,115,22,0.2);
  }

  /* Action bar */
  .pp-bar { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

  /* Buttons */
  .pp-btn {
    border-radius: 10px; padding: 11px 22px; font: inherit;
    font-size: 14px; font-weight: 700; cursor: pointer;
    border: 1px solid transparent; transition: background 0.2s, opacity 0.2s;
  }
  .pp-btn-ghost { background: #1a1a1a; border-color: rgba(255,255,255,0.12); color: #94a3b8; }
  .pp-btn-ghost:hover { background: #222; }
  .pp-btn-orange { background: #f97316; color: #111; }
  .pp-btn-orange:disabled { opacity: 0.45; cursor: not-allowed; }
  .pp-btn-orange:hover:not(:disabled) { background: #fb923c; }

  /* Modal */
  .pp-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    z-index: 1000; display: flex; align-items: center;
    justify-content: center; padding: 20px;
  }
  .pp-modal {
    background: #141414; border: 1px solid rgba(255,255,255,0.10);
    border-radius: 20px; width: 100%; max-width: 460px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }
  .pp-modal-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 22px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .pp-modal-head strong { font-size: 16px; }
  .pp-modal-body { padding: 18px 22px; display: grid; gap: 14px; }
  .pp-modal-foot {
    padding: 14px 22px 20px; display: flex; justify-content: flex-end; gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .pp-icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; display: grid; place-items: center; padding: 4px; }

  .helper-shell {
    min-height: 100vh;
    background: #07090c;
    color: #f4f6fa;
    font-family: 'DM Sans', sans-serif;
  }

  .helper-wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding: 78px 24px 42px;
  }

  .helper-top-card {
    background: linear-gradient(90deg, rgba(19,24,32,0.98), rgba(22,26,33,0.98));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .helper-profile-head {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .helper-avatar-img,
  .helper-avatar-circle {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    object-fit: cover;
  }

  .helper-avatar-circle {
    background: #22c55e;
    color: #fff;
    display: grid;
    place-items: center;
    font-family: 'Syne', sans-serif;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .helper-profile-head h1 {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 4vw, 46px);
    letter-spacing: -0.03em;
  }

  .helper-meta-line {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #a6aebb;
    font-size: 15px;
    flex-wrap: wrap;
  }

  .helper-meta-line span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
  }

  .helper-meta-line span:first-child {
    color: #22c55e;
  }

  .helper-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(88px, 120px));
    gap: 12px;
  }

  .helper-stats-grid > div {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    display: grid;
    place-items: center;
    padding: 10px 6px;
    min-height: 88px;
  }

  .helper-stats-grid strong {
    color: #22c55e;
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    line-height: 1;
  }

  .helper-stats-grid > div:nth-child(2) strong {
    color: #3b82f6;
  }

  .helper-stats-grid > div:nth-child(3) strong {
    color: #f59e0b;
  }

  .helper-stats-grid span {
    margin-top: 7px;
    font-size: 16px;
    color: #8c95a4;
  }

  .helper-tabs-row {
    margin-top: 20px;
    display: inline-flex;
    gap: 8px;
    padding: 8px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.05);
    flex-wrap: wrap;
  }

  .helper-tab-btn {
    border: 0;
    background: transparent;
    color: #a6aebb;
    border-radius: 10px;
    padding: 10px 18px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }

  .helper-tab-btn.active {
    background: #22c55e;
    color: #f5fff9;
    box-shadow: 0 0 0 2px rgba(15,26,46,0.85), 0 0 0 4px rgba(37,99,235,0.9);
  }

  .helper-two-col {
    margin-top: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .helper-card {
    margin-top: 18px;
    background: linear-gradient(180deg, rgba(20,24,31,0.98), rgba(15,19,25,0.98));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 22px;
  }

  .helper-two-col .helper-card {
    margin-top: 0;
  }

  .helper-card h3 {
    margin: 0 0 18px;
    font-family: 'Syne', sans-serif;
    font-size: 20px;
  }

  .helper-card label {
    display: grid;
    gap: 7px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #d8e0ed;
    font-weight: 600;
  }

  .helper-card input,
  .helper-card select,
  .helper-card textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: #f1f5f9;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 14px 14px;
    outline: none;
  }

  .helper-card input:focus,
  .helper-card select:focus,
  .helper-card textarea:focus {
    border-color: rgba(34,197,94,0.7);
    box-shadow: 0 0 0 3px rgba(34,197,94,0.15);
  }

  .helper-save-btn {
    margin-top: 8px;
    width: 100%;
    border: 0;
    border-radius: 12px;
    background: #22c55e;
    color: #ecfdf5;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    padding: 12px 18px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .helper-save-btn:hover:not(:disabled) {
    background: #16a34a;
  }

  .helper-save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .helper-post-grid {
    margin-top: 6px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .helper-span-2 {
    grid-column: 1 / -1;
  }

  .helper-checkbox {
    grid-column: 1 / -1;
    margin: 2px 0;
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    color: #cdd6e5 !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  }

  .helper-checkbox input {
    width: 15px !important;
    height: 15px !important;
    accent-color: #22c55e;
  }

  .helper-post-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .helper-post-actions .helper-save-btn {
    margin: 0;
    flex: 1;
  }

  .helper-clear-btn {
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.06);
    color: #d2dae8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    padding: 11px 18px;
    cursor: pointer;
  }

  .helper-list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  .helper-post-new {
    width: auto;
    margin-top: 0;
    padding: 11px 20px;
  }

  .helper-list-wrap {
    display: grid;
    gap: 0;
  }

  .helper-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 20px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .helper-list-item h4 {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 18px;
  }

  .helper-list-item p {
    margin: 8px 0 0;
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    color: #9ba4b6;
    font-size: 14px;
  }

  .helper-list-item p span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .helper-list-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .helper-applied-count {
    color: #3b82f6;
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    text-align: center;
    line-height: 1;
  }

  .helper-applied-count span {
    display: block;
    margin-top: 5px;
    color: #8f98ab;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
  }

  .helper-status {
    min-width: 84px;
    text-align: center;
    border-radius: 999px;
    padding: 9px 14px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
  }

  .helper-status.active {
    background: rgba(34,197,94,0.15);
    color: #22c55e;
  }

  .helper-status.expired {
    background: rgba(148,163,184,0.17);
    color: #a1a9b8;
  }

  .helper-delete-btn {
    border: 0;
    border-radius: 10px;
    background: #7f1d1d;
    color: #fecaca;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    padding: 10px 14px;
    cursor: pointer;
  }

  .helper-empty {
    padding: 20px 4px 10px;
    color: #9aa3b4;
    font-size: 14px;
  }

  .helper-toast {
    margin-top: 14px;
  }

  @media (max-width: 600px) {
    .pp-form-grid { grid-template-columns: 1fr; }
    .pp-tabs { overflow-x: auto; padding-bottom: 2px; }
    .pp-root { padding-top: 70px; }
  }

  @media (max-width: 960px) {
    .helper-top-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .helper-stats-grid {
      width: 100%;
      grid-template-columns: repeat(3, 1fr);
    }

    .helper-two-col,
    .helper-post-grid {
      grid-template-columns: 1fr;
    }

    .helper-list-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .helper-list-right {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
`;

import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  Crown,
  LayoutDashboard,
  Palette,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  UserRoundPlus,
  Users,
  WandSparkles,
} from 'lucide-react';

const ORANGE = '#f97316';

const isImageSource = (value) => typeof value === 'string' && /^(data:|https?:|\/)/.test(value);

const getDisplayName = (profile) => {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return fullName || profile.name || 'Workspace Owner';
};

const getInitials = (value) => {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'JV';
};

const formatJoinedAt = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffDays = Math.max(1, Math.round((Date.now() - date.getTime()) / 86400000));
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getCompleteness = (profile) => {
  const fields = [profile.companyName, profile.website, profile.industry, profile.teamSize, profile.about];
  const complete = fields.filter((value) => String(value || '').trim()).length;
  return Math.round((complete / fields.length) * 100);
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'company-members', label: 'Company Members', icon: Users },
  { id: 'company-settings', label: 'Company Settings', icon: Settings },
  { id: 'design-studio', label: 'Design Studio', icon: Palette },
];

function EmployerWorkspace({
  onBack,
  profile,
  loading,
  dirty,
  saving,
  message,
  avatarPreview,
  handleInput,
  saveProfile,
  discardChanges,
  uploadFile,
  showMessage,
  onOpenJobs,
}) {
  const [activeSection, setActiveSection] = useState('company-settings');
  const [memberSearch, setMemberSearch] = useState('');

  const companyName = profile.companyName || 'HomeTown Helper Workspace';
  const displayName = getDisplayName(profile);
  const initials = getInitials(displayName);
  const completeness = getCompleteness(profile);
  const companyMembers = [
    {
      id: 'owner',
      name: displayName,
      email: profile.email || 'owner@hometownhelper.com',
      joinedAt: formatJoinedAt(profile.createdAt),
      role: 'Owner',
      avatar: initials,
      isPending: false,
    },
    {
      id: 'recruiter-seat',
      name: 'Open recruiter seat',
      email: 'invite pending',
      joinedAt: 'Awaiting invite',
      role: 'Pending',
      avatar: 'IR',
      isPending: true,
    },
    {
      id: 'ops-seat',
      name: 'Open operations seat',
      email: 'invite pending',
      joinedAt: 'Awaiting invite',
      role: 'Pending',
      avatar: 'IO',
      isPending: true,
    },
  ].filter((member) => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return true;
    return [member.name, member.email, member.role].some((field) => field.toLowerCase().includes(query));
  });

  const topCards = [
    { label: 'Profile Completion', value: `${completeness}%`, helper: 'Complete company details for better visibility.' },
    { label: 'Active Team Seats', value: `${companyMembers.length}`, helper: 'Owner plus invitation placeholders for your workspace.' },
    { label: 'Live Job Posts', value: `${profile.totalJobs || 0}`, helper: 'Use your hiring workspace to post and manage roles.' },
  ];

  const triggerPlaceholderAction = (text) => showMessage(text);

  const renderDashboard = () => (
    <div className="workspace-stack">
      <div className="workspace-hero">
        <div>
          <div className="workspace-eyebrow">Company workspace</div>
          <h1>Manage {companyName}</h1>
          <p>Company members, public company details, and hiring controls are grouped into one employer workspace.</p>
        </div>
        <div className="workspace-actions">
          <button className="ghost-button" onClick={() => setActiveSection('company-members')}>View members</button>
          <button className="primary-button" onClick={() => setActiveSection('company-settings')}>Open settings</button>
        </div>
      </div>

      <div className="metric-grid">
        {topCards.map((card) => (
          <div key={card.label} className="glass-card">
            <div className="metric-label">{card.label}</div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-helper">{card.helper}</div>
          </div>
        ))}
      </div>

      <div className="two-column-grid">
        <div className="glass-card">
          <div className="section-head">
            <div>
              <h2>Quick actions</h2>
              <p>Move directly into the surfaces shown in your mockups.</p>
            </div>
          </div>
          <div className="quick-action-grid">
            <button className="quick-action-tile" onClick={() => setActiveSection('company-members')}>
              <Users size={18} />
              <div>
                <strong>Company Members</strong>
                <span>Review seats, invites, and owner access.</span>
              </div>
            </button>
            <button className="quick-action-tile" onClick={() => setActiveSection('company-settings')}>
              <Settings size={18} />
              <div>
                <strong>Company Settings</strong>
                <span>Edit company profile, description, and website.</span>
              </div>
            </button>
            <button className="quick-action-tile" onClick={onOpenJobs}>
              <WandSparkles size={18} />
              <div>
                <strong>Open Job Studio</strong>
                <span>Continue into the existing job posting workflow.</span>
              </div>
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div className="section-head">
            <div>
              <h2>Workspace summary</h2>
              <p>This mirrors the product-report screenshots without inventing backend data that does not exist yet.</p>
            </div>
          </div>
          <div className="summary-list">
            <div>
              <span>Company name</span>
              <strong>{companyName}</strong>
            </div>
            <div>
              <span>Admin title</span>
              <strong>{profile.roleTitle || 'Company administrator'}</strong>
            </div>
            <div>
              <span>Website</span>
              <strong>{profile.website || 'Add your website in company settings'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="workspace-stack">
      <div className="section-shell">
        <div className="section-head section-head-row">
          <div>
            <div className="workspace-eyebrow">Company members</div>
            <h2>Manage workspace access</h2>
            <p>The owner row is real profile data. Extra rows are invite placeholders until member APIs exist.</p>
          </div>
          <button className="primary-button" onClick={() => triggerPlaceholderAction('Member invitations are scaffolded in the UI, but backend invite endpoints are not implemented yet.') }>
            <UserRoundPlus size={16} /> Invite New Member
          </button>
        </div>

        <div className="toolbar-row">
          <label className="search-shell search-shell-compact">
            <Search size={16} />
            <input
              type="search"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search user..."
            />
          </label>
        </div>

        <div className="table-shell">
          <div className="member-table member-table-head">
            <span>Avatar</span>
            <span>Name</span>
            <span>Email</span>
            <span>Joined At</span>
          </div>
          {companyMembers.map((member) => (
            <div key={member.id} className="member-table member-table-row">
              <div className="member-avatar-cell">
                <div className={`member-avatar ${member.isPending ? 'member-avatar-pending' : ''}`}>{member.avatar}</div>
              </div>
              <div className="member-meta">
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
              <div className="member-muted">{member.email}</div>
              <div className="member-muted">{member.joinedAt}</div>
            </div>
          ))}
        </div>

        <div className="footer-note">Rows per page 5 · Page 1 of 1</div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="workspace-stack">
      <div className="section-shell">
        <div className="section-head">
          <div>
            <div className="workspace-eyebrow">Company settings</div>
            <h2>Company profile</h2>
            <p>Update your company information using the existing profile API.</p>
          </div>
        </div>

        <div className="company-profile-card">
          <div className="company-profile-head">
            <div className="company-logo-wrap">
              {isImageSource(avatarPreview) ? (
                <img src={avatarPreview} alt="Company logo" className="company-logo-image" />
              ) : (
                <div className="company-logo-fallback">{initials}</div>
              )}
              <label className="icon-upload-button">
                <Upload size={14} />
                <input type="file" accept="image/*" onChange={(event) => uploadFile(event.target.files?.[0], 'avatarUrl')} style={{ display: 'none' }} />
              </label>
            </div>
            <div>
              <strong>{companyName}</strong>
              <span>{profile.industry || 'Add industry and company details below.'}</span>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span>Company Name</span>
              <input type="text" value={profile.companyName || ''} onChange={(event) => handleInput('companyName', event.target.value)} placeholder="Pathak Books & Stationery" />
            </label>
            <label>
              <span>Admin Title</span>
              <input type="text" value={profile.roleTitle || ''} onChange={(event) => handleInput('roleTitle', event.target.value)} placeholder="Founder or company admin" />
            </label>
            <label>
              <span>Industry</span>
              <input type="text" value={profile.industry || ''} onChange={(event) => handleInput('industry', event.target.value)} placeholder="Retail, logistics, technology" />
            </label>
            <label>
              <span>Team Size</span>
              <input type="text" value={profile.teamSize || ''} onChange={(event) => handleInput('teamSize', event.target.value)} placeholder="1-10" />
            </label>
          </div>

          <label className="full-width-field">
            <span>Company Description</span>
            <textarea value={profile.about || ''} onChange={(event) => handleInput('about', event.target.value)} rows={5} placeholder="Write a concise company description for candidates and teammates." />
          </label>

          <label className="full-width-field">
            <span>Website URL</span>
              <input type="url" value={profile.website || ''} onChange={(event) => handleInput('website', event.target.value)} placeholder="https://hometownhelper.com" />
          </label>

          <div className="settings-actions">
            <button className="ghost-button" onClick={discardChanges}>Discard</button>
            <button className="primary-button" onClick={saveProfile} disabled={!dirty || saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Update Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="danger-shell">
        <div className="danger-title">Danger Zone</div>
        <div className="danger-list">
          <div className="danger-row">
            <div>
              <strong>Remove Members</strong>
              <span>Removing members will remove their access from this company. This action is not wired yet.</span>
            </div>
            <button className="danger-button" onClick={() => triggerPlaceholderAction('Member removal needs backend company-member support before it can be enabled.') }>
              <Trash2 size={16} /> Remove Members
            </button>
          </div>
          <div className="danger-row">
            <div>
              <strong>Delete This Company</strong>
              <span>Deleting a company would remove all associated company data. This remains a protected placeholder.</span>
            </div>
            <button className="danger-button" onClick={() => triggerPlaceholderAction('Company deletion is intentionally blocked until a dedicated backend workflow exists.') }>
              <Trash2 size={16} /> Delete Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesignStudio = () => (
    <div className="workspace-stack">
      <div className="section-shell">
        <div className="section-head">
          <div>
            <div className="workspace-eyebrow">Design studio</div>
            <h2>Brand and workspace surface</h2>
            <p>This section is staged as a UI shell for future employer-brand customization.</p>
          </div>
        </div>
        <div className="studio-grid">
          <div className="studio-card studio-card-accent">
            <Palette size={18} />
            <strong>Theme direction</strong>
            <span>Dark workspace with strong orange highlights to match the supplied references.</span>
          </div>
          <div className="studio-card">
            <Building2 size={18} />
            <strong>Company identity</strong>
            <span>{companyName} can reuse the uploaded avatar as a workspace logo.</span>
          </div>
          <div className="studio-card">
            <WandSparkles size={18} />
            <strong>Next integration</strong>
            <span>Wire custom themes, candidate-facing pages, and workspace preferences when APIs are available.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="section-shell"><div className="loading-text">Loading workspace...</div></div>;
    }

    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'company-members':
        return renderMembers();
      case 'design-studio':
        return renderDesignStudio();
      case 'company-settings':
      default:
        return renderSettings();
    }
  };

  return (
    <div className="employer-workspace-root">
      <style>{`
        .employer-workspace-root {
          min-height: 100vh;
          background: radial-gradient(circle at top, rgba(249,115,22,0.12), transparent 28%), #050505;
          color: #f8fafc;
          font-family: 'DM Sans', 'Syne', sans-serif;
        }
        .employer-shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: 100vh;
        }
        .workspace-sidebar {
          background: rgba(17, 17, 17, 0.96);
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 20px 16px;
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          gap: 18px;
        }
        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px 4px;
        }
        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, ${ORANGE}, #fb923c);
          display: grid;
          place-items: center;
          color: #111827;
          font-weight: 900;
        }
        .brand-lockup strong {
          display: block;
          font-size: 20px;
          letter-spacing: -0.03em;
        }
        .brand-lockup span {
          color: #94a3b8;
          font-size: 12px;
        }
        .sidebar-company-card,
        .sidebar-profile-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 14px;
          display: grid;
          gap: 8px;
        }
        .sidebar-company-card strong,
        .sidebar-profile-card strong {
          font-size: 15px;
        }
        .sidebar-company-card span,
        .sidebar-profile-card span {
          color: #94a3b8;
          font-size: 12px;
        }
        .sidebar-nav {
          display: grid;
          gap: 8px;
          align-content: start;
        }
        .sidebar-nav button {
          width: 100%;
          border: none;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          color: #cbd5e1;
          cursor: pointer;
          text-align: left;
        }
        .sidebar-nav button.active,
        .sidebar-nav button:hover {
          background: rgba(249,115,22,0.14);
          color: #fff7ed;
        }
        .workspace-main {
          padding: 18px;
        }
        .workspace-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 10px 6px 18px;
        }
        .topbar-left,
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .back-button,
        .icon-button,
        .profile-chip,
        .search-shell,
        .ghost-button,
        .primary-button,
        .danger-button,
        .quick-action-tile,
        .icon-upload-button {
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;
        }
        .back-button,
        .icon-button,
        .profile-chip {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #e5e7eb;
          border-radius: 14px;
          padding: 11px 14px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .search-shell {
          min-width: 320px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 11px 14px;
          color: #94a3b8;
        }
        .search-shell input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #f8fafc;
          font: inherit;
        }
        .search-shell-compact {
          min-width: 240px;
          max-width: 360px;
        }
        .workspace-stack {
          display: grid;
          gap: 18px;
        }
        .workspace-hero,
        .glass-card,
        .section-shell,
        .danger-shell {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(10,10,10,0.92);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .workspace-hero {
          padding: 28px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          background: linear-gradient(135deg, rgba(249,115,22,0.20), rgba(249,115,22,0.05) 45%, rgba(255,255,255,0.02));
        }
        .workspace-eyebrow {
          color: #fdba74;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .workspace-hero h1,
        .section-head h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.04em;
        }
        .workspace-hero p,
        .section-head p,
        .metric-helper,
        .loading-text,
        .footer-note {
          color: #94a3b8;
          line-height: 1.6;
        }
        .workspace-actions,
        .settings-actions,
        .toolbar-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .metric-grid,
        .studio-grid,
        .quick-action-grid,
        .two-column-grid {
          display: grid;
          gap: 18px;
        }
        .metric-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .two-column-grid {
          grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
        }
        .glass-card,
        .section-shell,
        .danger-shell {
          padding: 22px;
        }
        .metric-label {
          color: #94a3b8;
          font-size: 13px;
        }
        .metric-value {
          font-size: 34px;
          font-weight: 800;
          margin: 12px 0 10px;
          letter-spacing: -0.05em;
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .section-head-row {
          align-items: center;
          flex-wrap: wrap;
        }
        .quick-action-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .quick-action-tile {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-align: left;
          cursor: pointer;
        }
        .quick-action-tile div {
          display: grid;
          gap: 6px;
        }
        .quick-action-tile span {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }
        .summary-list {
          display: grid;
          gap: 14px;
        }
        .summary-list div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
        }
        .summary-list span {
          color: #94a3b8;
        }
        .table-shell {
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .member-table {
          display: grid;
          grid-template-columns: 110px 1.4fr 1.5fr 1fr;
          gap: 16px;
          align-items: center;
          padding: 16px 18px;
        }
        .member-table-head {
          background: ${ORANGE};
          color: #111827;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .member-table-row {
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .member-avatar-cell {
          display: flex;
          align-items: center;
        }
        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(249,115,22,0.18);
          color: #fdba74;
          font-weight: 800;
        }
        .member-avatar-pending {
          background: rgba(148,163,184,0.16);
          color: #cbd5e1;
        }
        .member-meta,
        .danger-row,
        .company-profile-head {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .member-meta,
        .company-profile-head {
          align-items: flex-start;
          flex-direction: column;
        }
        .member-meta span,
        .member-muted,
        .danger-row span,
        .company-profile-head span {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }
        .company-profile-card {
          display: grid;
          gap: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 20px;
          background: rgba(255,255,255,0.02);
        }
        .company-logo-wrap {
          position: relative;
          width: 72px;
          height: 72px;
        }
        .company-logo-image,
        .company-logo-fallback {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          object-fit: cover;
          background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.06));
          display: grid;
          place-items: center;
          color: #fdba74;
          font-size: 24px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .icon-upload-button {
          position: absolute;
          right: -6px;
          bottom: -6px;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: ${ORANGE};
          color: #111827;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .form-grid label,
        .full-width-field {
          display: grid;
          gap: 8px;
        }
        .form-grid span,
        .full-width-field span,
        .danger-title {
          font-size: 13px;
          font-weight: 700;
          color: #e5e7eb;
        }
        .form-grid input,
        .full-width-field input,
        .full-width-field textarea {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 13px 14px;
          background: #0d0d0d;
          color: #f8fafc;
          font: inherit;
          resize: vertical;
          box-sizing: border-box;
        }
        .primary-button,
        .ghost-button,
        .danger-button {
          border-radius: 12px;
          padding: 11px 16px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
        }
        .primary-button {
          background: ${ORANGE};
          color: #111827;
        }
        .primary-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .ghost-button {
          background: rgba(255,255,255,0.04);
          color: #e5e7eb;
          border-color: rgba(255,255,255,0.08);
        }
        .danger-shell {
          border-color: rgba(239,68,68,0.35);
        }
        .danger-list {
          display: grid;
          gap: 14px;
          margin-top: 14px;
        }
        .danger-row {
          justify-content: space-between;
          flex-wrap: wrap;
          border: 1px solid rgba(239,68,68,0.28);
          border-radius: 16px;
          padding: 16px;
          background: rgba(127,29,29,0.10);
        }
        .danger-button {
          background: rgba(239,68,68,0.14);
          color: #fecaca;
          border-color: rgba(239,68,68,0.28);
        }
        .studio-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .studio-card {
          border-radius: 18px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          display: grid;
          gap: 10px;
        }
        .studio-card span {
          color: #94a3b8;
          line-height: 1.6;
        }
        .studio-card-accent {
          background: linear-gradient(135deg, rgba(249,115,22,0.14), rgba(255,255,255,0.03));
        }
        .footer-note {
          margin-top: 14px;
          text-align: right;
          font-size: 12px;
        }
        .loading-text {
          min-height: 180px;
          display: grid;
          place-items: center;
        }
        .back-button:hover,
        .icon-button:hover,
        .profile-chip:hover,
        .quick-action-tile:hover,
        .ghost-button:hover,
        .primary-button:hover,
        .danger-button:hover,
        .icon-upload-button:hover {
          transform: translateY(-1px);
        }
        @media (max-width: 1100px) {
          .employer-shell,
          .metric-grid,
          .two-column-grid,
          .form-grid,
          .member-table {
            grid-template-columns: 1fr;
          }
          .workspace-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .workspace-hero,
          .workspace-topbar,
          .section-head,
          .section-head-row,
          .danger-row,
          .company-profile-head {
            align-items: flex-start;
            flex-direction: column;
          }
          .search-shell {
            min-width: 100%;
          }
        }
      `}</style>

      <div className="employer-shell">
        <aside className="workspace-sidebar">
          <div className="brand-lockup">
            <div className="brand-mark">J</div>
            <div>
              <strong>HomeTown Helper</strong>
              <span>Employer workspace</span>
            </div>
          </div>

          <div className="sidebar-company-card">
            <strong>{companyName}</strong>
            <span>{profile.website || 'Add your website in Company Settings'}</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => setActiveSection(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-profile-card">
            <strong>{displayName}</strong>
            <span>{profile.email || 'workspace owner'}</span>
          </div>
        </aside>

        <main className="workspace-main">
          <div className="workspace-topbar">
            <div className="topbar-left">
              <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
              <label className="search-shell">
                <Search size={16} />
                <input type="search" placeholder="Search workspace" readOnly />
              </label>
            </div>

            <div className="topbar-right">
              <button className="icon-button"><Bell size={18} /></button>
              <button className="profile-chip"><Crown size={18} color={ORANGE} /> {displayName}</button>
            </div>
          </div>

          {message ? <div className="section-shell" style={{ padding: '14px 18px', color: '#fdba74' }}>{message}</div> : null}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default EmployerWorkspace;
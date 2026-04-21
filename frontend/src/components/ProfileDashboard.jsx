import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  Users,
  Bell,
  MessageCircle,
  Calendar,
  Settings,
  UserCircle,
  CheckCircle2,
  Eye,
  Star,
} from 'lucide-react';
import '../styles/ProfileDashboard.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'suppliers', label: 'Suppliers', icon: Users },
  { id: 'buyers', label: 'Buyers', icon: Users },
  { id: 'contacts', label: 'Contacts', icon: MessageCircle },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'messages', label: 'Messages', icon: Bell },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const tabs = [
  'Account Settings',
  'Company Settings',
  'Documents',
  'Billing',
  'Notifications',
  'Security',
  'Activity',
  'Public Profile',
];

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('Account Settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="profile-shell">
      <aside className={`profile-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="profile-brand">
          <div className="brand-icon">HS</div>
          <div>
            <div className="brand-title">HelperSeeker</div>
            <div className="brand-subtitle">Employer dashboard</div>
          </div>
        </div>
        <nav className="profile-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className="profile-nav-item" type="button">
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="profile-main">
        <header className="profile-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <MenuIcon />
          </button>
          <div className="profile-search">
            <input type="search" placeholder="Search teams, opportunities, invoices..." aria-label="Search dashboard" />
          </div>
          <div className="profile-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="avatar-button" aria-label="User menu">
              <UserCircle size={20} />
              <span>Emma</span>
            </button>
          </div>
        </header>

        <section className="profile-hero">
          <div className="cover-gradient" aria-hidden="true" />
          <div className="profile-hero-content">
            <div>
              <h1>Profile settings</h1>
              <p>Manage your employer account, company profile, billing and security from one place.</p>
            </div>
            <button className="primary-button">Change Cover</button>
          </div>
        </section>

        <div className="profile-grid">
          <aside className="profile-card">
            <div className="avatar-stack">
              <div className="avatar-circle" aria-hidden="true">ES</div>
              <button className="upload-button" type="button">Upload avatar</button>
            </div>
            <h2>Emma Sullivan</h2>
            <p className="text-muted">Chief Talent Officer · BrightBridge Inc.</p>
            <div className="profile-stat-grid">
              <article>
                <span>Applied</span>
                <strong>128</strong>
              </article>
              <article>
                <span>Won</span>
                <strong>23</strong>
              </article>
              <article>
                <span>Current</span>
                <strong>7</strong>
              </article>
            </div>
            <a href="/public/u/emma-sullivan" className="profile-link">
              <Eye size={16} />
              View Public Profile
            </a>
          </aside>

          <section className="profile-content" aria-labelledby="profile-tabs-label">
            <div className="profile-tabs" role="tablist" aria-label="Profile sections">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={tab === activeTab ? 'tab active' : 'tab'}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={tab === activeTab}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="profile-panel">
              <div className="panel-heading">
                <h2>{activeTab}</h2>
                <button className="secondary-button">Save changes</button>
              </div>
              <div className="panel-body">
                <div className="panel-card">
                  <div className="panel-card-icon"><CheckCircle2 size={20} /></div>
                  <div>
                    <h3>Profile ready for action</h3>
                    <p>Use the tabs to keep your profile up to date and secure for buyers and suppliers.</p>
                  </div>
                </div>

                <div className="panel-grid">
                  <article>
                    <h3>Account</h3>
                    <p>Secure account settings, email, phone and locale.</p>
                  </article>
                  <article>
                    <h3>Company</h3>
                    <p>Brand details, social links, industry and team information.</p>
                  </article>
                  <article>
                    <h3>Documents</h3>
                    <p>Upload contracts, certifications and invoices for review.</p>
                  </article>
                  <article>
                    <h3>Security</h3>
                    <p>Two-factor auth, sessions and API key controls.</p>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

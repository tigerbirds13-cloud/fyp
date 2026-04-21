
import React, { useState, useRef, useEffect } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import CategorySection from './CategorySection';
import PricingPage from './PricingPage';
import HeroSection from './HeroSection';
import SearchSection from './SearchSection';
import ServicesGrid from './ServicesGrid';
import ServiceDetailModal from './ServiceDetailModal';
import ContactSection from './ContactSection';
import FooterSection from './FooterSection';
import Navbar from './Navbar';
import RoleSelectionModal from './RoleSelectionModal';
import AdminDashboard from './AdminDashboard';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import ProfilePage from './ProfilePage';
import ChatbotWidget from './ChatbotWidget';
import { useAuth } from '../context/AuthContext';
import { GFONT } from './CommonUI';
import { SERVICES } from './constants';

export default function HomeTownHelper() {
  const { user, isLoggedIn, isAdmin, logout, isLoading } = useAuth();
  const [page, setPage] = useState("home");
  const [regRole, setRegRole] = useState("seeker");
  const [loginRole, setLoginRole] = useState("seeker");
  const [modalOpen, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState("All Locations");
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [catPage, setCatPage] = useState(0);
  const [pricingTab, setPTab] = useState("seeker");
  const [toast, setToast] = useState("");
  const [contactForm, setCF] = useState({ name: "", email: "", msg: "" });
  const [contactSent, setCSent] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [resetToken, setResetToken] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Check for reset token in URL
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'reset-password' && pathParts[2]) {
      setResetToken(pathParts[2]);
      setPage('reset-password');
    }
  }, []);

  const refs = { hero: useRef(), services: useRef(), categories: useRef(), pricing: useRef(), contact: useRef() };
  const scrollTo = (r) => r?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2800); };
  const resetFilters = () => { setSearch(""); setLocFilter("All Locations"); setActiveCat("All"); setActiveTab(0); };
  const handleServicesClick = () => { resetFilters(); scrollTo(refs.services); };

  const goRegister = (r) => { setRegRole(r); setModal(false); setPage("register"); };
  const goLogin = (r = "seeker") => { setLoginRole(r); setModal(false); setPage("login"); };
  const goProfile = () => setPage('profile');
  const handleLoginSuccess = (user) => {
    if (user?.role === 'admin') {
      setPage('admin');
      return;
    }
    setPage('home');
  };

  const handleLogout = () => {
    logout();
    setPage("home");
    showToast("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000' }}>
        <p style={{ color: '#fff', fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  if (isAdmin || page === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (page === 'profile') return <ProfilePage onBack={() => setPage('home')} />;
  if (page === "login") return <LoginPage isDark={isDark} initialRole={loginRole} onBack={() => setPage("home")} onGoRegister={goRegister} onLoginSuccess={handleLoginSuccess} onForgotPassword={() => setPage("forgot-password")} />;
  if (page === "register") return <RegisterPage isDark={isDark} role={regRole} onBack={() => setPage("home")} onSwitch={r => setRegRole(r)} />;
  if (page === "forgot-password") return <ForgotPasswordPage isDark={isDark} onBack={() => setPage("login")} />;
  if (page === "reset-password") return <ResetPasswordPage isDark={isDark} token={resetToken} onBack={() => setPage("login")} />;

  const filtered = SERVICES.filter(s => {
    const mc = activeCat === "All" || s.category === activeCat;
    const ml = locFilter === "All Locations" || s.location === locFilter;
    const ms = !search || [s.name, s.role, ...s.tags].some(x => x.toLowerCase().includes(search.toLowerCase()));
    if (activeTab === 1) return mc && ms;
    if (activeTab === 2) return ml && ms;
    return mc && ml && ms;
  });

  const sendContact = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.msg) return showToast("Please fill all contact fields.");
    setCSent(true); setCF({ name: "", email: "", msg: "" });
    setTimeout(() => setCSent(false), 3000);
    showToast("Message sent! We'll get back to you soon.");
  };

  return (
    <div style={{ fontFamily: "'Syne','DM Sans',sans-serif", background: isDark ? "#000" : "#fff", minHeight: "100vh" }}>
      <style>{`
        ${GFONT}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes fadeIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pill-tl{animation:float1 3.2s ease-in-out infinite}
        .pill-tr{animation:float2 3.8s ease-in-out infinite}
        .pill-bl{animation:float2 2.9s ease-in-out infinite}
        .pill-br{animation:float1 3.5s ease-in-out infinite}
        .modal-anim{animation:fadeIn 0.22s ease}
        .role-card:hover{transform:translateY(-2px);border-color:#22c55e !important}
        .svc-card:hover{box-shadow:0 4px 18px rgba(34,197,94,0.12);border-color:#22c55e55 !important;transform:translateY(-2px)}
        .nav-lnk:hover{color:#22c55e !important}
        .tab-btn:hover{color:#22c55e !important}
        .foot-lnk:hover{color:#22c55e !important}
        .price-card:hover{transform:translateY(-3px)}
        .book-btn:hover{opacity:0.88}
        .toast-box{animation:slideUp 0.3s ease; background:${isDark ? "#22c55e" : "#16a34a"} !important;}
        * { transition-property:color,border-color,background-color,transform,opacity,box-shadow; transition-duration:0.3s; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${isDark ? "#0a0a0a" : "#f1f1f1"}; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "#2d2d2d" : "#ccc"}; border-radius: 10px; border: 2px solid ${isDark ? "#0a0a0a" : "#f1f1f1"}; }
        ::-webkit-scrollbar-thumb:hover { background: #22c55e; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="toast-box" style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#fff", fontFamily: "DM Sans", fontWeight: 600, fontSize: 14, padding: "12px 28px", borderRadius: 999, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <Navbar isDark={isDark} setIsDark={setIsDark} scrollTo={scrollTo} refs={refs} goLogin={goLogin} setModal={setModal} onServicesClick={handleServicesClick} onProfile={isLoggedIn ? goProfile : undefined} />

      <HeroSection isDark={isDark} heroRef={refs.hero} setModal={setModal} />

      {modalOpen && <RoleSelectionModal isDark={isDark} setModal={setModal} goRegister={goRegister} goLogin={goLogin} />}

      <SearchSection 
        isDark={isDark}
        search={search} setSearch={setSearch} 
        locFilter={locFilter} setLocFilter={setLocFilter} 
        activeCat={activeCat} setActiveCat={setActiveCat} 
        showToast={showToast} scrollToServices={() => scrollTo(refs.services)} 
      />

      <div ref={refs.categories}>
        <CategorySection isDark={isDark} activeCat={activeCat} setActiveCat={setActiveCat} catPage={catPage} setCatPage={setCatPage} scrollToServices={() => scrollTo(refs.services)} />
      </div>

      <ServicesGrid 
        isDark={isDark}
        servicesRef={refs.services} 
        filtered={filtered} 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        showToast={showToast} 
        setSearch={setSearch} setActiveCat={setActiveCat} setLocFilter={setLocFilter}
        selectedService={selectedService} setSelectedService={setSelectedService}
      />

      <div ref={refs.pricing}>
        <PricingPage isDark={isDark} pricingTab={pricingTab} setPTab={setPTab} goRegister={goRegister} />
      </div>

      <ContactSection 
        isDark={isDark}
        contactRef={refs.contact} 
        contactForm={contactForm} setCF={setCF} 
        contactSent={contactSent} sendContact={sendContact} 
      />

      <FooterSection isDark={isDark} scrollTo={scrollTo} refs={refs} showToast={showToast} goRegister={goRegister} onServicesClick={handleServicesClick} />
      <ChatbotWidget isDark={isDark} userRole={user?.role || localStorage.getItem('userRole') || 'seeker'} />

      {modalOpen && <RoleSelectionModal isDark={isDark} setModal={setModal} goRegister={goRegister} goLogin={goLogin} />}
      {selectedService && <ServiceDetailModal isDark={isDark} service={selectedService} onClose={() => setSelectedService(null)} showToast={showToast} />}
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import CategorySection from "./CategorySection";
import PricingPage from "./PricingPage";
import HeroSection from "./HeroSection";
import SearchSection from "./SearchSection";
import ServicesGrid from "./ServicesGrid";
import ServiceDetailModal from "./ServiceDetailModal";
import ContactSection from "./ContactSection";
import FooterSection from "./FooterSection";
import Navbar from "./Navbar";
import RoleSelectionModal from "./RoleSelectionModal";
import AdminDashboard from "./AdminDashboard";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import ProfilePage from "./ProfilePage";
import ChatbotWidget from "./ChatbotWidget";
import PaymentCallbackModal from "./PaymentCallbackModal";
import InfoPage from "./InfoPage";
import { useAuth } from "../context/AuthContext";
import { GFONT } from "./CommonUI";
import { SERVICES } from "./constants";

export default function HomeTownHelper() {
  const INFO_PAGES = new Set(["features", "about", "privacy", "terms"]);
  const { user, isLoggedIn, isAdmin, logout, isLoading } = useAuth();
  const [page, setPage] = useState("home");
  const [regRole, setRegRole] = useState("seeker");
  const [loginRole, setLoginRole] = useState("seeker");
  const [modalOpen, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentCallback, setPaymentCallback] = useState(null);
  const [locFilter, setLocFilter] = useState("All Locations");
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [catPage, setCatPage] = useState(0);
  const [pricingTab, setPTab] = useState("seeker");
  const [toast, setToast] = useState("");
  const [contactForm, setCF] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    msg: "",
  });
  const [contactSent, setCSent] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [resetToken, setResetToken] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState(SERVICES);
  const [isSearching, setIsSearching] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [authEmail, setAuthEmail] = useState("");

  useEffect(() => {
    // Check for reset token in URL
    const pathParts = window.location.pathname.split("/");
    if (pathParts[1] === "reset-password" && pathParts[2]) {
      setResetToken(pathParts[2]);
      if (isLoggedIn) {
        setPage("reset-password");
      } else {
        setLoginRole("seeker");
        setPage("login");
      }
    }

    const params = new URLSearchParams(window.location.search);
    const pidx = params.get("pidx");

    if (pidx) {
      setPaymentCallback({
        method: "khalti",
        context: params.get("paymentContext") || "booking",
        plan: params.get("plan") || "",
        userType: params.get("userType") || "",
        pidx,
        status: params.get("status") || "",
        purchase_order_id: params.get("purchase_order_id") || "",
        transaction_id:
          params.get("transaction_id") || params.get("txnId") || "",
        amount: params.get("amount") || "",
        mobile: params.get("mobile") || "",
      });
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    const emailVerification = params.get("emailVerification");
    if (emailVerification) {
      const nextNotice =
        emailVerification === "success"
          ? "Email verified successfully. You can sign in now."
          : emailVerification === "invalid"
            ? "That verification link is invalid or expired. Request a new one below."
            : "We could not verify your email right now. Please request a new link.";

      setLoginRole("seeker");
      setAuthNotice(nextNotice);
      setPage("login");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setCF((current) => ({
      ...current,
      name: current.name || user?.name || "",
      email: current.email || user?.email || "",
    }));
  }, [user?.name, user?.email]);

  // Fetch services and jobs from API with optional filters
  const fetchServicesWithFilters = async (
    searchQuery = "",
    categoryFilter = "All",
    locationFilter = "All Locations",
  ) => {
    try {
      setIsSearching(true);
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery && searchQuery.trim())
        params.append("search", searchQuery);
      if (categoryFilter && categoryFilter !== "All")
        params.append("category", categoryFilter);
      if (locationFilter && locationFilter !== "All Locations")
        params.append("location", locationFilter);

      const url = `/api/jobs${params.toString() ? "?" + params.toString() : ""}`;
      const res = await axios.get(url);
      const jobsData = res.data?.data?.jobs || [];

      // Convert API data to display format
      const convertedServices = jobsData.map((item, index) => {
        const isService = item.source === "service";
        const providerName = item.provider?.name || "Helper";

        return {
          id: item._id,
          name: providerName,
          avatar: providerName.substring(0, 2).toUpperCase(),
          color: [
            "#16a34a",
            "#0891b2",
            "#7c3aed",
            "#db2777",
            "#ea580c",
            "#0d9488",
            "#65a30d",
            "#9333ea",
            "#b45309",
            "#e11d48",
            "#0369a1",
            "#15803d",
          ][index % 12],
          role: isService ? item.name : "Job Posting",
          category: item.category?.name || "Other",
          location: item.location || "Remote",
          tags: isService
            ? item.tags || []
            : item.requirements || item.tags || [],
          rating: item.provider?.rating || 4.5,
          jobs: item.provider?.totalJobs || 0,
          // Keep original data for reference
          _id: item._id,
          isService,
          originalData: item,
        };
      });

      setServices(convertedServices);
      setIsSearching(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to static data
      setServices(SERVICES);
      setIsSearching(false);
    }
  };

  // Initial load - fetch without filters
  useEffect(() => {
    fetchServicesWithFilters();
  }, []);

  // Auto-fetch when category or location changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetchServicesWithFilters(search, activeCat, locFilter).then(() => {
        setIsSearching(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCat, locFilter]);

  const refs = {
    hero: useRef(),
    findHelp: useRef(),
    services: useRef(),
    categories: useRef(),
    pricing: useRef(),
    contact: useRef(),
  };
  const scrollTo = (r) =>
    r?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2800);
  };
  const resetFilters = () => {
    setSearch("");
    setLocFilter("All Locations");
    setActiveCat("All");
    setActiveTab(0);
  };
  const handleServicesClick = () => {
    resetFilters();
    scrollTo(refs.services);
  };

  const goRegister = (r) => {
    setAuthNotice("");
    setAuthEmail("");
    setRegRole(r);
    setModal(false);
    setPage("register");
  };
  const goLogin = (r = "seeker") => {
    const nextRole = typeof r === "string" && r ? r : "seeker";
    setAuthNotice("");
    setAuthEmail("");
    setLoginRole(nextRole);
    setModal(false);
    setPage("login");
  };
  const handleRegistered = (email) => {
    setAuthEmail(email || "");
    setAuthNotice(
      "Account created. Check your inbox for the verification link, then sign in.",
    );
    setLoginRole(regRole || "seeker");
    setPage("login");
  };
  const goProfile = () => setPage("profile");
  const openInfoPage = (nextPage) => {
    if (INFO_PAGES.has(nextPage)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setPage(nextPage);
    }
  };
  const handleLoginSuccess = (user) => {
    setAuthNotice("");
    setAuthEmail("");
    if (user?.role === "admin") {
      setPage("admin");
      return true;
    }

    if (resetToken) {
      setPage("reset-password");
      return true;
    }

    setPage("home");
    return true;
  };

  const handleLogout = () => {
    logout();
    setPage("home");
    showToast("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#000",
        }}
      >
        <p style={{ color: "#fff", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  if (isAdmin || page === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (INFO_PAGES.has(page)) {
    return (
      <InfoPage
        isDark={isDark}
        pageKey={page}
        onBack={() => setPage("home")}
        onPrimaryAction={() => {
          setPage("home");
          setTimeout(() => scrollTo(refs.services), 0);
        }}
      />
    );
  }

  if (page === "profile") return <ProfilePage onBack={() => setPage("home")} />;
  if (page === "login")
    return (
      <LoginPage
        isDark={isDark}
        initialRole={loginRole}
        notice={authNotice}
        initialEmail={authEmail}
        onBack={() => {
          setAuthNotice("");
          setPage("home");
        }}
        onGoRegister={goRegister}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setPage("forgot-password")}
      />
    );
  if (page === "login-google")
    return (
      <LoginPage
        isDark={isDark}
        initialRole={loginRole}
        autoGoogle={true}
        notice={authNotice}
        initialEmail={authEmail}
        onBack={() => {
          setAuthNotice("");
          setPage("home");
        }}
        onGoRegister={goRegister}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setPage("forgot-password")}
      />
    );
  if (page === "register")
    return (
      <RegisterPage
        isDark={isDark}
        role={regRole}
        onBack={() => setPage("home")}
        onSwitch={(r) => setRegRole(r)}
        onRegistered={handleRegistered}
      />
    );
  if (page === "forgot-password")
    return (
      <ForgotPasswordPage isDark={isDark} onBack={() => setPage("login")} />
    );
  if (page === "reset-password") {
    if (!isLoggedIn) {
      return (
        <LoginPage
          isDark={isDark}
          initialRole={loginRole}
          notice={authNotice}
          initialEmail={authEmail}
          onBack={() => {
            setAuthNotice("");
            setPage("home");
          }}
          onGoRegister={goRegister}
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={() => setPage("forgot-password")}
        />
      );
    }
    return (
      <ResetPasswordPage
        isDark={isDark}
        token={resetToken}
        onBack={() => setPage("login")}
      />
    );
  }

  const filtered = services.filter((s) => {
    const mc = activeCat === "All" || s.category === activeCat;
    const ml = locFilter === "All Locations" || s.location === locFilter;
    const ms =
      !search ||
      [s.name, s.role, ...s.tags].some((x) =>
        x.toLowerCase().includes(search.toLowerCase()),
      );
    if (activeTab === 1) return mc && ms;
    if (activeTab === 2) return ml && ms;
    return mc && ml && ms;
  });

  const sendContact = async () => {
    const payload = {
      name: (contactForm.name || "").trim(),
      email: (contactForm.email || "").trim().toLowerCase(),
      subject: (contactForm.subject || "").trim(),
      message: (contactForm.msg || "").trim(),
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      showToast("Please fill name, email, subject and message.");
      return;
    }

    if (!emailPattern.test(payload.email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to send message. Please try again.",
        );
      }

      setCSent(true);
      setCF({
        name: user?.name || "",
        email: user?.email || "",
        company: "",
        phone: "",
        subject: "",
        msg: "",
      });
      setTimeout(() => setCSent(false), 3000);
      showToast(data?.message || "Message sent! We'll get back to you soon.");
    } catch (error) {
      showToast(error.message || "Unable to send message right now.");
    }
  };

  const requireLoginForBooking = () => {
    if (isLoggedIn) return true;
    showToast("Please sign in first to continue booking.");
    setLoginRole("seeker");
    setPage("login");
    return false;
  };

  return (
    <div
      style={{
        fontFamily: "'Syne','DM Sans',sans-serif",
        background: isDark ? "#000" : "#fff",
        minHeight: "100vh",
      }}
    >
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

      {/* Payment Callback Modal */}
      {paymentCallback && (
        <PaymentCallbackModal
          isDark={isDark}
          callbackParams={paymentCallback}
          onClose={() => setPaymentCallback(null)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div
          className="toast-box"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#22c55e",
            color: "#fff",
            fontFamily: "DM Sans",
            fontWeight: 600,
            fontSize: 14,
            padding: "12px 28px",
            borderRadius: 999,
            zIndex: 9999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        scrollTo={scrollTo}
        refs={refs}
        goLogin={goLogin}
        setModal={setModal}
        onServicesClick={handleServicesClick}
        onProfile={isLoggedIn ? goProfile : undefined}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <HeroSection isDark={isDark} heroRef={refs.hero} setModal={setModal} />

      <div ref={refs.findHelp}>
        <SearchSection
          isDark={isDark}
          search={search}
          setSearch={setSearch}
          locFilter={locFilter}
          setLocFilter={setLocFilter}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          showToast={showToast}
          scrollToServices={() => scrollTo(refs.services)}
          onSearch={(searchTerm, category, location) => {
            fetchServicesWithFilters(searchTerm, category, location);
            showToast(
              `Searching for "${searchTerm || "all services"}" in ${location}${category !== "All" ? " - " + category : ""}`,
            );
            setTimeout(() => scrollTo(refs.services), 300);
          }}
        />
      </div>

      <div ref={refs.categories}>
        <CategorySection
          isDark={isDark}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          catPage={catPage}
          setCatPage={setCatPage}
          scrollToServices={() => scrollTo(refs.services)}
          mergedWithSearch
        />
      </div>

      <ServicesGrid
        isDark={isDark}
        servicesRef={refs.services}
        filtered={filtered}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showToast={showToast}
        isLoggedIn={isLoggedIn}
        onRequireLogin={requireLoginForBooking}
        setSearch={setSearch}
        setActiveCat={setActiveCat}
        setLocFilter={setLocFilter}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />

      <div ref={refs.pricing}>
        <PricingPage
          isDark={isDark}
          pricingTab={pricingTab}
          setPTab={setPTab}
          goRegister={goRegister}
        />
      </div>

      <ContactSection
        isDark={isDark}
        contactRef={refs.contact}
        contactForm={contactForm}
        setCF={setCF}
        contactSent={contactSent}
        sendContact={sendContact}
      />

      <FooterSection
        isDark={isDark}
        scrollTo={scrollTo}
        refs={refs}
        showToast={showToast}
        goRegister={goRegister}
        onServicesClick={handleServicesClick}
        onOpenPage={openInfoPage}
      />
      <ChatbotWidget
        isDark={isDark}
        userRole={user?.role || localStorage.getItem("userRole") || "seeker"}
      />

      {modalOpen && (
        <RoleSelectionModal
          isDark={isDark}
          setModal={setModal}
          goRegister={goRegister}
          goLogin={goLogin}
        />
      )}
      {selectedService && (
        <ServiceDetailModal
          isDark={isDark}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          showToast={showToast}
          isLoggedIn={isLoggedIn}
          onRequireLogin={requireLoginForBooking}
          userProfile={user}
        />
      )}
    </div>
  );
}

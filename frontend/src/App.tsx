import { useState, useEffect } from "react";
import ComposeMail from "./pages/ComposeMail.tsx";
import FolderView from "./pages/FolderView.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import CreateCampaign from "./pages/CreateCampaign.tsx";
import CampaignDetail from "./pages/CampaignDetail.tsx";
import CampaignAnalyticsReport from "./pages/CampaignAnalyticsReport.tsx";
import Templates from "./pages/Templates.tsx";
import SurveyFormPage from "./pages/SurveyFormPage.tsx";
import SurveyTemplates from "./pages/SurveyTemplates.tsx";
import SurveyViewPage from "./pages/SurveyViewPage.tsx";
import LandingPagesList from "./pages/LandingPagesList.tsx";
import StandaloneLandingPage from "./pages/StandaloneLandingPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import TailwindTest from "./components/TailwindTest.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import axios from "axios";
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Shield, 
  Trash2, 
  Clipboard, 
  Megaphone, 
  Globe,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";

type ViewKey =
  | "compose"
  | "inbox"
  | "sent"
  | "draft"
  | "spam"
  | "trash"
  | "templates"
  | "campaigns"
  | "campaignCreate"
  | "campaignDetail"
  | "campaignAnalyticsReport"
  | "surveyForm"
  | "surveyTemplates"
  | "surveyView"
  | "landingPages"
  | "profile"
  | "tailwind-test";

function App() {
  // Load active view from localStorage on initial load
  const getInitialView = (): ViewKey => {
    const savedView = localStorage.getItem('activeView');
    return (savedView as ViewKey) || "compose"; // Default to compose if no saved view
  };

  const [activeView, setActiveView] = useState<ViewKey>(getInitialView());
  const [composeInitial, setComposeInitial] = useState<any | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [surveyParams, setSurveyParams] = useState<{surveyId?: string, emailId?: string, recipientEmail?: string} | null>(null);
  const [isStandalonePage, setIsStandalonePage] = useState(false);
  // Load sidebar state from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeView'); // Clear active view on logout
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setActiveView("compose");
  };

  // Check if we're on a standalone landing page or survey page
  useEffect(() => {
    const path = window.location.pathname;
    
    // Check for auth routes
    if (path === '/auth' || path === '/') {
      if (isAuthenticated) {
        setActiveView("compose");
      } else {
        // Show auth page
        return;
      }
    }
    
    // Check for landing page routes
    if (path.includes('/landing-page/')) {
      setIsStandalonePage(true);
      return;
    }
    
    // Check for survey form routes
    if (path.includes('/survey/')) {
      setIsStandalonePage(true);
      // Extract survey parameters
      const urlParams = new URLSearchParams(window.location.search);
      const pathParts = path.split('/');
      const surveyId = pathParts[pathParts.length - 1];
      
      setSurveyParams({
        surveyId: surveyId !== 'survey' ? surveyId : undefined,
        emailId: urlParams.get('emailId') || undefined,
        recipientEmail: urlParams.get('email') || undefined
      });
      setActiveView("surveyForm");
      return;
    }
    
    setIsStandalonePage(false);
  }, [isAuthenticated]);

  // If not authenticated and not on auth page, show auth page
  if (!isAuthenticated && !isStandalonePage) {
    return <AuthPage />;
  }

  // If we're on a standalone page, render it directly
  if (isStandalonePage) {
    if (window.location.pathname.includes('/landing-page/')) {
      return <StandaloneLandingPage />;
    }
    
    if (window.location.pathname.includes('/survey/')) {
      return (
        <SurveyFormPage
          surveyId={surveyParams?.surveyId}
          emailId={surveyParams?.emailId}
          recipientEmail={surveyParams?.recipientEmail}
        />
      );
    }
  }

  const openCompose = (initialData: any | null) => {
    setComposeInitial(initialData || null);
    setActiveView("compose");
  };

  const renderContent = () => {
    switch (activeView) {
      case "compose":
        return <ComposeMail initialData={composeInitial} />;
      case "inbox":
        return <div className="placeholder-view">Inbox view (coming soon)</div>;
      case "sent":
        return <FolderView folder="sent" onOpenCompose={openCompose} />;
      case "draft":
        return <FolderView folder="draft" onOpenCompose={openCompose} />;
      case "spam":
        return <div className="placeholder-view">Spam view (coming soon)</div>;
      case "trash":
        return <FolderView folder="trash" onOpenCompose={openCompose} />;
      case "templates":
        return <Templates onUseTemplate={openCompose} />;
      case "campaigns":
        return (
          <Campaigns
            onStartCreate={() => setActiveView("campaignCreate")}
            onOpenDetail={(campaign) => {
              setSelectedCampaign(campaign);
              setActiveView("campaignDetail");
            }}
          />
        );
      case "campaignCreate":
        return (
          <CreateCampaign onDone={() => setActiveView("campaigns")} />
        );
      case "campaignDetail":
        if (!selectedCampaign) return null;
        return (
          <CampaignDetail
            campaignId={String(selectedCampaign._id || selectedCampaign.id)}
            campaignName={selectedCampaign.name || ""}
            campaignNumber={selectedCampaign.campaignNumber}
            onBack={() => setActiveView("campaigns")}
            onAnalyticsReport={() => setActiveView("campaignAnalyticsReport")}
          />
        );
      case "campaignAnalyticsReport":
        if (!selectedCampaign) return null;
        return (
          <CampaignAnalyticsReport
            campaignId={String(selectedCampaign._id || selectedCampaign.id)}
            campaignName={selectedCampaign.name || ""}
            campaignNumber={selectedCampaign.campaignNumber}
            onBack={() => setActiveView("campaignDetail")}
          />
        );
      case "surveyForm":
        return (
          <SurveyFormPage
            surveyId={surveyParams?.surveyId}
            emailId={surveyParams?.emailId}
            recipientEmail={surveyParams?.recipientEmail}
          />
        );
      case "surveyTemplates":
        return <SurveyTemplates onNavigate={setActiveView} />;
      case "surveyView":
        return <SurveyViewPage onNavigate={setActiveView} />;
      case "landingPages":
        return <LandingPagesList />;
      case "profile":
        return <UserProfile />;
      case "tailwind-test":
        return <TailwindTest />;
      default:
        return null;
    }
  };

  const navItems: { key: ViewKey; label: string; icon: React.ReactNode }[] = [
    { key: "compose", label: "Compose", icon: <Mail size={18} /> },
    { key: "inbox", label: "Inbox", icon: <Inbox size={18} /> },
    { key: "sent", label: "Sent", icon: <Send size={18} /> },
    { key: "draft", label: "Draft", icon: <FileText size={18} /> },
    { key: "spam", label: "Spam", icon: <Shield size={18} /> },
    { key: "trash", label: "Trash", icon: <Trash2 size={18} /> },
    { key: "templates", label: "Template", icon: <Clipboard size={18} /> },
    { key: "campaigns", label: "Campaign", icon: <Megaphone size={18} /> },
    { key: "landingPages", label: "Landing Pages", icon: <Globe size={18} /> },
    // { key: "surveyForm", label: "Survey Form", icon: <FileText size={18} /> },
    { key: "surveyTemplates", label: "Survey Templates", icon: <Clipboard size={18} /> },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-title">Mail Marketing</div>
        <div className="header-meta">Simple email campaign console</div>
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginLeft: 'auto'
          }}>
            <button
              onClick={() => setActiveView('profile')}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6b7280',
                fontSize: '14px',
                textDecoration: 'none'
              }}
              title="View Profile"
            >
              <User size={16} />
              <span>{user.firstName} {user.lastName}</span>
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#6b7280',
                fontSize: '14px'
              }}
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="layout-body">
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Toggle Button */}
          <div className="sidebar-toggle">
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                alignSelf: isSidebarCollapsed ? 'center' : 'flex-end'
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="nav-list">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  activeView === item.key ? "nav-item active" : "nav-item"
                }
                onClick={() => setActiveView(item.key)}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isSidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className={`main-panel ${isSidebarCollapsed ? 'full-width' : ''}`}>
          <ProtectedRoute>
            {renderContent()}
          </ProtectedRoute>
        </main>
      </div>
    </div>
  );
}

export default App;
